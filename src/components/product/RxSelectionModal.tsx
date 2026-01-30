import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import type { RxCartMetadata } from '../../types';
import { LENS_PACKAGES, RX_RANGES, generateOptions } from '../../lib/rxConstants';
import { Upload, Edit, HelpCircle, ArrowRight, ArrowLeft, Check, Info, X } from 'lucide-react';
import clsx from 'clsx';

interface RxSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (metadata: RxCartMetadata) => void;
    currentMetadata?: RxCartMetadata;
    initialPackageId?: string;
}

export default function RxSelectionModal({ isOpen, onClose, onSave, initialPackageId }: RxSelectionModalProps) {
    const { t, i18n } = useTranslation();
    const { addToast } = useToast();
    const lang = (i18n.language || 'en') as 'he' | 'ar' | 'en';
    const isRTL = lang === 'he' || lang === 'ar';

    const [step, setStep] = useState<'method' | 'details' | 'package'>('method');
    const [method, setMethod] = useState<'upload' | 'manual' | 'help'>('upload');
    const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPackageId || 'standard');

    // Manual Entry State
    const [manualData, setManualData] = useState({
        od_sph: '',
        os_sph: '',
        pd: '',
        has_astigmatism: false,
        od_cyl: '',
        os_cyl: '',
        od_axis: '',
        os_axis: ''
    });

    // Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadUrl, setUploadUrl] = useState<string | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    // Sync initialPackageId prop to state
    useEffect(() => {
        if (initialPackageId) {
            setSelectedPackageId(initialPackageId);
        }
    }, [initialPackageId]);

    // Cleanup object URL on unmount (if we used object URLs, but we use Supabase URLs)
    // No cleanup needed for now.

    if (!isOpen) return null;

    // Options
    const sphOptions = generateOptions(RX_RANGES.SPH.min, RX_RANGES.SPH.max, RX_RANGES.SPH.step, true);
    const cylOptions = generateOptions(RX_RANGES.CYL.min, RX_RANGES.CYL.max, RX_RANGES.CYL.step, false);
    const axisOptions = generateOptions(RX_RANGES.AXIS.min, RX_RANGES.AXIS.max, RX_RANGES.AXIS.step, false);
    const pdOptions = generateOptions(RX_RANGES.PD.min, RX_RANGES.PD.max, RX_RANGES.PD.step, false);

    const handleMethodSelect = (m: 'upload' | 'manual' | 'help') => {
        setMethod(m);
        if (m === 'help') {
            window.open('https://wa.me/972500000000', '_blank');
        } else {
            setStep('details');
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `prescriptions/temp/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('rx-uploads')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('rx-uploads').getPublicUrl(filePath);
            setUploadUrl(data.publicUrl);
            setUploadFile(file);
            addToast(t('rx.uploadSuccess', 'File uploaded successfully'), 'success');
        } catch (error: any) {
            console.error('Rx Upload Error:', error);
            addToast(t('rx.uploadError', 'Failed to upload'), 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const validateDetails = () => {
        if (method === 'upload') {
            if (!uploadUrl && !uploadFile) {
                addToast(t('rx.error.uploadRequired', 'Please upload a file'), 'error');
                return false;
            }
            return true;
        }
        if (method === 'manual') {
            if (!manualData.od_sph || !manualData.os_sph) {
                // If PD is missing, remind user (optional or required based on business rule)
                // Assuming SPH is strictly required. PD can be optional if we default to avg.
                // But let's enforce SPH at least.
                addToast(t('rx.error.sphRequired', 'Please fill SPH'), 'error');
                return false;
            }
            // PD check
            if (!manualData.pd) {
                addToast(t('rx.error.pdRequired', 'Please enter PD'), 'error');
                return false;
            }
            return true;
        }
        return true;
    };

    const handleSave = () => {
        // Use prop if available, else state (though logic below for "Next" handles flow)
        const pkgId = initialPackageId || selectedPackageId;
        const pkg = LENS_PACKAGES.find(p => p.id === pkgId);

        // Construct simplified metadata
        const metadata: RxCartMetadata = {
            with_lenses: true,
            lens_package: pkgId,
            lens_package_label: isRTL
                ? (lang === 'ar' ? pkg?.label_ar : pkg?.label_he)
                : pkg?.label_en,
            lens_price_addon: pkg?.price_addon || 0,
            rx_method: method as 'upload' | 'manual' | 'help',
            rx_upload_url: uploadUrl || undefined,
            rx_manual: method === 'manual' ? {
                od_sph: manualData.od_sph,
                os_sph: manualData.os_sph,
                pd: manualData.pd,
                // Only include astigmatism data if checked
                od_cyl: manualData.has_astigmatism ? manualData.od_cyl : undefined,
                os_cyl: manualData.has_astigmatism ? manualData.os_cyl : undefined,
                od_axis: manualData.has_astigmatism ? manualData.od_axis : undefined,
                os_axis: manualData.has_astigmatism ? manualData.os_axis : undefined
            } : undefined
        };

        onSave(metadata);
        onClose();
    };

    const handleNextToPackageOrSave = () => {
        if (validateDetails()) {
            if (initialPackageId) {
                handleSave();
            } else {
                setStep('package');
            }
        }
    };

    const renderMethodStep = () => (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-center mb-6">{t('rx.chooseMethod', 'How do you want to provide your prescription?')}</h3>

            <button
                onClick={() => handleMethodSelect('upload')}
                className="w-full flex items-center p-4 border-2 border-slate-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Upload size={24} />
                </div>
                <div className={clsx("flex-1", isRTL ? "mr-4" : "ml-4")}>
                    <div className="font-bold text-slate-900 text-lg mb-1">{t('rx.method.upload', 'Upload Prescription Image')}</div>
                    <div className="text-sm text-green-600 font-medium">{t('rx.recommended', 'Recommended')}</div>
                </div>
            </button>

            <button
                onClick={() => handleMethodSelect('manual')}
                className="w-full flex items-center p-4 border-2 border-slate-200 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
            >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Edit size={24} />
                </div>
                <div className={clsx("flex-1", isRTL ? "mr-4" : "ml-4")}>
                    <div className="font-bold text-slate-900 text-lg mb-1">{t('rx.method.manual', 'Enter Numbers Manually')}</div>
                    <div className="text-sm text-slate-500">{t('rx.quickEntry', 'Quick Entry')}</div>
                </div>
            </button>

            <button
                onClick={() => window.open('https://wa.me/972500000000', '_blank')}
                className="w-full flex items-center p-4 border-2 border-slate-200 rounded-2xl hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            >
                <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center shrink-0">
                    <HelpCircle size={24} />
                </div>
                <div className={clsx("flex-1", isRTL ? "mr-4" : "ml-4")}>
                    <div className="font-bold text-slate-900 text-lg mb-1">{t('rx.method.help', "I don't know my prescription")}</div>
                    <div className="text-sm text-slate-500">{t('rx.contactUs', 'Book an exam / Chat with Us')}</div>
                </div>
            </button>
        </div>
    );

    const renderDetailsStep = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('method')} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
                    {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                </button>
                <h3 className="text-xl font-bold">{method === 'upload' ? t('rx.uploadTitle', 'Upload Prescription') : t('rx.manualTitle', 'Enter Details')}</h3>
            </div>

            {method === 'upload' && (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        id="modal-rx-upload"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                    />
                    <label htmlFor="modal-rx-upload" className="cursor-pointer block">
                        {isUploading ? (
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        ) : (
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-primary">
                                <Upload size={32} />
                            </div>
                        )}
                        <div className="font-bold text-lg mb-2">{t('rx.uploadPrompt', 'Click to Upload')}</div>
                        <p className="text-sm text-slate-500">JPG, PNG, PDF (Max 5MB)</p>
                    </label>

                    {uploadFile && (
                        <div className="mt-6 bg-green-50 text-green-700 p-3 rounded-lg flex items-center justify-center gap-2">
                            <Check size={18} />
                            <span className="font-medium">{t('rx.fileUploaded', 'File Uploaded')}</span>
                        </div>
                    )}
                </div>
            )}

            {method === 'manual' && (
                <div className="space-y-4">
                    {/* SPH Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{t('rx.od', 'OD')} - SPH</label>
                            <select className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:border-primary focus:ring-0" value={manualData.od_sph} onChange={e => setManualData({ ...manualData, od_sph: e.target.value })}>
                                <option value="">Select</option>
                                {sphOptions.map(v => <option key={`od-sph-${v}`} value={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">{t('rx.os', 'OS')} - SPH</label>
                            <select className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:border-primary focus:ring-0" value={manualData.os_sph} onChange={e => setManualData({ ...manualData, os_sph: e.target.value })}>
                                <option value="">Select</option>
                                {sphOptions.map(v => <option key={`os-sph-${v}`} value={v}>{v}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* PD */}
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-slate-700">PD</label>
                        <select className="w-full h-12 rounded-xl border-slate-200 bg-slate-50 focus:border-primary focus:ring-0" value={manualData.pd} onChange={e => setManualData({ ...manualData, pd: e.target.value })}>
                            <option value="">Select PD</option>
                            {pdOptions.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Info size={12} />
                            {t('rx.pdTip', "Don't know PD? Choose 'Upload' instead.")}
                        </p>
                    </div>

                    {/* Astigmatism Toggle */}
                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded w-5 h-5 text-primary focus:ring-primary" checked={manualData.has_astigmatism} onChange={e => setManualData({ ...manualData, has_astigmatism: e.target.checked })} />
                            <span className="font-bold text-slate-900">{t('rx.iHaveAstigmatism', 'I have Astigmatism (Cylinder)')}</span>
                        </label>
                    </div>

                    {/* CYL/AXIS */}
                    {manualData.has_astigmatism && (
                        <div className="bg-slate-50 p-4 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                            {/* Right Eye Astigmatism */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">{t('rx.od', 'OD')} CYL</label>
                                    <select className="w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring-0" value={manualData.od_cyl} onChange={e => setManualData({ ...manualData, od_cyl: e.target.value })}>
                                        <option value="">0.00</option>
                                        {cylOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">{t('rx.od', 'OD')} AXIS</label>
                                    <select className="w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring-0" value={manualData.od_axis} onChange={e => setManualData({ ...manualData, od_axis: e.target.value })} disabled={!manualData.od_cyl || manualData.od_cyl === '0.00'}>
                                        <option value="">-</option>
                                        {axisOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>
                            {/* Left Eye Astigmatism */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">{t('rx.os', 'OS')} CYL</label>
                                    <select className="w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring-0" value={manualData.os_cyl} onChange={e => setManualData({ ...manualData, os_cyl: e.target.value })}>
                                        <option value="">0.00</option>
                                        {cylOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">{t('rx.os', 'OS')} AXIS</label>
                                    <select className="w-full h-10 rounded-lg border-slate-200 focus:border-primary focus:ring-0" value={manualData.os_axis} onChange={e => setManualData({ ...manualData, os_axis: e.target.value })} disabled={!manualData.os_cyl || manualData.os_cyl === '0.00'}>
                                        <option value="">-</option>
                                        {axisOptions.map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Button onClick={handleNextToPackageOrSave} className="w-full h-12 text-lg font-bold" disabled={method === 'upload' && !uploadUrl}>
                {t('common.continue', 'Continue')}
            </Button>
        </div>
    );

    const renderPackageStep = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setStep('details')} className="p-2 -ml-2 rounded-full hover:bg-slate-100">
                    {isRTL ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
                </button>
                <h3 className="text-xl font-bold">{t('rx.selectPackage', 'Select Lenses')}</h3>
            </div>

            <div className="space-y-3">
                {LENS_PACKAGES.map(pkg => {
                    const price = pkg.price_addon;
                    return (
                        <label key={pkg.id} className={clsx("flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all", selectedPackageId === pkg.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:bg-slate-50")}>
                            <input type="radio" name="pkg" className="mt-1 w-5 h-5 text-primary focus:ring-primary" checked={selectedPackageId === pkg.id} onChange={() => setSelectedPackageId(pkg.id)} />
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-900 text-lg">{lang === 'ar' ? pkg.label_ar : (lang === 'he' ? pkg.label_he : pkg.label_en)}</span>
                                    <span className="font-bold text-primary">{price > 0 ? `+${price}₪` : 'Free'}</span>
                                </div>
                                <p className="text-sm text-slate-500">{lang === 'ar' ? pkg.description_ar : (lang === 'he' ? pkg.description_he : pkg.description_en)}</p>
                            </div>
                        </label>
                    );
                })}
            </div>

            <Button onClick={handleSave} className="w-full h-12 text-lg font-bold">
                {t('common.save', 'Save Choice')}
            </Button>
        </div>
    );

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            {/* Content */}
            <div className="bg-white pointer-events-auto w-full max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5 z-[110] relative">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl">
                    <h2 className="font-bold text-slate-800">{t('rx.modalTitle', 'Prescription Lenses')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {step === 'method' && renderMethodStep()}
                    {step === 'details' && renderDetailsStep()}
                    {step === 'package' && renderPackageStep()}
                </div>
            </div>
        </div>,
        document.body
    );
}
