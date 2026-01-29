import { useState, useRef, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import type { ProductImage } from '../../types';

export interface ExtendedProductImage extends Partial<ProductImage> {
    id: string;
    url: string;
    sort_order: number;
    isNew?: boolean;
    file?: File;
    preview?: string; // For new uploads
}

interface ImageUploadProps {
    initialImages?: ExtendedProductImage[] | ProductImage[]; // Accept both or standardizing on Extended
    onImagesChange: (images: ExtendedProductImage[]) => void;
    maxSizeMB?: number; // default 3
    productId?: string;
}

export default function ImageUpload(props: ImageUploadProps) {
    const { initialImages = [], onImagesChange, maxSizeMB = 3 } = props;
    const { addToast } = useToast();
    const [images, setImages] = useState<ExtendedProductImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Only set initial images if we have no state yet or if it's a distinct reset (handled by parent key usually, but here checking length/ids helps)
        // We map initial DB images to our state format
        const formatted = initialImages.map(img => ({
            ...img,
            isNew: false
        }));
        // We only override if current images are empty (first load) or if parent forces it? 
        // For simplicity, we rely on parent to pass updated initialImages only when switching products.
        // But preventing overwrite of in-progress edits is tricky. 
        // Best approach: Parent controls state completely? No, parent passes initial, component manages local, then calls onChange.
        // We'll trust parent to Key this component to reset state.
        setImages(formatted);
    }, [initialImages]);

    const validateFile = (file: File): string | null => {
        if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
            return `File ${file.name} is not a supported image type (JPG, PNG, WEBP).`;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return `File ${file.name} exceeds ${maxSizeMB}MB limit.`;
        }
        return null;
    };

    const processFiles = (files: File[]) => {
        const currentCount = images.length;
        if (currentCount + files.length > 8) {
            addToast('Maximun 8 images allowed per product', 'error');
            return;
        }

        const validFiles: File[] = [];
        files.forEach(file => {
            const error = validateFile(file);
            if (error) {
                addToast(error, 'error');
            } else {
                validFiles.push(file);
            }
        });

        if (validFiles.length === 0) return;

        const newImages: ExtendedProductImage[] = validFiles.map((file, index) => ({
            id: `temp-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
            url: URL.createObjectURL(file), // Preview URL
            preview: URL.createObjectURL(file), // Distinct field for cleanup
            sort_order: currentCount + index,
            isNew: true,
            file
        }));

        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
            e.target.value = '';
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    };

    const removeImage = (id: string) => {
        const updatedImages = images.filter(img => img.id !== id);
        setImages(updatedImages);
        onImagesChange(updatedImages);

        const img = images.find(i => i.id === id);
        if (img?.isNew && img.preview) {
            URL.revokeObjectURL(img.preview);
        }
    };

    const moveImage = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === images.length - 1)
        ) return;

        const newImages = [...images];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];

        const reorderedImages = newImages.map((img, idx) => ({
            ...img,
            sort_order: idx
        }));

        setImages(reorderedImages);
        onImagesChange(reorderedImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Product Images (Max 8)</label>
                <div className="flex gap-4 items-center">
                    <span className="text-xs text-gray-500">{images.length}/8 uploaded</span>
                    {images.length > 0 && <span className="text-xs text-blue-600 font-medium">Drag to reorder/upload</span>}
                </div>
            </div>

            <div
                className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer relative
                    ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="p-3 bg-white border border-gray-100 shadow-sm rounded-full">
                        <Upload size={24} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, WEBP (max {maxSizeMB}MB). First image will be the main image.
                        </p>
                    </div>
                </div>
            </div>

            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 select-none">
                    {images.map((img, index) => (
                        <div
                            key={img.id}
                            className={`
                                relative group bg-white border rounded-xl p-2 shadow-sm transition-all
                                ${index === 0 ? 'border-primary/50 ring-1 ring-primary/20' : 'border-gray-200'}
                            `}
                        >
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 relative">
                                <img src={img.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                                    className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-red-600"
                                    title="Remove image"
                                >
                                    <X size={14} />
                                </button>
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-primary/90 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow-sm">
                                        Main
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center px-1">
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                                        title="Move up"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveImage(index, 'down')}
                                        disabled={index === images.length - 1}
                                        className="p-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-20 transition-colors"
                                        title="Move down"
                                    >
                                        ↓
                                    </button>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{index + 1}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
