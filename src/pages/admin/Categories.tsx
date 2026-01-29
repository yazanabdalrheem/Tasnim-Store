import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function Categories() {
    const { addToast } = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Category>>({
        name_he: '',
        name_ar: '',
        name_en: '',
        slug: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase.from('categories').select('*').order('name_he', { ascending: true });
        if (error) console.error('Error fetching categories:', error);
        if (data) setCategories(data as Category[]);
        setLoading(false);
    }

    const handleOpenModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData(category);
        } else {
            setEditingCategory(null);
            setFormData({ name_he: '', name_ar: '', name_en: '', slug: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .update(formData)
                    .eq('id', editingCategory.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([formData]);
                if (error) throw error;
            }

            setIsModalOpen(false);
            addToast('Category saved successfully', 'success');
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            addToast('Error saving category', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            console.error('Error deleting category:', error);
            alert('Error deleting category');
        } else {
            fetchCategories();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} className="mr-2" /> Add Category
                </Button>
            </div>

            <Table
                isLoading={loading}
                data={categories}
                columns={[
                    { header: 'Name (Hebrew)', accessor: 'name_he', className: 'font-medium' },
                    { header: 'Name (Arabic)', accessor: (c) => c.name_ar || '-' },
                    { header: 'Name (English)', accessor: (c) => c.name_en || '-' },
                    { header: 'Slug', accessor: 'slug' },
                    {
                        header: 'Actions', accessor: (c) => (
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(c)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(c.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        )
                    }
                ]}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <Input
                                label="Name (Hebrew)"
                                value={formData.name_he || ''}
                                onChange={e => setFormData({ ...formData, name_he: e.target.value })}
                                required
                            />
                            <Input
                                label="Name (Arabic)"
                                value={formData.name_ar || ''}
                                onChange={e => setFormData({ ...formData, name_ar: e.target.value })}
                            />
                            <Input
                                label="Name (English)"
                                value={formData.name_en || ''}
                                onChange={e => setFormData({ ...formData, name_en: e.target.value })}
                            />
                            <Input
                                label="Slug"
                                value={formData.slug || ''}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                required
                                placeholder="e.g. sunglasses"
                            />

                            <div className="pt-4 flex gap-3 justify-end">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" isLoading={loading}>Save</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
