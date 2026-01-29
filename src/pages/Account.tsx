import { useTranslation } from "react-i18next";

export default function Account() {
    const { t } = useTranslation();
    return <div className="p-8 text-center"><h1 className="text-3xl font-bold">{t('nav.account')}</h1><p className="mt-4 text-gray-500">Coming Soon</p></div>;
}
