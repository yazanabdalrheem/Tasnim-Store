import SEO from '../components/SEO';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <SEO title="Terms of Service" />
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 border-b pb-4">Terms of Service</h1>

                <section className="space-y-4">
                    <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
                    <p className="text-gray-700 leading-relaxed">
                        Please read these Terms of Service carefully before using the Tasnim Optic website operated by us.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-800">1. Acceptance of Terms</h2>
                    <p className="text-gray-600 text-sm">
                        By accessing or using the Service you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the Service.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-800">2. Purchases & Appointments</h2>
                    <p className="text-gray-600 text-sm">
                        When you purchase a product or book an exam, you guarantee that the information you supply is accurate, complete, and current. We reserve the right to refuse or cancel your order/booking at any time for reasons including but not limited to: product availability, errors in description/price, or other reasons.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-xl font-semibold text-gray-800">3. Changes</h2>
                    <p className="text-gray-600 text-sm">
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                    </p>
                </section>
            </div>
        </div>
    );
}
