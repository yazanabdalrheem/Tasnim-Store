import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Appointment } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function Appointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    async function fetchAppointments() {
        setLoading(true);
        const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .order('start_time', { ascending: false });

        if (error) console.error('Error fetching appointments:', error);
        if (data) setAppointments(data as Appointment[]);
        setLoading(false);
    }

    const { addToast } = useToast();

    // ... 

    const updateStatus = async (id: string, newStatus: Appointment['status']) => {
        const { error } = await supabase
            .from('appointments')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            addToast('Error updating status', 'error');
            console.error(error);
        } else {
            addToast('Status updated', 'success');
            fetchAppointments();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;

        const { error } = await supabase.from('appointments').delete().eq('id', id);
        if (error) {
            addToast('Error deleting appointment', 'error');
        } else {
            addToast('Appointment deleted', 'success');
            fetchAppointments();
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12} /> Confirmed</span>;
            case 'cancelled':
                return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold"><XCircle size={12} /> Cancelled</span>;
            case 'completed':
                return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12} /> Completed</span>;
            default:
                return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Appointments Management</h1>
                <Button onClick={fetchAppointments} variant="secondary" size="sm">
                    Refresh
                </Button>
            </div>

            <Table
                isLoading={loading}
                data={appointments}
                columns={[
                    {
                        header: 'Customer',
                        accessor: (a) => (
                            <div>
                                <div className="font-bold">{a.customer_name}</div>
                                <div className="text-xs text-gray-500">{a.customer_phone}</div>
                            </div>
                        )
                    },
                    {
                        header: 'Date & Time',
                        accessor: (a) => (
                            <div className="flex flex-col text-sm">
                                <span className="font-medium">{format(new Date(a.start_time), 'dd/MM/yyyy')}</span>
                                <span className="text-gray-500">{format(new Date(a.start_time), 'HH:mm')} - {format(new Date(a.end_time), 'HH:mm')}</span>
                            </div>
                        )
                    },
                    { header: 'Type', accessor: 'type' },
                    { header: 'Status', accessor: (a) => getStatusBadge(a.status) },
                    { header: 'Notes', accessor: (a) => <span className="text-xs text-gray-500 max-w-[150px] truncate block" title={a.notes}>{a.notes || '-'}</span> },
                    {
                        header: 'Actions', accessor: (a) => (
                            <div className="flex gap-2">
                                {a.status === 'pending' && (
                                    <button onClick={() => updateStatus(a.id, 'confirmed')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Confirm">
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                                {a.status !== 'cancelled' && (
                                    <button onClick={() => updateStatus(a.id, 'cancelled')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Cancel">
                                        <XCircle size={18} />
                                    </button>
                                )}
                                <button onClick={() => handleDelete(a.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )
                    }
                ]}
            />
        </div>
    );
}
