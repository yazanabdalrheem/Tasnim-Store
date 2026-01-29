import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { CheckCircle, XCircle, Clock, Truck, Package, Eye, X, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import type { Order } from '../../types';

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled' | 'paid';

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        if (data) setOrders(data as Order[]);
        setLoading(false);
    };

    const fetchOrderItems = async (orderId: string) => {
        setItemsLoading(true);
        const { data, error } = await supabase
            .from('order_items')
            .select('*, product:products(name_he, name_en, images)')
            .eq('order_id', orderId);

        if (error) console.error('Error fetching items:', error);
        if (data) setOrderItems(data);
        setItemsLoading(false);
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
        fetchOrderItems(order.id);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Error updating status');
        } else {
            // Update local state
            setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus as any } : o));
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status: newStatus as any });
            }
        }
    };

    // Helper: Customer Info
    const getCustomerInfo = (order: Order) => {
        // @ts-ignore
        const details = order.customer_details || {};
        return {
            name: details.full_name || order.user_id || 'Guest',
            phone: details.phone || '-',
            email: details.email || '-',
            address: order.shipping_address?.address || '-'
        };
    };

    // Helper: Matching Logic
    const filteredOrders = orders.filter(order => {
        const info = getCustomerInfo(order);
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            order.id.toLowerCase().includes(searchLower) ||
            info.name.toLowerCase().includes(searchLower) ||
            info.phone.includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs font-bold ring-1 ring-green-600/20"><CheckCircle size={12} /> Completed</span>;
            case 'shipped':
                return <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-1 rounded text-xs font-bold ring-1 ring-blue-600/20"><Truck size={12} /> Shipped</span>;
            case 'confirmed':
            case 'paid':
                return <span className="flex items-center gap-1 text-indigo-700 bg-indigo-100 px-2 py-1 rounded text-xs font-bold ring-1 ring-indigo-600/20"><Package size={12} /> Confirmed</span>;
            case 'cancelled':
                return <span className="flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs font-bold ring-1 ring-red-600/20"><XCircle size={12} /> Cancelled</span>;
            default:
                return <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded text-xs font-bold ring-1 ring-yellow-600/20"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={fetchOrders} variant="secondary" size="sm">
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Order ID, Name, or Phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Filter size={18} className="text-gray-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="py-2 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <Table
                isLoading={loading}
                data={filteredOrders}
                columns={[
                    {
                        header: 'Order ID',
                        accessor: (o) => <span className="font-mono text-xs font-medium text-gray-500">#{o.id.slice(0, 8)}</span>
                    },
                    {
                        header: 'Customer',
                        accessor: (o) => {
                            const info = getCustomerInfo(o);
                            return (
                                <div>
                                    <div className="font-bold text-gray-900">{info.name}</div>
                                    <div className="text-xs text-gray-500">{info.phone}</div>
                                </div>
                            );
                        }
                    },
                    {
                        header: 'Date',
                        accessor: (o) => <span className="text-sm text-gray-600">{format(new Date(o.created_at), 'dd/MM/yyyy')}</span>
                    },
                    { header: 'Total', accessor: (o) => <span className="font-bold text-gray-900">₪{o.total_amount}</span> },
                    { header: 'Status', accessor: (o) => getStatusBadge(o.status) },
                    {
                        header: 'Actions', accessor: (o) => (
                            <div className="flex gap-2">
                                <button onClick={() => handleViewOrder(o)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                                    <Eye size={18} />
                                </button>
                                {o.status === 'pending' && (
                                    <button onClick={() => updateStatus(o.id, 'confirmed')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Confirm Order">
                                        <CheckCircle size={18} />
                                    </button>
                                )}
                            </div>
                        )
                    }
                ]}
            />

            {/* Order Details Modal */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50/50 shrink-0">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900">Order #{selectedOrder.id.slice(0, 8)}</h3>
                                <p className="text-sm text-gray-500">{format(new Date(selectedOrder.created_at), 'PPP p')}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {/* Status Bar */}
                            <div className="mb-8 p-4 bg-surface-soft rounded-xl flex flex-wrap items-center justify-between gap-4">
                                <span className="font-medium text-gray-600">Current Status:</span>
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(selectedOrder.status)}
                                    <span className="text-gray-300">|</span>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                                        className="text-sm border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                {/* Customer */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                                        Customer Details
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name</span>
                                            <span className="font-medium">{getCustomerInfo(selectedOrder).name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phone</span>
                                            <span className="font-medium" dir="ltr">{getCustomerInfo(selectedOrder).phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Email</span>
                                            <span className="font-medium">{getCustomerInfo(selectedOrder).email}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                        <div className="w-1 h-5 bg-secondary rounded-full"></div>
                                        Shipping Details
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm h-full">
                                        <p className="font-medium text-gray-700">{getCustomerInfo(selectedOrder).address}</p>
                                        {/* @ts-ignore */}
                                        {selectedOrder.customer_details?.notes && (
                                            <div className="pt-2 border-t border-gray-200 mt-2">
                                                <span className="text-xs text-gray-500 uppercase font-bold">Notes:</span>
                                                <p className="text-gray-600 italic mt-1">"{selectedOrder.customer_details.notes}"</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <h4 className="font-bold text-gray-900 mb-4">Order Items</h4>
                            {itemsLoading ? (
                                <div className="text-center py-8 text-gray-400">Loading items...</div>
                            ) : (
                                <div className="space-y-3">
                                    {orderItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-xl hover:shadow-sm transition-shadow">
                                            <div className="w-16 h-16 bg-gray-50 rounded-lg border overflow-hidden shrink-0">
                                                {item.product?.images?.[0] ?
                                                    <img src={item.product.images[0]} className="w-full h-full object-cover" /> :
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 truncate">{item.product?.name_he || 'Unknown Product'}</p>
                                                <p className="text-sm text-gray-500 truncate">{item.product?.name_en}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="font-bold text-gray-900">₪{item.price_at_purchase}</div>
                                                <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-end pt-6 border-t mt-6">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-sm text-gray-500">Total Amount</span>
                                            <span className="text-3xl font-bold text-primary">₪{selectedOrder.total_amount}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="mt-8 pt-6 border-t flex flex-wrap gap-3 justify-end">
                                {selectedOrder.status === 'pending' && (
                                    <Button onClick={() => updateStatus(selectedOrder.id, 'confirmed')} className="bg-indigo-600 hover:bg-indigo-700">Confirm Order</Button>
                                )}
                                {selectedOrder.status === 'confirmed' && (
                                    <Button onClick={() => updateStatus(selectedOrder.id, 'shipped')} className="bg-blue-600 hover:bg-blue-700">Mark as Shipped</Button>
                                )}
                                {selectedOrder.status === 'shipped' && (
                                    <Button onClick={() => updateStatus(selectedOrder.id, 'completed')} className="bg-green-600 hover:bg-green-700">Complete Order</Button>
                                )}
                                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300" onClick={() => updateStatus(selectedOrder.id, 'cancelled')}>Cancel Order</Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
