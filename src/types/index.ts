// Types definition
export type Language = 'he' | 'ar' | 'en';

export interface LocalizedString {
    he: string;
    ar?: string;
    en?: string;
    [key: string]: string | undefined;
}

export interface Product {
    id: string;
    name_he: string;
    name_ar?: string;
    name_en?: string;
    description_he?: string;
    description_ar?: string;
    description_en?: string;
    price: number;
    discount_price?: number;
    stock_quantity: number;
    images: string[];
    main_image_url?: string;
    category_id: string;
    is_active: boolean;
    requires_lenses?: boolean;
    product_images?: ProductImage[];

    // Calculated Fields from products_view
    final_price?: number;
    original_price?: number;
    has_promotion?: boolean;
    promotion_id?: string;
    promotion_title_en?: string;
    promotion_title_he?: string;
    promotion_title_ar?: string;
    badge_text_en?: string;
    badge_text_he?: string;
    badge_text_ar?: string;
    promotion_type?: 'percent' | 'fixed';
    promotion_value?: number;
    calculated_discount_percent?: number;

    // Rx Flow
    rx_config?: {
        enabled: boolean;
        allow_saved?: boolean;
        allow_manual?: boolean;
        allow_upload?: boolean;
        requirement?: 'optional' | 'required';
        ranges?: any;
    };
}




export interface RxValue {
    [key: string]: string | number;
}

export interface RxSelection {
    use_case: 'none' | 'distance' | 'reading' | 'multifocal';
    method: 'manual' | 'saved';
    od?: RxValue;
    os?: RxValue;
    template_id?: string;
}

export interface ProductImage {
    id: string;
    product_id: string;
    url: string;
    storage_path: string;
    sort_order: number;
    created_at: string;
}

export interface Category {
    id: string;
    name_he: string;
    name_ar?: string;
    name_en?: string;
    image_url?: string;
    slug: string;
}

export interface Promotion {
    id: string;
    title_en: string;
    title_he: string;
    title_ar: string;
    type: 'percent' | 'fixed';
    value: number;
    start_at: string;
    end_at: string;
    is_active: boolean;
    badge_text_en?: string;
    badge_text_he?: string;
    badge_text_ar?: string;
    created_at: string;
    products?: Product[]; // For joining
}

export interface PromotionProduct {
    id: string;
    promotion_id: string;
    product_id: string;
    created_at: string;
}

export interface Appointment {
    id: string;
    user_id?: string;
    start_time: string;
    end_time: string;
    type: 'eye_exam' | 'contact_lenses' | 'kids' | 'driving';
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
    id: string;
    user_id: string;
    total_amount: number;
    status: OrderStatus;
    created_at: string;
    items?: OrderItem[];
    customer_details?: {
        full_name?: string;
        phone?: string;
        email?: string;
        notes?: string;
    };
    shipping_address?: {
        address?: string;
    };
}

export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    metadata?: any;
    product?: Product;
}

export interface RxEyeData {
    sph: string;
    cyl?: string;
    axis?: string;
    add?: string;
}

export interface RxCartMetadata {
    with_lenses: boolean;
    lens_package?: string; // id
    lens_package_label?: string; // for display
    lens_price_addon?: number;
    rx_method?: 'upload' | 'manual' | 'help';
    rx_manual?: {
        od_sph: string;
        os_sph: string;
        pd: string;
        od_cyl?: string;
        os_cyl?: string;
        od_axis?: string;
        os_axis?: string;
    };
    rx_upload_url?: string;
}
