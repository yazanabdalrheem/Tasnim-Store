import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import Card from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { MessageCircle, Clock, CheckCircle, XCircle, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ar, he, enUS } from "date-fns/locale";

interface Question {
    id: string;
    user_name: string;
    user_phone: string;
    question: string;
    status: 'pending' | 'approved' | 'rejected';
    answer?: string;
    created_at: string;
    deleted_by_user: boolean;
    deleted_at?: string;
}

export default function MyQuestions() {
    const { t, i18n } = useTranslation();
    const [user, setUser] = useState<any>(null);
    const { addToast } = useToast();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0 });

    const getDateLocale = () => {
        switch (i18n.language) {
            case 'he': return he;
            case 'ar': return ar;
            default: return enUS;
        }
    };

    const fetchQuestions = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('deleted_by_user', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setQuestions(data || []);
            setStats({
                total: data?.length || 0,
                pending: data?.filter(q => q.status === 'pending').length || 0
            });
        } catch (error: any) {
            console.error('Error fetching questions:', error);
            addToast(error.message || t('common.error'), 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleSoftDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('questions')
                .update({
                    deleted_by_user: true,
                    deleted_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            addToast(t('account.myQuestions.deleted'), 'success');
            fetchQuestions(); // Refresh list
        } catch (error: any) {
            console.error('Error deleting question:', error);
            addToast(error.message || t('common.error'), 'error');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle size={14} />
                        {t('account.myQuestions.status.approved')}
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                        <XCircle size={14} />
                        {t('account.myQuestions.status.rejected')}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock size={14} />
                        {t('account.myQuestions.status.pending')}
                    </span>
                );
        }
    };

    if (!user) {
        return (
            <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">{t('account.myQuestions.loginRequired')}</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('account.myQuestions.title')}</h2>
                    <p className="text-slate-500 mt-1">{t('account.myQuestions.subtitle')}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center px-6 py-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                        <div className="text-xs text-slate-500 mt-1">{t('account.myQuestions.stats.total')}</div>
                    </div>
                    <div className="text-center px-6 py-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
                        <div className="text-xs text-amber-600 mt-1">{t('account.myQuestions.stats.pending')}</div>
                    </div>
                </div>
            </div>

            {/* Questions List */}
            {loading ? (
                <Card className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-400">{t('common.loading')}</p>
                </Card>
            ) : questions.length === 0 ? (
                <Card className="p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">{t('account.myQuestions.empty.title')}</h3>
                    <p className="text-slate-500 mb-6">{t('account.myQuestions.empty.desc')}</p>
                    <Button onClick={() => window.location.href = '/ask'}>
                        {t('account.myQuestions.empty.cta')}
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {questions.map((question) => (
                        <Card key={question.id} className="p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {getStatusBadge(question.status)}
                                        <span className="text-xs text-slate-400">
                                            {format(new Date(question.created_at), 'PPp', { locale: getDateLocale() })}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed">{question.question}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (confirm(t('account.myQuestions.confirmDelete'))) {
                                            handleSoftDelete(question.id);
                                        }
                                    }}
                                    className="shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>

                            {question.status === 'approved' && question.answer && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <CheckCircle size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-slate-500 mb-2">{t('account.myQuestions.answerLabel')}</p>
                                            <p className="text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl">{question.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
