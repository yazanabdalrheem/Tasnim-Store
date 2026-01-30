
export interface LensPackage {
    id: string;
    label_en: string;
    label_ar: string;
    label_he: string;
    description_en: string;
    description_ar: string;
    description_he: string;
    price_addon: number;
}

export const LENS_PACKAGES: LensPackage[] = [
    {
        id: 'standard',
        label_en: 'Standard 1.50',
        label_ar: 'عدسات قياسية 1.50', // Changed to "Standard"
        label_he: 'עדשות סטנדרט 1.50',
        description_en: 'Standard formatting, suitable for low prescriptions.',
        description_ar: 'عدسات عادية، مناسبة للوصفات البسيطة.',
        description_he: 'עדשות רגילות, מתאימות למרשמים נמוכים.',
        price_addon: 0
    },
    {
        id: 'thin',
        label_en: 'Thin & Light 1.61',
        label_ar: 'عدسات رفيعة 1.61',
        label_he: 'דקות וקלות 1.61',
        description_en: 'Thinner and lighter, recommended for medium prescriptions.',
        description_ar: 'أرق وأخف وزناً، وتدوم طويلاً.',
        description_he: 'דקות יותר, קלות יותר ועמידות.',
        price_addon: 100
    },
    {
        id: 'blue_cut',
        label_en: 'Blue Cut (Screen Protection)',
        label_ar: 'فلتر حماية (بلو كت)', // "Blue Cut"
        label_he: 'הגנה מפני אור כחול',
        description_en: 'Protects eyes from digital screen usage.',
        description_ar: 'تحمي العيون من الأشعة الزرقاء للشاشات.',
        description_he: 'מגן על העיניים מקרינת מסכים.',
        price_addon: 150
    }
];

export const RX_RANGES = {
    SPH: { min: -12.00, max: 8.00, step: 0.25 },
    CYL: { min: -6.00, max: 0.00, step: 0.25 },
    AXIS: { min: 0, max: 180, step: 1 },
    PD: { min: 50, max: 80, step: 1 }
};

export const generateOptions = (min: number, max: number, step: number, isPlusPrefix = false) => {
    const options: string[] = [];
    for (let i = min; i <= max + 0.0001; i += step) {
        let val = i.toFixed(2);
        if (i > 0 && isPlusPrefix) val = '+' + val;
        // Handle -0.00 vs 0.00
        if (val === '-0.00') val = '0.00';
        options.push(val);
    }
    return options;
};
