import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, addDays, setHours, setMinutes, startOfDay } from "date-fns";
import { enUS, he, ar } from "date-fns/locale";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "../context/ToastContext";
import Card from "../components/ui/Card";
import ScrollToTop from "../components/ScrollToTop";

export default function BookExam() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar' || i18n.language === 'he';

    const getDateLocale = () => {
        switch (i18n.language) {
            case 'he': return he;
            case 'ar': return ar;
            default: return enUS;
        }
    };



    // State
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [takenSlots, setTakenSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        notes: "",
    });

    // Time Slots Configuration (09:00 to 19:00, 30 min intervals)
    const generateTimeSlots = () => {
        const slots = [];
        let start = setMinutes(setHours(new Date(), 9), 0); // 09:00
        const end = setMinutes(setHours(new Date(), 19), 0); // 19:00

        while (start <= end) {
            slots.push(format(start, "HH:mm"));
            start = addDays(start, 0); // Hack to copy date
            start = new Date(start.getTime() + 30 * 60000); // Add 30 mins
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Fetch existing appointments for the selected date
    useEffect(() => {
        const fetchTakenSlots = async () => {
            setLoading(true);
            const startOfDayStr = startOfDay(selectedDate).toISOString();
            const endOfDayStr = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000).toISOString();

            // Use the public view for availability
            const { data, error } = await supabase
                .from("appointments_public")
                .select("start_time")
                .gte("start_time", startOfDayStr)
                .lt("start_time", endOfDayStr)
                .neq("status", "cancelled");

            if (error) {
                console.error("Error fetching slots:", error.message, error.details, error.hint);
            } else {
                const taken = data.map((app) => format(new Date(app.start_time), "HH:mm"));
                setTakenSlots(taken);
            }
            setLoading(false);
        };

        fetchTakenSlots();
    }, [selectedDate]);

    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTime) {
            addToast(t("booking.selectTime"), "error");
            return;
        }
        setError(null);
        setSubmitting(true);

        try {
            // Construct start_time and end_time
            const [hours, minutes] = selectedTime.split(":").map(Number);
            const startTime = setMinutes(setHours(selectedDate, hours), minutes);
            const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min duration
            const startTimeStr = startTime.toISOString();

            // 1. Double check availability (Race condition prevention)
            // Use public view to avoid permission errors
            const { data: existing, error: checkError } = await supabase
                .from("appointments_public")
                .select("start_time") // ID is not exposed in public view
                .eq("start_time", startTimeStr)
                .neq("status", "cancelled")
                .maybeSingle();

            if (checkError) throw checkError;
            if (existing) {
                addToast(t("booking.slotTaken"), "error");
                // Refresh slots
                const startOfDayStr = startOfDay(selectedDate).toISOString();
                const endOfDayStr = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
                const { data: refreshed } = await supabase
                    .from("appointments_public")
                    .select("start_time")
                    .gte("start_time", startOfDayStr)
                    .lt("start_time", endOfDayStr)
                    .neq("status", "cancelled");
                if (refreshed) setTakenSlots(refreshed.map((app) => format(new Date(app.start_time), "HH:mm")));
                return;
            }

            // Check if user is authenticated
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Authenticated User -> Direct Appointment
                const { error: insertError } = await supabase.from("appointments").insert([
                    {
                        start_time: startTimeStr,
                        end_time: endTime.toISOString(),
                        type: "eye_exam",
                        status: "pending",
                        customer_name: formData.fullName,
                        customer_phone: formData.phone,
                        customer_email: formData.email || null,
                        notes: formData.notes || null,
                        user_id: user.id // Link to user if possible
                    },
                ]);
                if (insertError) throw insertError;
            } else {
                // Public User -> Request
                const { error: insertError } = await supabase.from("appointment_requests").insert([
                    {
                        full_name: formData.fullName,
                        phone: formData.phone,
                        email: formData.email || null,
                        appointment_date: format(selectedDate, "yyyy-MM-dd"),
                        appointment_time: selectedTime,
                        start_time: startTimeStr, // Useful for sorting/admin
                        notes: formData.notes || null,
                        page: window.location.pathname,
                        lang: i18n.language,
                        user_agent: navigator.userAgent
                    },
                ]);
                if (insertError) throw insertError;
            }

            setSuccess(true);
            addToast(t("booking.successMessage"), "success");
            setFormData({ fullName: "", phone: "", email: "", notes: "" });
            setSelectedTime(null);
        } catch (err: any) {
            console.error("Booking db error:", err);
            // Log full details for debugging
            if (err.details) console.error("DB Details:", err.details);
            if (err.hint) console.error("DB Hint:", err.hint);

            setError(err.message || t("common.error"));
            addToast(err.message || t("common.error"), "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-white">
                <ScrollToTop />
                <div className="bg-white rounded-[32px] shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">{t("booking.confirm")}</h2>
                        <p className="text-slate-500 text-lg leading-relaxed">
                            {t("booking.successMessage")}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => window.location.href = '/'}
                            variant="outline"
                            className="flex-1 py-4 text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        >
                            {t("common.backToHome", "Back to Home")}
                        </Button>
                        <Button
                            onClick={() => setSuccess(false)}
                            className="flex-1 py-4 text-lg shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700"
                        >
                            {t("booking.bookAnother")}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header */}
            <div className="bg-slate-50/50 py-16 border-b border-slate-100">
                <div className="container mx-auto px-4 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 font-heading tracking-tight">
                        {t("booking.title")}
                    </h1>
                    <p className="text-lg text-slate-500 font-light leading-relaxed">
                        {t("booking.subtitle")}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left: Date & Time Picker */}
                    <div className="md:col-span-7 space-y-8">
                        {/* Date Picker */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-xl text-slate-900">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">1</span>
                                {t("booking.selectDate")}
                            </h3>
                            <Card className="p-6 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <input
                                    type="date"
                                    min={new Date().toISOString().split("T")[0]}
                                    value={format(selectedDate, "yyyy-MM-dd")}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all font-medium text-lg text-slate-800 shadow-sm cursor-pointer"
                                />
                            </Card>
                        </div>

                        {/* Time Slots */}
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 font-bold text-xl text-slate-900">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">2</span>
                                {t("booking.selectTime")}
                            </h3>
                            <Card className="p-6 md:p-8 border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                {loading ? (
                                    <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
                                        <div className="w-6 h-6 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                                        <span>{t("booking.checking")}</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                        {timeSlots.map((time) => {
                                            const isTaken = takenSlots.includes(time);
                                            const isSelected = selectedTime === time;

                                            // Check if this time slot is in the past (only for today)
                                            const now = new Date();
                                            const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
                                            const [hours, minutes] = time.split(':').map(Number);
                                            const slotTime = setMinutes(setHours(selectedDate, hours), minutes);
                                            const isPast = isToday && slotTime < now;
                                            const isDisabled = isTaken || isPast;

                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => !isDisabled && setSelectedTime(time)}
                                                    disabled={isDisabled}
                                                    className={clsx(
                                                        "py-3 px-2 rounded-xl text-sm font-bold transition-all border duration-200",
                                                        isSelected
                                                            ? "bg-slate-900 text-white border-slate-900 shadow-lg scale-105"
                                                            : isDisabled
                                                                ? "bg-slate-50 text-slate-300 border-transparent cursor-not-allowed"
                                                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                    )}
                                                    title={isPast ? t("booking.timePassed", "Time has passed") : undefined}
                                                >
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="mt-8 flex gap-6 text-xs text-slate-400 font-medium justify-center border-t border-slate-50 pt-6">
                                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300"></span> {t("booking.legendAvailable")}</div>
                                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> {t("booking.legendSelected")}</div>
                                    <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span> {t("booking.legendTaken")}</div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Right: Booking Form */}
                    <div className="md:col-span-5 relative">
                        <div className="sticky top-24">
                            <h3 className="flex items-center gap-2 font-bold text-xl text-slate-900 mb-4">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">3</span>
                                {t("booking.details")}
                            </h3>

                            <Card className="border-slate-100 p-6 md:p-8 shadow-xl shadow-slate-200/40">
                                {error && (
                                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                        <div className="text-sm font-medium">{error}</div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Summary Box */}
                                    <div className="p-5 bg-slate-50 rounded-2xl mb-8 border border-slate-100 flex flex-col gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t("booking.summaryTitle")}</span>
                                        <div className="flex items-center gap-3 text-slate-900">
                                            <CalendarIcon size={18} className="text-primary" />
                                            <span className="font-bold">
                                                {format(selectedDate, "EEEE, MMMM d, yyyy", { locale: getDateLocale() })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-900">
                                            <Clock size={18} className="text-primary" />
                                            <span className="font-bold dir-ltr">{selectedTime || "--:--"}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            label={t("booking.fullName")}
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            required
                                            placeholder={t("common.placeholders.fullName")}
                                            className="bg-white"
                                        />
                                        <Input
                                            label={t("booking.phone")}
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            type="tel"
                                            placeholder={t("common.placeholders.phone")}
                                            className="bg-white"
                                        />
                                        <Input
                                            label={t("booking.email")}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            type="email"
                                            placeholder={t("common.placeholders.email")}
                                            className="bg-white"
                                        />

                                        <div className="space-y-2">
                                            <label className="block text-sm font-semibold text-slate-700">
                                                {t("booking.notesOptional")}
                                            </label>
                                            <textarea
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none bg-white placeholder:text-slate-400 text-slate-800 text-sm"
                                                placeholder={t("booking.notesPlaceholder")}
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-6 py-5 text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 rounded-xl"
                                        size="lg"
                                        isLoading={submitting}
                                        disabled={!selectedTime || submitting}
                                        title={!selectedTime ? t("booking.needTimeHint") : ""}
                                    >
                                        {t("booking.confirm")} <ArrowRight size={20} className={`ml-2 ${isRTL ? 'rotate-180' : ''}`} />
                                    </Button>

                                    <p className="text-xs text-center text-slate-400 pt-2">
                                        {t("booking.termsText")}
                                    </p>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
