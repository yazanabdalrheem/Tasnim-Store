import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../types';

export interface CartItem {
    id: string; // Unique ID for the cart line item
    product: Product;
    quantity: number;
    metadata?: any;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, quantity?: number, metadata?: any) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Failed to load cart', e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, quantity: number = 1, metadata?: any) => {
        setItems(current => {
            // Check for identical item (same product ID AND same metadata)
            const existingIndex = current.findIndex(item => {
                if (item.product.id !== product.id) return false;
                // Deep compare metadata
                if (!metadata && !item.metadata) return true;
                if (metadata && item.metadata) return JSON.stringify(metadata) === JSON.stringify(item.metadata);
                return false;
            });

            if (existingIndex >= 0) {
                const newItems = [...current];
                newItems[existingIndex].quantity += quantity;
                return newItems;
            }

            // New Item
            return [...current, {
                id: crypto.randomUUID(),
                product,
                quantity,
                metadata
            }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setItems(current => current.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setItems(current =>
            current.map(item =>
                item.id === itemId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((total, item) => {
        const price = item.product.final_price || item.product.discount_price || item.product.price;
        return total + (price * item.quantity);
    }, 0);

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
