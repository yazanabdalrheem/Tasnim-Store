import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { Calendar, Clock, MapPin, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { clsx } from "clsx";

export default function MyBookings() {
    const { t } = useTranslation();
    const { success, error: showError } = useToast();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    async function fetchAppointments() {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('user_id', user.id)
                .order('start_time', { ascending: false });

            if (error) throw error;
            setAppointments(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAppointments();
    }, []);

    const now = new Date();

    const upcoming = appointments.filter(a =>
        (new Date(a.start_time) > now && a.status !== 'cancelled')
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()); // filter ascending for upcoming

    const history = appointments.filter(a =>
        (new Date(a.start_time) <= now || a.status === 'cancelled')
    );

    const displayed = activeTab === 'upcoming' ? upcoming : history;

    const handleCancel = async (id: string) => {
        if (!confirm(t("account.confirmCancel"))) return;

        setCancellingId(id);
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;

            success(t("account.cancelBooking") + " Success");
            fetchAppointments(); // refresh
        } catch (err) {
            console.error(err);
            showError("Failed to cancel booking");
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return "bg-green-100 text-green-700";
            case 'pending': return "bg-yellow-100 text-yellow-700";
            case 'cancelled': return "bg-red-100 text-red-700";
            case 'completed': return "bg-gray-100 text-gray-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">{t("common.loading")}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">{t("account.myBookings")}</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={clsx(
                        "px-6 py-3 font-medium text-sm transition-colors border-b-2",
                        activeTab === 'upcoming'
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-900"
                    )}
                >
                    {t("account.upcoming")} ({upcoming.length})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={clsx(
                        "px-6 py-3 font-medium text-sm transition-colors border-b-2",
                        activeTab === 'history'
                            ? "border-primary text-primary"
                            : "border-transparent text-gray-500 hover:text-gray-900"
                    )}
                >
                    {t("account.history")} ({history.length})
                </button>
            </div>

            {/* List */}
            <div className="grid gap-4">
                {displayed.length > 0 ? (
                    displayed.map((booking) => (
                        <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 justify-between">
                            <div className="flex gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl text-center min-w-[80px] h-fit">
                                    <div className="text-xl font-bold text-gray-900">{format(new Date(booking.start_time), 'dd')}</div>
                                    <div className="text-xs uppercase font-medium text-gray-500">{format(new Date(booking.start_time), 'MMM')}</div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg text-gray-900 capitalize">
                                        {(booking.type || 'Appointment').replace('_', ' ')}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} />
                                            {format(new Date(booking.start_time), 'HH:mm')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin size={16} />
                                            Tasnim Optic
                                        </div>
                                    </div>
                                    {booking.notes && (
                                        <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                                            "{booking.notes}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end gap-4 justify-between">
                                <span className={clsx("px-3 py-1 rounded-full text-xs font-bold capitalize", getStatusColor(booking.status))}>
                                    {booking.status}
                                </span>

                                {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                                    <button
                                        onClick={() => handleCancel(booking.id)}
                                        disabled={cancellingId === booking.id}
                                        className="text-red-500 text-sm hover:underline flex items-center gap-1 disabled:opacity-50"
                                    >
                                        <XCircle size={16} />
                                        {t("account.cancelBooking")}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                        <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t("account.noBookings")}</h3>
                        {activeTab === 'upcoming' && (
                            <Link to="/book-exam" className="text-primary hover:underline font-medium">
                                {t("account.bookNow")}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
