import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Edit, MessageCircle } from 'lucide-react';
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';

export default function FAQManager() {
    const [activeTab, setActiveTab] = useState<'faq' | 'questions'>('faq');
    const [faqs, setFaqs] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingFaq, setEditingFaq] = useState<any | null>(null);
    const [isNewFaq, setIsNewFaq] = useState(false);

    // For answering questions
    const [answerText, setAnswerText] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'faq') {
                const { data } = await supabase.from('faq').select('*').order('created_at', { ascending: true });
                setFaqs(data || []);
            } else {
                const { data } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
                setQuestions(data || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveFaq = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isNewFaq) {
                const { error } = await supabase.from('faq').insert([editingFaq]);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('faq').update(editingFaq).eq('id', editingFaq.id);
                if (error) throw error;
            }
            setEditingFaq(null);
            setIsNewFaq(false);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error saving FAQ');
        }
    };

    const handleDeleteFaq = async (id: string) => {
        if (!confirm('Delete this FAQ?')) return;
        await supabase.from('faq').delete().eq('id', id);
        fetchData();
    };

    const handleAnswerQuestion = async (id: string) => {
        if (!answerText) return;
        try {
            const { error } = await supabase.from('questions').update({
                answer: answerText,
                is_public: true,
                status: 'answered'
            }).eq('id', id);

            if (error) throw error;
            alert('Question answered and published!');
            setAnswerText('');
            setSelectedQuestion(null);
            fetchData();
        } catch (error) {
            console.error(error);
            alert('Error answering question');
        }
    };

    const toggleQuestionVisibility = async (id: string, currentStatus: boolean) => {
        await supabase.from('questions').update({ is_public: !currentStatus }).eq('id', id);
        fetchData();
    };

    const startNewFaq = () => {
        setEditingFaq({ question_he: '', question_ar: '', question_en: '', answer_he: '', answer_ar: '', answer_en: '', category: 'General' });
        setIsNewFaq(true);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">FAQ & Questions Manager</h1>
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('faq')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'faq' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                    >
                        FAQ Content
                    </button>
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'questions' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
                    >
                        User Questions
                    </button>
                </div>
            </div>

            {activeTab === 'faq' ? (
                <div>
                    {!editingFaq ? (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <Button onClick={startNewFaq}><Plus size={16} className="mr-2" /> New FAQ</Button>
                            </div>
                            <div className="grid gap-4">
                                {faqs.map(faq => (
                                    <div key={faq.id} className="bg-white p-4 rounded-lg border flex justify-between items-start">
                                        <div>
                                            <div className="font-bold mb-1">{faq.question_en || faq.question_he}</div>
                                            <div className="text-sm text-gray-500 line-clamp-2">{faq.answer_en || faq.answer_he}</div>
                                            <div className="text-xs bg-gray-100 px-2 py-1 rounded inline-block mt-2">{faq.category}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingFaq(faq)} className="p-2 text-gray-400 hover:text-primary"><Edit size={18} /></button>
                                            <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border">
                            <h3 className="font-bold mb-4">{isNewFaq ? 'Create FAQ' : 'Edit FAQ'}</h3>
                            <form onSubmit={handleSaveFaq} className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Hebrew Question</label>
                                        <Input dir="rtl" value={editingFaq.question_he} onChange={e => setEditingFaq({ ...editingFaq, question_he: e.target.value })} />
                                        <label className="text-xs font-bold uppercase text-gray-500">Hebrew Answer</label>
                                        <textarea dir="rtl" className="w-full border rounded p-2 text-sm" rows={3} value={editingFaq.answer_he} onChange={e => setEditingFaq({ ...editingFaq, answer_he: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Arabic Question</label>
                                        <Input dir="rtl" value={editingFaq.question_ar} onChange={e => setEditingFaq({ ...editingFaq, question_ar: e.target.value })} />
                                        <label className="text-xs font-bold uppercase text-gray-500">Arabic Answer</label>
                                        <textarea dir="rtl" className="w-full border rounded p-2 text-sm" rows={3} value={editingFaq.answer_ar} onChange={e => setEditingFaq({ ...editingFaq, answer_ar: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">English Question</label>
                                        <Input dir="ltr" value={editingFaq.question_en} onChange={e => setEditingFaq({ ...editingFaq, question_en: e.target.value })} />
                                        <label className="text-xs font-bold uppercase text-gray-500">English Answer</label>
                                        <textarea dir="ltr" className="w-full border rounded p-2 text-sm" rows={3} value={editingFaq.answer_en} onChange={e => setEditingFaq({ ...editingFaq, answer_en: e.target.value })} />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button type="button" variant="ghost" onClick={() => { setEditingFaq(null); setIsNewFaq(false); }}>Cancel</Button>
                                    <Button type="submit">Save FAQ</Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {questions.length === 0 && <div className="text-center py-10 text-gray-500">No questions found.</div>}
                    {questions.map(q => (
                        <div key={q.id} className={`bg-white p-5 rounded-xl border ${q.status === 'pending' ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${q.status === 'answered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        <MessageCircle size={16} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{q.user_name} <span className="text-xs font-normal text-gray-500">({q.user_phone})</span></div>
                                        <div className="text-xs text-gray-400">{new Date(q.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleQuestionVisibility(q.id, q.is_public)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold ${q.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {q.is_public ? 'Public' : 'Hidden'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-800 font-medium mb-4 p-3 bg-white rounded-lg border border-gray-100">
                                {q.question}
                            </p>

                            {q.answer ? (
                                <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm">
                                    <span className="font-bold text-green-800 block mb-1">Answer:</span>
                                    {q.answer}
                                </div>
                            ) : (
                                selectedQuestion === q.id ? (
                                    <div className="mt-4">
                                        <textarea
                                            placeholder="Type your answer here..."
                                            className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none mb-3"
                                            rows={3}
                                            value={answerText}
                                            onChange={e => setAnswerText(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleAnswerQuestion(q.id)}>Publish Answer</Button>
                                            <Button size="sm" variant="ghost" onClick={() => setSelectedQuestion(null)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedQuestion(q.id); setAnswerText(''); }}>
                                        Answer Question
                                    </Button>
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
