import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import type { Product, Category, ProductImage } from '../../types';
import { useToast } from '../../context/ToastContext';
import ImageUpload, { type ExtendedProductImage } from '../../components/admin/ImageUpload';
import { AdminBadge } from '../../components/admin/AdminBadge';

export default function Products() {
    const { t, i18n } = useTranslation();
    const { addToast } = useToast();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const isRTL = i18n.language === 'he' || i18n.language === 'ar';

    // Form State
    const [formData, setFormData] = useState<Partial<Product>>({
        name_he: '',
        price: 0,
        stock_quantity: 0,
        is_active: true,
        category_id: ''
    });
    const [currentImages, setCurrentImages] = useState<ExtendedProductImage[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
            supabase
                .from('products')
                .select('*, product_images(*)')
                .order('created_at', { ascending: false }),
            supabase.from('categories').select('*').order('name_he', { ascending: true })
        ]);

        if (productsRes.data) {
            // Sort images for each product
            const prods = productsRes.data.map((p: any) => ({
                ...p,
                product_images: p.product_images?.sort((a: ProductImage, b: ProductImage) => a.sort_order - b.sort_order) || []
            }));
            setProducts(prods as Product[]);
        }
        if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);

        setLoading(false);
    }

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
            // Ensure deep copy or correct reference for images
            setCurrentImages(product.product_images ? [...product.product_images] : []);
        } else {
            setEditingProduct(null);
            setFormData({ name_he: '', price: 0, stock_quantity: 0, is_active: true, category_id: '' });
            setCurrentImages([]);
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Strict Validation: Must have at least one image
            if (currentImages.length === 0) {
                throw new Error(t('admin.products.errors.noImage', "Product must have at least one image."));
            }

            // Sanitize payload
            const payload = { ...formData };
            if (!payload.category_id) delete payload.category_id;
            delete payload.product_images; // Don't upsert this directly

            let productId = editingProduct?.id;

            // 2. Insert/Update Product Basic Info
            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update({
                        name_he: payload.name_he,
                        price: payload.price,
                        stock_quantity: payload.stock_quantity,
                        is_active: payload.is_active,
                        category_id: payload.category_id
                    })
                    .eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('products')
                    .insert([{
                        name_he: payload.name_he,
                        price: payload.price,
                        stock_quantity: payload.stock_quantity,
                        is_active: payload.is_active,
                        category_id: payload.category_id,
                        main_image_url: null // Will be set in handleImageOperations
                    }])
                    .select()
                    .single();
                if (error) throw error;
                productId = data.id;
            }

            if (!productId) throw new Error("Failed to get product ID");

            // 3. Handle Images & Update Main Image URL
            await handleImageOperations(productId);

            setIsModalOpen(false);
            addToast(t('admin.products.saveSuccess', 'Product saved successfully'), 'success');
            fetchData();
        } catch (error: any) {
            console.error('Error saving product:', error);
            addToast(error.message || t('admin.products.saveError', 'Error saving product'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const slugify = (text: string) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    };

    const handleImageOperations = async (productId: string) => {
        const originalImages = editingProduct?.product_images || [];

        // 1. Identify Deleted Images
        const currentIds = new Set(currentImages.map(img => img.id));
        const deletedImages = originalImages.filter(img => !currentIds.has(img.id));

        for (const img of deletedImages) {
            const path = img.storage_path || img.url.split('product-images/')[1];
            if (path) {
                await supabase.storage.from('product-images').remove([path]);
            }
            await supabase.from('product_images').delete().eq('id', img.id);
        }

        // 2. Process Current Images (New & Existing)
        let mainImageUrl: string | null = null;

        for (let i = 0; i < currentImages.length; i++) {
            const img = currentImages[i];
            let imageUrl = img.url;

            // Handle New Uploads
            if ((img as any).isNew && (img as any).file) {
                const file = (img as any).file;
                const fileExt = file.name.split('.').pop();
                const fileNameBase = file.name.substring(0, file.name.lastIndexOf('.'));
                const safeFileName = slugify(fileNameBase);
                const fileName = `${productId}/${Date.now()}-${safeFileName}.${fileExt}`;
                const filePath = `products/${fileName}`;

                // A. Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);

                // B. Get Public URL
                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                imageUrl = publicUrlData.publicUrl;

                // C. Insert into product_images
                const { error: insertError } = await supabase.from('product_images').insert({
                    product_id: productId,
                    url: imageUrl,
                    sort_order: i,
                    storage_path: filePath
                });

                if (insertError) throw new Error(`DB Insert failed: ${insertError.message}`);
            } else {
                // Update sort order for existing
                if (!img.id.startsWith('temp-')) {
                    await supabase.from('product_images')
                        .update({ sort_order: i })
                        .eq('id', img.id);
                }
            }

            // Capture the first image as main
            if (i === 0) {
                mainImageUrl = imageUrl;
            }
        }

        // 3. Final Validation & Main Image Update
        if (!mainImageUrl || mainImageUrl === 'PUT_IMAGE_URL_HERE') {
            throw new Error("Failed to determine a valid main image URL. Please upload a valid image.");
        }

        const { error: updateError } = await supabase
            .from('products')
            .update({ main_image_url: mainImageUrl })
            .eq('id', productId);

        if (updateError) {
            throw new Error(`Failed to update product main image: ${updateError.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.products.deleteConfirm', 'Are you sure you want to delete this product?'))) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) {
            addToast(t('admin.products.deleteSuccess', 'Product deleted successfully'), 'success');
            fetchData();
        } else {
            addToast(t('admin.products.deleteError', 'Error deleting product'), 'error');
        }
    };

    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return '-';
        const cat = categories.find(c => c.id === categoryId);
        return cat ? cat.name_he : '-';
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('admin.products.title', 'Products Management')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('admin.products.description', 'Manage your product catalog')}</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} className={isRTL ? 'ml-2' : 'mr-2'} />
                    {t('admin.products.addProduct', 'Add Product')}
                </Button>
            </div>

            <Table
                isLoading={loading}
                data={products}
                columns={[
                    {
                        header: t('admin.products.table.image', 'Image'),
                        accessor: (p) => {
                            let mainImg = p.main_image_url || p.product_images?.[0]?.url;
                            // Treat placeholder as no image
                            if (mainImg === 'PUT_IMAGE_URL_HERE') mainImg = undefined;

                            return mainImg ? (
                                <img src={mainImg} alt={p.name_he} className="w-10 h-10 rounded object-cover border border-gray-200" />
                            ) : (
                                <div className="w-14 h-10 bg-red-50 border border-red-100 rounded flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-red-500 text-center leading-tight">No<br />Image</span>
                                </div>
                            )
                        }
                    },
                    { header: t('admin.products.table.name', 'Product Name'), accessor: 'name_he', className: 'font-medium' },
                    { header: t('admin.products.table.category', 'Category'), accessor: (p) => getCategoryName(p.category_id) },
                    { header: t('admin.products.table.price', 'Price'), accessor: (p) => `₪${p.price}` },
                    { header: t('admin.products.table.stock', 'Stock'), accessor: 'stock_quantity' },
                    {
                        header: t('admin.products.table.status', 'Status'),
                        accessor: (p) => p.is_active ? (
                            <AdminBadge variant="success">{t('admin.common.active', 'Active')}</AdminBadge>
                        ) : (
                            <AdminBadge variant="neutral">{t('admin.common.inactive', 'Inactive')}</AdminBadge>
                        )
                    },
                    {
                        header: t('admin.products.table.actions', 'Actions'), accessor: (p) => (
                            <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                            </div>
                        )
                    }
                ]}
            />

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
                            <h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-6">

                            {/* Basic Info Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <Input
                                        label="Name (Hebrew)"
                                        value={formData.name_he || ''}
                                        onChange={e => setFormData({ ...formData, name_he: e.target.value })}
                                        required
                                    />
                                    <div className="space-y-1">
                                        <label className="block text-sm font-medium text-gray-700">Category</label>
                                        <select
                                            value={formData.category_id || ''}
                                            onChange={e => setFormData({ ...formData, category_id: e.target.value || undefined })}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        >
                                            <option value="">Select Category...</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name_he}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Price"
                                            type="number"
                                            value={formData.price || ''}
                                            onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                            required
                                        />
                                        <Input
                                            label="Stock"
                                            type="number"
                                            value={formData.stock_quantity || ''}
                                            onChange={e => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="active"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                        />
                                        <label htmlFor="active" className="text-sm font-medium text-gray-700">Active Product</label>
                                    </div>
                                </div>

                                {/* Image Upload Section */}
                                <div>
                                    <ImageUpload
                                        productId={editingProduct?.id}
                                        initialImages={currentImages}
                                        onImagesChange={setCurrentImages}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 justify-end border-t mt-4">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" isLoading={loading}>Save Product</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

