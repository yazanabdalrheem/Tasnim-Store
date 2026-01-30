import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Edit, HelpCircle, Check, MessageCircle, Calendar, ArrowRight, ArrowLeft, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { LENS_PACKAGES, generateOptions, RX_RANGES } from '../../lib/rxConstants';
import type { RxCartMetadata } from '../../types';
import { useToast } from '../../context/ToastContext';

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
    const [step, setStep] = useState<'method' | 'details' | 'upload'>('method');

    const [selectedPackageId, setSelectedPackageId] = useState<string>(initialPackageId || LENS_PACKAGES[0].id);
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    // Manual Entry State
    const [manualData, setManualData] = useState({
        od_sph: '', os_sph: '', pd: '63',
        has_astigmatism: false,
        od_cyl: '', os_cyl: '', od_axis: '', os_axis: ''
    });

    // Upload State
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    const isRTL = i18n.language === 'he' || i18n.language === 'ar';
    const dir = isRTL ? 'rtl' : 'ltr';

    // Options for Selects
    const sphOptions = generateOptions(RX_RANGES.SPH.min, RX_RANGES.SPH.max, RX_RANGES.SPH.step, true);
    const cylOptions = generateOptions(RX_RANGES.CYL.min, RX_RANGES.CYL.max, RX_RANGES.CYL.step, false);
    const axisOptions = generateOptions(RX_RANGES.AXIS.min, RX_RANGES.AXIS.max, RX_RANGES.AXIS.step, false);
    const pdOptions = generateOptions(RX_RANGES.PD.min, RX_RANGES.PD.max, RX_RANGES.PD.step, false);


    useEffect(() => {
        if (isOpen) {
            setStep('method');
            if (initialPackageId) setSelectedPackageId(initialPackageId);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setShowHelpDialog(false);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, initialPackageId]);


    const handleSaveManual = () => {
        // Basic Validation
        if (!manualData.od_sph || !manualData.os_sph) {
            addToast(t('rx.basicRequired', 'Please fill SPH'), 'error');
            return;
        }
        if (!manualData.pd) {
            addToast(t('rx.basicRequired', 'Please fill PD'), 'error');
            return;
        }

        const pkg = LENS_PACKAGES.find(p => p.id === selectedPackageId);

        const metadata: RxCartMetadata = {
            with_lenses: true,
            lens_package: selectedPackageId,
            lens_package_label: isRTL ? (i18n.language === 'ar' ? pkg?.label_ar : pkg?.label_he) : pkg?.label_en,
            lens_price_addon: pkg?.price_addon || 0,
            rx_method: 'manual',
            rx_manual: {
                od_sph: manualData.od_sph,
                os_sph: manualData.os_sph,
                pd: manualData.pd,
                od_cyl: manualData.has_astigmatism ? manualData.od_cyl : undefined,
                os_cyl: manualData.has_astigmatism ? manualData.os_cyl : undefined,
                od_axis: manualData.has_astigmatism ? manualData.od_axis : undefined,
                os_axis: manualData.has_astigmatism ? manualData.os_axis : undefined
            }
        };
        onSave(metadata);
        onClose();
        addToast(t('cart.added'), 'success');
    };

    const handleUpload = async () => {
        if (!uploadedFile) {
            addToast(t('rx.uploadPrompt'), 'error');
            return;
        }

        try {
            setUploading(true);
            const fileExt = uploadedFile.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `prescriptions/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('prescriptions')
                .upload(filePath, uploadedFile);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('prescriptions')
                .getPublicUrl(filePath);

            const pkg = LENS_PACKAGES.find(p => p.id === selectedPackageId);

            const metadata: RxCartMetadata = {
                with_lenses: true,
                lens_package: selectedPackageId,
                lens_package_label: isRTL ? (i18n.language === 'ar' ? pkg?.label_ar : pkg?.label_he) : pkg?.label_en,
                lens_price_addon: pkg?.price_addon || 0,
                rx_method: 'upload',
                rx_upload_url: publicUrlData.publicUrl
            };

            onSave(metadata);
            onClose();
            addToast(t('rx.uploadSuccess'), 'success');

        } catch (error) {
            console.error(error);
            addToast(t('rx.uploadError'), 'error');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" dir={dir}>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Content */}
            <div className={clsx(
                "bg-white w-full max-w-lg rounded-t-[24px] sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]",
                "animate-in slide-in-from-bottom duration-300"
            )}>
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('rxModal.title', 'Prescription Lenses')}</h2>
                        {step !== 'method' && (
                            <button
                                onClick={() => setStep('method')}
                                className="text-sm text-gray-500 hover:text-primary mt-1 flex items-center gap-1"
                            >
                                {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                                {isRTL ? 'חזרה' : 'Back'}
                            </button>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar">

                    {/* Step 1: Method Selection */}
                    {step === 'method' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-6">
                                {t('rxModal.question', 'How would you like to provide your prescription?')}
                            </h3>

                            <div className="grid gap-4">
                                {/* Upload Option */}
                                <button
                                    onClick={() => setStep('upload')}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-primary/50 hover:bg-blue-50/50 transition-all group text-start relative overflow-hidden"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {t('rx.method.upload', 'Upload Prescription')}
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                {t('rxModal.upload.badge', 'Recommended')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{t('rx.uploadPrompt', 'Upload your prescription image')}</p>
                                    </div>
                                </button>

                                {/* Manual Option */}
                                <button
                                    onClick={() => setStep('details')}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-primary/50 hover:bg-blue-50/50 transition-all group text-start"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Edit size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900 flex items-center gap-2">
                                            {t('rx.method.manual', 'Enter Manually')}
                                            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                {t('rxModal.manual.badge', 'Quick Entry')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{t('rx.manualTitle', 'Enter your numbers directly')}</p>
                                    </div>
                                </button>

                                {/* I don't know option - Now opens Help Dialog */}
                                <button
                                    onClick={() => setShowHelpDialog(true)}
                                    className="flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 transition-all group text-start"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <HelpCircle size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-gray-900">
                                            {t('rxModal.help.title', 'I don’t know my prescription')}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                                            {t('rxModal.help.subtitle', 'Recommended to visit Tasnim Optic for exam')}
                                        </p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}


                    {/* Step 2: Details (Manual Entry) */}
                    {step === 'details' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
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
                                <label className="text-sm font-bold text-slate-700">{t('rx.pd')}</label>
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

                            <Button onClick={handleSaveManual} className="w-full py-4 text-lg mt-4 shadow-lg shadow-primary/20">
                                {t('rx.addToCart', 'Add to Cart')}
                            </Button>
                        </div>
                    )}


                    {/* Step 3: Upload */}
                    {step === 'upload' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
                            <div
                                className={clsx(
                                    "border-3 border-dashed rounded-3xl p-8 transition-all relative",
                                    uploadedFile ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-primary hover:bg-blue-50"
                                )}
                            >
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    {uploadedFile ? (
                                        <>
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-in zoom-in">
                                                <Check size={32} />
                                            </div>
                                            <div className="font-bold text-green-800">{uploadedFile.name}</div>
                                            <div className="text-sm text-green-600">{t('rx.fileUploaded')}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center">
                                                <Upload size={32} />
                                            </div>
                                            <div className="font-bold text-gray-900 text-lg">{t('rx.tapToUpload')}</div>
                                            <div className="text-sm text-gray-500">{t('rx.uploadTypes')}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <Button onClick={handleUpload} isLoading={uploading} disabled={!uploadedFile} className="w-full py-4 text-lg shadow-lg shadow-primary/20">
                                {t('rx.addToCart')}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Dialog Overlay */}
            {showHelpDialog && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHelpDialog(false)} />
                    <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 text-center relative z-10 shadow-2xl animate-in zoom-in-95 duration-200" dir={dir}>
                        <div className="w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <HelpCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{t('rxModal.help.dialogTitle', 'Help choosing lenses')}</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {t('rxModal.help.dialogText', 'For a perfect match, book an eye exam at Tasnim Optic or chat with us on WhatsApp.')}
                        </p>

                        <div className="space-y-3">
                            <a href="/book-exam" className="block w-full">
                                <Button className="w-full py-3.5 rounded-xl shadow-lg shadow-primary/20 font-bold" size="lg">
                                    <Calendar className={isRTL ? "ml-2" : "mr-2"} size={18} />
                                    {t('rxModal.help.ctaExam', 'Book an eye exam')}
                                </Button>
                            </a>

                            <a
                                href="/ask"
                                className="block w-full"
                            >
                                <button className="w-full py-3.5 rounded-xl border-2 border-blue-100 bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                                    <MessageCircle size={18} />
                                    {t('rxModal.help.ctaMessage', 'Send a message in the site')}
                                </button>
                            </a>

                            <button onClick={() => setShowHelpDialog(false)} className="text-gray-400 text-sm font-medium hover:text-gray-600 mt-2">
                                {t('common.close', 'Close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>,
        document.body
    );
}
