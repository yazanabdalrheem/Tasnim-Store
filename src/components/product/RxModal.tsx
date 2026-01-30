import { useState, useEffect, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { X, Eye, FileText, Upload, ChevronLeft, Check, AlertCircle, Loader2, Info } from 'lucide-react';

import { Button } from "../ui/Button";
import { supabase } from "../../lib/supabase";
import { clsx } from 'clsx';
import { useToast } from "../../context/ToastContext";

interface RxModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onConfirm: (rxPayload: any) => void;
}

type Step = 'type' | 'usage' | 'method' | 'manual' | 'upload';

export default function RxModal({ isOpen, onClose, product, onConfirm }: RxModalProps) {
    const { t, i18n } = useTranslation();
    const { addToast } = useToast();
    const isRtl = i18n.dir() === 'rtl';

    // Config (Default to all enabled if not present for legacy compat)
    const rxConfig = product.rx_config || {
        enabled: true,
        allow_saved: true,
        allow_manual: true,
        allow_upload: true
    };

    // State
    const [step, setStep] = useState<Step>('type');
    const [rxData, setRxData] = useState<any>({
        mode: 'none', // none | saved | manual | upload
        usage: 'distance', // distance | reading | multifocal
        saved_rx_id: null,
        manual: {
            od: { sph: '0.00', cyl: '0.00', axis: '', add: '' },
            os: { sph: '0.00', cyl: '0.00', axis: '', add: '' },
            pd: ''
        },
        upload_url: '',
        notes: ''
    });

    const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setStep('type');
            setRxData({
                mode: 'none',
                usage: 'distance',
                saved_rx_id: null,
                manual: {
                    od: { sph: '0.00', cyl: '0.00', axis: '', add: '' },
                    os: { sph: '0.00', cyl: '0.00', axis: '', add: '' },
                    pd: ''
                },
                upload_url: '',
                notes: ''
            }); // Reset
            fetchSavedPrescriptions();
        }
    }, [isOpen]);

    const fetchSavedPrescriptions = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('user_prescriptions')
                .select('*')
                .order('created_at', { ascending: false });
            setSavedPrescriptions(data || []);
        }
    };

    // Hardcoded Defaults (Admin Settings Removed)
    const allowSaved = false; // Always OFF per request
    const allowManual = rxConfig.allow_manual !== false;
    const allowUpload = rxConfig.allow_upload !== false;

    const anyMethodAvailable = allowSaved || allowManual || allowUpload;

    // Initialize step based on what's available
    useEffect(() => {
        if (isOpen && step === 'method') {
            // If we are on method step but no methods are available, UI handles it in render
        }
    }, [isOpen, step, allowSaved, allowManual, allowUpload]);

    const handleConfirm = () => {
        // Validation
        if (rxData.mode === 'manual') {
            const { od, os } = rxData.manual;
            if (!od.sph && !os.sph) {
                addToast(t('rx.error.missingSph', 'Please enter Sphere (SPH) value'), 'error');
                return;
            }
            if ((od.cyl && parseFloat(od.cyl) !== 0 && !od.axis) || (os.cyl && parseFloat(os.cyl) !== 0 && !os.axis)) {
                addToast(t('rx.error.missingAxis', 'Axis is required when Cylinder is present'), 'error');
                return;
            }
        }

        if (rxData.mode === 'saved' && !rxData.saved_rx_id) {
            addToast(t('rx.error.selectSaved', 'Please select a saved prescription'), 'error');
            return;
        }

        if (rxData.mode === 'upload' && !rxData.upload_url) {
            addToast(t('rx.error.missingFile', 'Please upload a prescription file'), 'error');
            return;
        }

        // Construct final payload
        const payload = {
            mode: rxData.mode,
            usage: rxData.usage,
            ...(rxData.mode === 'manual' && { manual: rxData.manual }),
            ...(rxData.mode === 'upload' && { upload_url: rxData.upload_url }),
            ...(rxData.mode === 'saved' && { saved_rx_id: rxData.saved_rx_id }),
            notes: rxData.notes
        };

        onConfirm(payload);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `rx-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage
                .from('prescriptions') // Ensure bucket exists or use general uploads
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('prescriptions')
                .getPublicUrl(fileName);

            setRxData({ ...rxData, upload_url: publicUrl });
            addToast(t('rx.uploadSuccess', 'File uploaded successfully'), 'success');
        } catch (error: any) {
            console.error('Upload error:', error);
            // Fallback for demo if bucket missing:
            // setRxData({ ...rxData, upload_url: 'https://placeholder.com/rx-file.jpg' });
            addToast(t('rx.uploadError', 'Failed to upload file. Please try again.'), 'error');
        } finally {
            setUploading(false);
        }
    };

    // Helper options
    const sphOptions: string[] = [];
    for (let i = -10.00; i <= 10.00; i += 0.25) sphOptions.push((i > 0 ? '+' : '') + i.toFixed(2));

    const cylOptions: string[] = ['0.00'];
    for (let i = -6.00; i < 0; i += 0.25) cylOptions.push(i.toFixed(2));

    const addOptions: string[] = [];
    for (let i = 0.75; i <= 3.50; i += 0.25) addOptions.push('+' + i.toFixed(2));

    const renderStep = () => {
        switch (step) {
            case 'type':
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-center mb-6">{t('rx.title', 'Prescription Choice')}</h3>
                        <button
                            onClick={() => {
                                setRxData({ ...rxData, mode: 'none' });
                                onConfirm({ mode: 'none' });
                            }}
                            className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-primary">
                                    <Eye size={24} />
                                </div>
                                <div className="text-start">
                                    <div className="font-bold text-slate-900 group-hover:text-primary">{t('rx.none', 'No prescription')}</div>
                                    <div className="text-sm text-slate-500">{t('rx.noneDesc', 'Buy frames only')}</div>
                                </div>
                            </div>
                            <Check className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        <button
                            onClick={() => {
                                setStep('usage'); // Go to usage selection
                            }}
                            className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-500 group-hover:text-primary">
                                    <FileText size={24} />
                                </div>
                                <div className="text-start">
                                    <div className="font-bold text-slate-900 group-hover:text-primary">{t('rx.with', 'With prescription')}</div>
                                    <div className="text-sm text-slate-500">{t('rx.withDesc', 'Enter details or upload')}</div>
                                </div>
                            </div>
                            <ChevronLeft className={clsx("text-primary opacity-0 group-hover:opacity-100 transition-opacity", !isRtl && "rotate-180")} />
                        </button>
                    </div>
                );

            case 'usage':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={() => setStep('type')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                <ChevronLeft className={clsx(!isRtl && "rotate-180")} />
                            </button>
                            <h3 className="text-lg font-bold">{t('rx.usage.title', 'Lens Type')}</h3>
                        </div>

                        {[
                            { id: 'distance', label: t('rx.usage.distance', 'Distance'), desc: t('rx.usage.distanceDesc', 'For general vision') },
                            { id: 'reading', label: t('rx.usage.reading', 'Reading'), desc: t('rx.usage.readingDesc', 'For close work') },
                            { id: 'multifocal', label: t('rx.usage.multifocal', 'Multifocal'), desc: t('rx.usage.multifocalDesc', 'Progressive (All distances)') }
                        ].map((usage) => (
                            <button
                                key={usage.id}
                                onClick={() => {
                                    setRxData({ ...rxData, usage: usage.id });
                                    setStep('method');
                                }}
                                className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-between group text-start"
                            >
                                <div>
                                    <div className="font-bold text-slate-900 group-hover:text-primary">{usage.label}</div>
                                    <div className="text-sm text-slate-500">{usage.desc}</div>
                                </div>
                                <ChevronLeft className={clsx("text-primary opacity-0 group-hover:opacity-100 transition-opacity", !isRtl && "rotate-180")} />
                            </button>
                        ))}
                    </div>
                );

            case 'method':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={() => setStep('usage')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                <ChevronLeft className={clsx(!isRtl && "rotate-180")} />
                            </button>
                            <h3 className="text-lg font-bold">{t('rx.method.title', 'How to provide prescription?')}</h3>
                        </div>

                        {/* Saved */}
                        {allowSaved && (
                            <button
                                disabled={savedPrescriptions.length === 0}
                                onClick={() => {
                                    setRxData({ ...rxData, mode: 'saved', saved_rx_id: savedPrescriptions[0]?.id });
                                    handleConfirm(); // Auto submit for now
                                }}
                                className={clsx(
                                    "w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between text-start relative overflow-hidden",
                                    savedPrescriptions.length === 0
                                        ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                                        : "border-slate-100 hover:border-primary hover:bg-blue-50 group"
                                )}
                            >
                                <div className="flex items-center gap-3 relative z-10 sticky">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{t('rx.method.saved', 'Use saved prescription')}</div>
                                        {savedPrescriptions.length === 0 && (
                                            <div className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                                                <AlertCircle size={12} />
                                                {t('rx.noSaved', 'No saved prescription found')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        )}

                        {/* Manual */}
                        {allowManual && (
                            <button
                                onClick={() => {
                                    setRxData({ ...rxData, mode: 'manual' });
                                    setStep('manual');
                                }}
                                className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-between group text-start"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-primary">
                                        <Eye size={20} />
                                    </div>
                                    <div className="font-bold text-slate-900 group-hover:text-primary">{t('rx.method.manual', 'Fill details manually')}</div>
                                </div>
                            </button>
                        )}

                        {/* Upload */}
                        {allowUpload && (
                            <button
                                onClick={() => {
                                    setRxData({ ...rxData, mode: 'upload' });
                                    setStep('upload');
                                }}
                                className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-primary hover:bg-blue-50 transition-all flex items-center justify-between group text-start"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-primary">
                                        <Upload size={20} />
                                    </div>
                                    <div className="font-bold text-slate-900 group-hover:text-primary">{t('rx.method.upload', 'Upload prescription image')}</div>
                                </div>
                            </button>
                        )}

                        {!anyMethodAvailable && (
                            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <AlertCircle className="mx-auto mb-2 opacity-50" size={32} />
                                <p>{t('rx.unavailable', 'Prescription options unavailable')}</p>
                            </div>
                        )}
                    </div>
                );

            case 'manual':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setStep('method')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                <ChevronLeft className={clsx(!isRtl && "rotate-180")} />
                            </button>
                            <h3 className="text-lg font-bold">{t('rx.manualTitle', 'Enter Prescription Details')}</h3>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex items-start gap-2">
                            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                {t('rx.error.disclaimer')}
                            </p>
                        </div>

                        {/* OD (Right) */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <div className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                                <span className="bg-blue-100 px-2 py-0.5 rounded text-xs">OD</span>
                                {t('rx.rightEye', 'Right Eye')}
                            </div>
                            <div className={clsx("grid gap-2", rxData.usage === 'multifocal' ? "grid-cols-4" : "grid-cols-3")}>
                                <SelectField label="SPH" value={rxData.manual.od.sph} options={sphOptions} onChange={(v: string) => updateManual('od', 'sph', v)} />
                                <SelectField label="CYL" value={rxData.manual.od.cyl} options={cylOptions} onChange={(v: string) => updateManual('od', 'cyl', v)} />
                                <SelectField label="AXIS" value={rxData.manual.od.axis} options={range(0, 180, 1)} disabled={parseFloat(rxData.manual.od.cyl || '0') === 0} onChange={(v: string) => updateManual('od', 'axis', v)} />
                                {rxData.usage === 'multifocal' && (
                                    <SelectField label="ADD" value={rxData.manual.od.add} options={addOptions} onChange={(v: string) => updateManual('od', 'add', v)} />
                                )}
                            </div>
                        </div>

                        {/* OS (Left) */}
                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                            <div className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                                <span className="bg-purple-100 px-2 py-0.5 rounded text-xs">OS</span>
                                {t('rx.leftEye', 'Left Eye')}
                            </div>
                            <div className={clsx("grid gap-2", rxData.usage === 'multifocal' ? "grid-cols-4" : "grid-cols-3")}>
                                <SelectField label="SPH" value={rxData.manual.os.sph} options={sphOptions} onChange={(v: string) => updateManual('os', 'sph', v)} />
                                <SelectField label="CYL" value={rxData.manual.os.cyl} options={cylOptions} onChange={(v: string) => updateManual('os', 'cyl', v)} />
                                <SelectField label="AXIS" value={rxData.manual.os.axis} options={range(0, 180, 1)} disabled={parseFloat(rxData.manual.os.cyl || '0') === 0} onChange={(v: string) => updateManual('os', 'axis', v)} />
                                {rxData.usage === 'multifocal' && (
                                    <SelectField label="ADD" value={rxData.manual.os.add} options={addOptions} onChange={(v: string) => updateManual('os', 'add', v)} />
                                )}
                            </div>
                        </div>

                        {/* Extra Fields */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                            <SelectField label={t('rx.pd', 'PD (Pupillary Distance)')} value={rxData.manual.pd} options={range(50, 80, 1)} onChange={(v: string) => setRxData({ ...rxData, manual: { ...rxData.manual, pd: v } })} />

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">{t('rx.notes', 'Notes (Optional)')}</label>
                                <textarea
                                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm focus:border-primary outline-none"
                                    rows={2}
                                    value={rxData.notes}
                                    onChange={(e) => setRxData({ ...rxData, notes: e.target.value })}
                                    placeholder={t('rx.notesPlaceholder', 'Any special requests?')}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button className="w-full h-12 text-lg font-bold" onClick={handleConfirm}>{t('rx.addToCart', 'Add to Cart')}</Button>
                        </div>
                    </div>
                );

            case 'upload':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <button onClick={() => setStep('method')} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                                <ChevronLeft className={clsx(!isRtl && "rotate-180")} />
                            </button>
                            <h3 className="text-lg font-bold">{t('rx.uploadTitle', 'Upload Prescription')}</h3>
                        </div>

                        <div
                            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-blue-50 transition-all gap-4"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={handleFileUpload}
                            />

                            {uploading ? (
                                <Loader2 className="animate-spin text-primary" size={48} />
                            ) : rxData.upload_url ? (
                                <div className="relative">
                                    <img src={rxData.upload_url} alt="Rx" className="h-32 object-contain rounded-lg shadow-sm border" />
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full"><Check size={12} /></div>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-primary">
                                        <Upload size={32} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{t('rx.tapToUpload', 'Tap to upload')}</div>
                                        <div className="text-sm text-slate-500 mt-1">{t('rx.uploadTypes', 'Images or PDF')}</div>
                                    </div>
                                </>
                            )}
                        </div>

                        {rxData.upload_url && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">{t('rx.notes', 'Notes (Optional)')}</label>
                                <textarea
                                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm focus:border-primary outline-none"
                                    rows={2}
                                    value={rxData.notes}
                                    onChange={(e) => setRxData({ ...rxData, notes: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                className="w-full h-12 text-lg font-bold"
                                onClick={handleConfirm}
                                disabled={!rxData.upload_url || uploading}
                            >
                                {t('rx.addToCart', 'Add to Cart')}
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    const updateManual = (eye: 'od' | 'os', field: string, value: string) => {
        setRxData((prev: any) => ({
            ...prev,
            manual: {
                ...prev.manual,
                [eye]: {
                    ...prev.manual[eye],
                    [field]: value
                }
            }
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={clsx(
                "bg-white w-full sm:w-auto sm:min-w-[480px] max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto",
                "animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200"
            )}>
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <h2 className="font-bold text-slate-900">{t('rx.title', 'Prescription')}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 pb-10 sm:pb-6">
                    {renderStep()}
                </div>
            </div>
        </div>
    );
}

function SelectField({ label, value, options, onChange, className, disabled }: any) {
    return (
        <div className={className}>
            <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
            <select
                disabled={disabled}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-200 bg-white text-sm font-medium px-2 outline-none focus:border-primary disabled:bg-slate-100 disabled:text-slate-300"
            >
                <option value="">-</option>
                {options.map((opt: any) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

function range(start: number, end: number, step: number) {
    const arr = [];
    for (let i = start; i <= end; i += step) arr.push(i.toString());
    return arr;
}
