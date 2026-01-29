export function formatPrice(amount: number | null | undefined, locale: string = 'en'): string {
    // Handle invalid values
    if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
        return '—';  // Em dash for missing/invalid prices
    }

    // Ensure amount is a valid number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || !isFinite(numericAmount)) {
        return '—';
    }

    // Map internal language codes to full locales
    const localeMap: Record<string, string> = {
        'he': 'he-IL',
        'ar': 'ar-SA',
        'en': 'en-US',
    };

    const targetLocale = localeMap[locale] || 'en-US';

    try {
        return new Intl.NumberFormat(targetLocale, {
            style: 'currency',
            currency: 'ILS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            currencyDisplay: 'symbol' // This usually gives ₪ for ILS in grounded locales
        }).format(numericAmount);
    } catch (error) {
        console.error("Error formatting price:", error);
        // Fallback
        return `₪${numericAmount.toLocaleString()}`;
    }
}

export function isPromotionActive(promotion: any): boolean {
    if (!promotion?.is_active) return false;
    const now = new Date();
    const start = new Date(promotion.start_at);
    const end = new Date(promotion.end_at);
    return now >= start && now <= end;
}

export function getBestPromotion(promotions: any[]): any | null {
    if (!promotions || promotions.length === 0) return null;

    // Filter active
    const active = promotions.filter(isPromotionActive);
    if (active.length === 0) return null;

    // Sort by percentage desc
    return active.sort((a, b) => b.percent - a.percent)[0];
}

export function calculateDiscountedPrice(price: number | null | undefined, percent: number | null | undefined): number {
    // Validate inputs
    const validPrice = Number(price) || 0;
    const validPercent = Number(percent) || 0;

    // Ensure percent is within valid range
    if (validPercent <= 0 || validPercent > 100) {
        return validPrice;
    }

    return Math.round(validPrice * (1 - validPercent / 100));
}
