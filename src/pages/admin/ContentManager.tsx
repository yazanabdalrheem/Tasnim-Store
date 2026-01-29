import { useState, useEffect } from 'react';
import { useContent, type SettingValue } from '../../context/ContentContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, Search, Plus, Trash2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ContentManager() {
    const { rawContent, refreshContent, updateContent } = useContent();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newKey, setNewKey] = useState('');
    const [loading, setLoading] = useState(false);

    // Filter keys
    const filteredItems = rawContent.filter(item => item.key.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleSave = async (key: string, values: { he: string, ar: string, en: string }) => {
        try {
            await updateContent(key, values);
        } catch (error) {
            alert('Failed to save');
            console.error(error);
        }
    };

    const handleAddKey = async () => {
        if (!newKey) return;
        setLoading(true);
        try {
            // Check if exists
            if (rawContent.find(c => c.key === newKey)) {
                alert('Key already exists');
                return;
            }
            await updateContent(newKey, { he: '', ar: '', en: '' });
            setNewKey('');
            setShowAddModal(false);
            refreshContent();
        } catch (error) {
            console.error(error);
            alert('Failed to create key');
        } finally {
            setLoading(false);
        }
    };

    const handleInitialize = async () => {
        if (!confirm('This will create missing keys for Home Page. Continue?')) return;
        setLoading(true);
        const DEFAULT_KEYS = [
            // Banner
            { key: 'home.banner.text', he: 'משלוח חינם בקנייה מעל 299₪', ar: 'توصيل مجاني عند الشراء بأكثر من 299 ش.ج', en: 'Free shipping on orders over 299₪' },
            // Hero
            { key: 'home.hero.badge', he: 'בדיקות ראייה ומותגים', ar: 'فحص نظر وماركات', en: 'Premium Eye Care' },
            { key: 'home.hero.title', he: 'ראה את העולם בבירור', ar: 'שاهد العالم بوضوح', en: 'See the World Clearly' },
            { key: 'home.hero.subtitle', he: 'בדיקות ראייה מקצועיות והתאמה אישית.', ar: 'فحوصات نظر مهنية وملاءمة شخصية.', en: 'Professional eye exams and premium eyewear.' },
            // Services
            { key: 'home.services.title', he: 'השירותים שלנו', ar: 'خدماتنا', en: 'Our Premium Services' },
            { key: 'home.services.1.title', he: 'בדיקות ראייה', ar: 'فحص نظر', en: 'Eye Exams' },
            { key: 'home.services.1.desc', he: 'בדיקה מקיפה עם ציוד מתקדם.', ar: 'فحص شامل بأحدث الأجهزة.', en: 'Comprehensive vision testing.' },
            { key: 'home.services.2.title', he: 'עדשות מגע', ar: 'عدسات لاصقة', en: 'Contact Lenses' },
            { key: 'home.services.2.desc', he: 'התאמה אישית של עדשות מגע.', ar: 'ملاءمة شخصية للعدسات.', en: 'Personalized contact lens fitting.' },
            { key: 'home.services.3.title', he: 'מסגרות מותגים', ar: 'إطارات ماركات', en: 'Brand Frames' },
            { key: 'home.services.3.desc', he: 'מבחר ענק של מותגים בינלאומיים.', ar: 'تشكيلة واسعة من الماركات العالمية.', en: 'Huge selection of international brands.' },
            // Trust
            { key: 'home.trust.subtitle', he: 'למה לבחור בנו', ar: 'لماذا نحن', en: 'WHY CHOOSE US' },
            { key: 'home.trust.title', he: 'מצוינות בטיפול בעיניים', ar: 'التميز في العناية بالعيون', en: 'Excellence in Eye Care' },
            { key: 'home.trust.1.title', he: 'צוות מקצועי', ar: 'طاقم مهني', en: 'Professional Staff' },
            { key: 'home.trust.1.desc', he: 'אופטומטריסטים מוסמכים עם ניסיון.', ar: 'أخصائيو بصريات معتمدون ذوو خبرة.', en: 'Certified optometrists with experience.' },
            { key: 'home.trust.2.title', he: 'ציוד מתקדם', ar: 'معدات متطورة', en: 'Advanced Equipment' },
            { key: 'home.trust.2.desc', he: 'טכנולוגיה חדישה לבדיקות מדויקות.', ar: 'تكنولوجيا حديثة لفحوصات دقيقة.', en: 'Latest technology for accurate exams.' },
            { key: 'home.trust.3.title', he: 'אחריות ושירות', ar: 'كفالة وخدمة', en: 'Warranty & Service' },
            { key: 'home.trust.3.desc', he: 'אחריות מלאה על כל המוצרים.', ar: 'كفالة كاملة على جميع المنتجات.', en: 'Full warranty on all products.' },
            // Testimonials
            { key: 'home.testimonials.title', he: 'לקוחות ממליצים', ar: 'توصيات الزبائن', en: 'Happy Customers' },
            { key: 'home.testimonials.1.text', he: 'שירות מדהים ומקצועי!', ar: 'خدمة رائعة ومهنية!', en: 'Amazing and professional service!' },
            { key: 'home.testimonials.1.name', he: 'דניאל כהן', ar: 'دانيال كوهين', en: 'Daniel Cohen' },
            { key: 'home.testimonials.1.role', he: 'לקוח מרוצה', ar: 'زبون راضٍ', en: 'Verified Client' },
            { key: 'home.testimonials.2.text', he: 'המשקפיים הכי יפים שקניתי.', ar: 'أجمل نظارات اشتريتها.', en: 'The most beautiful glasses I bought.' },
            { key: 'home.testimonials.2.name', he: 'שרה לוי', ar: 'سارة ليفي', en: 'Sarah Levy' },
            { key: 'home.testimonials.2.role', he: 'לקוחה ותיקה', ar: 'زبونة قديمة', en: 'Loyal Customer' },
            { key: 'home.testimonials.3.text', he: 'בדיקה יסודית ומדויקת.', ar: 'فحص دقيق وشامل.', en: 'Thorough and accurate exam.' },
            { key: 'home.testimonials.3.name', he: 'אחמד מסרי', ar: 'أحمد مصري', en: 'Ahmed Masri' },
            { key: 'home.testimonials.3.role', he: 'ממליץ בחום', ar: 'أنصح بشدة', en: 'Highly Recommend' },
        ];

        try {
            for (const item of DEFAULT_KEYS) {
                // Only create if not exists
                if (!rawContent.find(c => c.key === item.key)) {
                    await updateContent(item.key, { he: item.he, ar: item.ar, en: item.en });
                }
            }
            refreshContent();
            alert('Defaults initialized!');
        } catch (error) {
            console.error(error);
            alert('Error initializing defaults');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteKey = async (key: string) => {
        if (!confirm(`Are you sure you want to delete "${key}"?`)) return;

        try {
            const { error } = await supabase.from('site_content').delete().eq('key', key);
            if (error) throw error;
            refreshContent();
        } catch (error) {
            console.error(error);
            alert('Failed to delete');
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Content Manager</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={() => setShowAddModal(true)}>
                        <Plus size={18} className="mr-2" /> Add Key
                    </Button>
                    <Button variant="outline" onClick={handleInitialize} isLoading={loading}>
                        Initialize Defaults
                    </Button>
                </div>
            </div>

            {/* Helper to initialize keys */}
            {/* <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-6">
                Tip: Click "Initialize Defaults" to generate all the keys needed for the Home Page.
            </div> */}

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search content keys..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
            </div>

            <div className="grid gap-6">
                {filteredItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">No content keys found.</div>
                ) : (
                    filteredItems.map((item) => (
                        <ContentEditor
                            key={item.key}
                            contentKey={item.key}
                            initialValue={{ he: item.value_he || '', ar: item.value_ar || '', en: item.value_en || '' }}
                            onSave={handleSave}
                            onDelete={handleDeleteKey}
                        />
                    ))
                )}
            </div>

            {/* Add Key Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="font-bold text-lg mb-4">Add New Content Key</h3>
                        <Input
                            label="Key Name (e.g., home.hero.title)"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="section.component.field"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button onClick={handleAddKey} isLoading={loading}>Create</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-component same as before but types adjusted
function ContentEditor({ contentKey, initialValue, onSave, onDelete }: { contentKey: string, initialValue: SettingValue, onSave: (k: string, v: SettingValue) => Promise<void>, onDelete: (k: string) => void }) {
    const [value, setValue] = useState(initialValue);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setValue(initialValue);
        setDirty(false);
    }, [initialValue]);

    const handleChange = (lang: string, val: string) => {
        // @ts-ignore
        setValue(prev => ({ ...prev, [lang]: val }));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(contentKey, value);
        setSaving(false);
        setDirty(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10">{contentKey}</code>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(contentKey)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete Key"
                    >
                        <Trash2 size={16} />
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSave}
                        isLoading={saving}
                        disabled={!dirty}
                        variant={dirty ? 'primary' : 'outline'}
                        className={dirty ? '' : 'border-gray-200 text-gray-400'}
                    >
                        {dirty ? <Save size={16} className="mr-2" /> : <Check size={16} className="mr-2" />}
                        {dirty ? 'Save' : 'Saved'}
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Hebrew</label>
                    <textarea
                        className="w-full min-h-[80px] p-3 text-sm border border-gray-200 rounded-lg text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        dir="rtl"
                        value={value.he || ''}
                        onChange={e => handleChange('he', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Arabic</label>
                    <textarea
                        className="w-full min-h-[80px] p-3 text-sm border border-gray-200 rounded-lg text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        dir="rtl"
                        value={value.ar || ''}
                        onChange={e => handleChange('ar', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">English</label>
                    <textarea
                        className="w-full min-h-[80px] p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        dir="ltr"
                        value={value.en || ''}
                        onChange={e => handleChange('en', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
