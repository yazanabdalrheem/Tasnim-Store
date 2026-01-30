export default {
    client: {
        dashboard: {
            title: "ברוכים השבים",
            subtitle: "הנה מה שקורה היום",
            role: "לוח לקוח",
            needHelp: {
                title: "צריך עזרה?",
                subtitle: "הצוות שלנו כאן בשבילך",
                cta: "צור קשר עם התמיכה"
            },
            adminCta: {
                button: "לוח ניהול",
                title: "לוח ניהול",
                subtitle: "ניהול תוכן, מוצרים והזמנות"
            },
            stats: {
                tickets: "פניות",
                appointments: "תורים"
            },
            empty: {
                title: "אין תורים קרובים",
                subtitle: "קבעו בדיקת ראייה בקלות בפחות מדקה"
            },
            cta: {
                shop: {
                    title: "גלו מסגרות ועדשות חדשות",
                    button: "קנו עכשיו"
                },
                exam: {
                    title: "בדיקת ראייה",
                    subtitle: "קבעו תור לבדיקה כבר היום",
                    button: "קביעת תור"
                }
            }
        }
    },
    common: {
        appName: "תסנים אופטיק",
        loading: "טוען...",
        error: "שגיאה",
        save: "שמור",
        cancel: "ביטול",
        delete: "מחק",
        edit: "ערוך",
        view: "צפה",
        search: "חיפוש...",
        backToStore: "חזרה לחנות",
        backToHome: "חזרה לדף הבית",
        cart: "עגלה",
        login: "התחברות",
        signup: "הרשמה",
        logout: "התנתק",
        bookNow: "קבע תור",
        shopNow: "קנה עכשיו",
        profile: "פרופיל",
        guest: "אורח",
        language: "שפה",
        remove: "הסר",
        fullName: "שם מלא",
        email: "אימייל",
        phone: "טלפון",
        address: "כתובת",
        city: "עיר",
        notes: "הערות (אופציונלי)",
        backToShop: "חזרה לחנות",
        placeholders: {
            fullName: "הכנס את שמך המלא",
            email: "name@example.com",
            phone: "050-0000000",
            address: "רחוב, מספר בית, דירה",
            city: "עיר מגורים",
            notes: "הוראות מיוחדות למשלוח או הערות אחרות...",
            password: "סיסמה"
        }
    },
    checkout: {
        title: "תשלום בקופה",
        secureLabel: "מאובטח ומוצפן",
        billingDetails: "פרטי חיוב",
        orderSummary: "סיכום הזמנה",
        items: "פריטים ({{count}})",
        editCart: "ערוך עגלה",
        subtotal: "סכום ביניים",
        shipping: "משלוח",
        free: "חינם",
        total: "סה״כ לתשלום",
        placeOrder: "בצע הזמנה",
        successTitle: "ההזמנה התקבלה!",
        successMessage: "תודה על קנייתך. אנו ניצור איתך קשר בהקדם.",
        couponLabel: "קופון: {{code}}",
        discountLabel: "הנחה: {{value}}",
        discountTypeFixed: "הנחה קבועה",
        discountTypePercent: "הנחה: {{percent}}%",
        applyCoupon: "הפעל קופון",
        couponInvalidAtCheckout: "הקופון אינו תקף יותר, הוסר מההזמנה.",
        orderPlacedSuccess: "ההזמנה בוצעה בהצלחה!",
        genericError: "משהו השתבש. אנא נסה שנית.",
        checkoutFailed: "התשלום נכשל",
        paymentMethod: "שיטת תשלום",
        payWith: "שלם ב",
        methods: {
            cash: "מזומן / איסוף עצמי",
            paypal: "PayPal"
        },
        disclaimer: "בלחיצה על 'בצע הזמנה', אתם מסכימים לתנאי השימוש ומדיניות הפרטיות.",
        processingPayment: "מעבד תשלום ב-PayPal..."
    },
    coupon: {
        apply: "הפעל קופון",
        placeholder: "קוד קופון",
        applied: "קופון הופעל ({code})",
        invalid: "קוד קופון לא תקין",
        remove: "הסר קופון",
        discount: "הנחה"
    },
    cart: {
        title: "עגלה",
        emptyTitle: "העגלה שלך ריקה",
        emptyMessage: "נראה שעדיין לא הוספת כלום לעגלה.",
        continueShopping: "התחל לקנות",
        summary: "סיכום הזמנה",
        subtotal: "סכום ביניים",
        shipping: "משלוח",
        free: "חינם",
        total: "סה״כ",
        checkout: "להמשך לתשלום",
        itemsCount: "(פריט {count})",
        added: "נוסף לסל",
        removed: "הוסר מהסל",
        updated: "העגלה עודכנה",
        cleared: "העגלה נוקתה",
        secureCheckout: "תשלום מאובטח SSL",
        lensesSummary: "עדשות: {{status}} — {{type}} — {{method}}"
    },
    wishlist: {
        title: "המועדפים שלי",
        emptyTitle: "רשימת המשאלות ריקה",
        emptyDesc: "שמרו כאן פריטים שאהבתם לקנייה עתידית.",
        added: "נוסף למועדפים",
        removed: "הוסר מהמועדפים",
        loginRequired: "נא להתחבר כדי לשמור פריטים",
        viewWishlist: "צפה במועדפים"
    },
    admin: {
        layout: {
            backToDashboard: "חזרה ללוח הבקרה",
            appName: "ניהול תסנים",
            search: "חיפוש...",
            searchPlaceholder: "חפש הזמנות, מוצרים, משתמשים...",
            notifications: "התראות",
            profile: "פרופיל",
            settings: "הגדרות",
            logout: "התנתק",
            admin: "מנהל"
        },
        nav: {
            overview: "סקירה כללית",
            catalog: "קטלוג",
            sales: "מכירות",
            services: "שירותים",
            support: "תמיכה",
            admin: "ניהול",
            dashboard: "לוח בקרה",
            products: "מוצרים",
            categories: "קטגוריות",
            promotions: "מבצעים",
            coupons: "קופונים",
            orders: "הזמנות",
            appointments: "תורים",
            faq: "שאלות ותשובות",
            notifications: "התראות",
            users: "משתמשים",
            prescriptions: "מרשמים",
            content: "תוכן",
            settings: "הגדרות",
        },
        dashboard: {
            title: "לוח בקרה",
            description: "סקירת המערכת",
            kpis: {
                totalOrders: "סה״כ הזמנות",
                revenue: "הכנסות החודש",
                pendingOrders: "הזמנות ממתינות",
                totalProducts: "סה״כ מוצרים",
                appointmentsToday: "תורים היום",
                newUsers: "משתמשים חדשים (7 ימים)",
            },
            recentActivity: {
                title: "פעילות אחרונה",
                empty: "אין פעילות אחרונה",
                types: {
                    orderCreated: "הזמנה חדשה נוצרה",
                    appointmentBooked: "תור חדש נקבע",
                    productAdded: "מוצר חדש נוסף",
                    userRegistered: "משתמש חדש נרשם",
                }
            },
            quickActions: {
                title: "פעולות מהירות",
                addProduct: "הוסף מוצר",
                createPromotion: "צור מבצע",
                createCoupon: "צור קופון",
                sendNotification: "שלח התראה",
                viewOrders: "צפה בהזמנות",
                manageUsers: "נהל משתמשים",
            },
            widgets: {
                pendingOrders: "הזמנות ממתינות",
                needsAttention: "דורש תשומת לב",
                viewAll: "צפה בהכל",
                lowStock: "התראות מלאי נמוך",
                allStocked: "כל המוצרים עם מלאי מלא",
                topProducts: "מוצרים מובילים",
                noProducts: "אין מוצרים עדיין",
                quickFilters: "סינונים מהירים",
                filters: {
                    today: "היום",
                    week: "השבוע",
                    month: "החודש",
                },
            },
            salesChart: {
                title: "מכירות ב-6 החודשים האחרונים",
                subtitle: "הכנסות חודשיות",
                orders: "הזמנות",
                revenue: "הכנסות",
                noData: "אין נתונים להצגה",
            },
        },
        products: {
            title: "ניהול מוצרים",
            description: "נהל את קטלוג המוצרים",
            addProduct: "הוסף מוצר",
            editProduct: "ערוך מוצר",
            newProduct: "מוצר חדש",
            deleteProduct: "מחק מוצר",
            noImage: "אין תמונה",
            filters: {
                search: "חפש מוצרים...",
                category: "קטגוריה",
                status: "סטטוס",
                stock: "מלאי",
            },
            table: {
                image: "תמונה",
                name: "שם מוצר",
                category: "קטגוריה",
                price: "מחיר",
                stock: "מלאי",
                status: "סטטוס",
                actions: "פעולות",
            },
            empty: "אין מוצרים עדיין. הוסף את המוצר הראשון.",
            deleteConfirm: "האם אתה בטוח שברצונך למחוק מוצר זה?",
        },
        categories: {
            title: "ניהול קטגוריות",
            description: "נהל קטגוריות מוצרים",
            addCategory: "הוסף קטגוריה",
            editCategory: "ערוך קטגוריה",
            newCategory: "קטגוריה חדשה",
            deleteCategory: "מחק קטגוריה",
            table: {
                nameHe: "שם (עברית)",
                nameAr: "שם (ערבית)",
                nameEn: "שם (אנגלית)",
                productCount: "מספר מוצרים",
                actions: "פעולות",
            },
            empty: "אין קטגוריות עדיין.",
        },
        orders: {
            title: "ניהול הזמנות",
            description: "צפה ונהל הזמנות לקוחות",
            viewOrder: "צפה בהזמנה",
            updateStatus: "עדכן סטטוס",
            cancelOrder: "בטל הזמנה",
            filters: {
                search: "חפש הזמנות...",
                status: "סטטוס",
                dateRange: "טווח תאריכים",
                paymentMethod: "אמצעי תשלום",
            },
            table: {
                orderNumber: "מספר הזמנה",
                customer: "לקוח",
                date: "תאריך",
                items: "פריטים",
                total: "סה״כ",
                status: "סטטוס",
                actions: "פעולות",
            },
            status: {
                pending: "ממתין",
                confirmed: "מאושר",
                shipped: "נשלח",
                delivered: "נמסר",
                cancelled: "בוטל",
            },
            empty: "אין הזמנות עדיין.",
        },
        appointments: {
            title: "ניהול תורים",
            description: "צפה ונהל תורים לבדיקות ראייה",
            table: {
                dateTime: "תאריך ושעה",
                customer: "לקוח",
                type: "סוג",
                phone: "טלפון",
                status: "סטטוס",
                actions: "פעולות",
            },
            status: {
                pending: "ממתין",
                confirmed: "מאושר",
                completed: "הושלם",
                cancelled: "בוטל",
            },
            actions: {
                markComplete: "סמן כהושלם",
                cancel: "בטל",
                reschedule: "תזמן מחדש",
            },
            empty: "אין תורים עדיין.",
        },
        coupons: {
            title: "ניהול קופונים",
            description: "צור ונהל קודי הנחה",
            addCoupon: "הוסף קופון",
            editCoupon: "ערוך קופון",
            table: {
                code: "קוד",
                discount: "הנחה",
                type: "סוג",
                validFrom: "תקף מ-",
                validTo: "תקף עד",
                usage: "שימוש",
                status: "סטטוס",
                actions: "פעולות",
            },
            empty: "אין קופונים עדיין.",
        },
        users: {
            title: "ניהול משתמשים",
            description: "צפה ונהל חשבונות משתמשים והרשאות",
            table: {
                name: "שם",
                email: "אימייל",
                phone: "טלפון",
                role: "תפקיד",
                joined: "תאריך הצטרפות",
                lastLogin: "כניסה אחרונה",
                status: "סטטוס",
                actions: "פעולות",
            },
            roles: {
                customer: "לקוח",
                admin: "מנהל",
                super_admin: "מנהל על",
            },
            status: {
                active: "פעיל",
                blocked: "חסום",
            },
            actions: {
                changeRole: "שנה תפקיד",
                block: "חסום משתמש",
                unblock: "הסר חסימה",
                addNote: "הוסף הערה",
                viewDetails: "צפה בפרטים",
            },
            modals: {
                changeRole: {
                    title: "שנה תפקיד משתמש",
                    confirm: "האם אתה בטוח שברצונך לשנות את {user} ל-{role}?",
                    save: "שמור",
                    cancel: "ביטול",
                },
                block: {
                    title: "חסום משתמש",
                    confirm: "האם אתה בטוח שברצונך לחסום את {user}?",
                    reason: "סיבה (אופציונלי)",
                    block: "חסום",
                    cancel: "ביטול",
                },
            },
            empty: "אין משתמשים.",
        },
        promotions: {
            title: "מבצעים",
            create: "צור מבצע חדש",
            edit: "ערוך מבצע",
            formTitle: "פרטי הקמפיין",
            titleLabel: "כותרת הקמפיין",
            percent: "אחוז הנחה",
            start: "תאריך התחלה",
            end: "תאריך סיום",
            selectProducts: "בחר מוצרים",
            status: "סטטוס",
            active: "פעיל",
            inactive: "לא פעיל",
            expired: "פג תוקף",
            upcoming: "עתידי",
            productsCount: "מוצרים",
            save: "שמור קמפיין",
            delete: "מחק קמפיין",
            searchProducts: "חפש מוצרים...",
            preview: "תצוגה מקדימה",
            type: "סוג הנחה",
            discountAmount: "סכום הנחה קבוע (₪)",
            discountPercent: "אחוז הנחה (%)"
        },
        common: {
            save: "שמור",
            cancel: "ביטול",
            delete: "מחק",
            edit: "ערוך",
            view: "צפה",
            search: "חיפוש...",
            filters: "סינונים",
            clearFilters: "נקה סינונים",
            loading: "טוען...",
            noResults: "לא נמצאו תוצאות",
            actions: "פעולות",
            status: "סטטוס",
            active: "פעיל",
            inactive: "לא פעיל",
            blocked: "חסום",
            pending: "ממתין",
            confirmed: "מאושר",
            completed: "הושלם",
            cancelled: "בוטל",
            add: "הוסף",
            close: "סגור",
        },
    },

    nav: {
        home: "ראשי",
        shop: "חנות",
        bookExam: "בדיקת ראייה",
        askTasnim: "שאלי את תסנים",
        account: "חשבון",
        admin: "ניהול",
        adminShort: "ניהול",
        about: "אודות"
    },
    hero: {
        title: "ברוכים הבאים לחנות תסנים אופטיק",
        subtitle: "בדיקות ראייה מקצועיות • התאמה אישית • סטייל באחריות",
        description: "בתסנים אופטיק אנחנו כאן כדי שתראו טוב יותר.",
        bookBtn: "קביעת בדיקת ראייה",
        shopBtn: "קניית משקפיים",
        askBtn: "שאלי את תסנים",
        badge: "חדש",
        trusted: "אמין",
        authentic: "100% מקורי",
        fastBooking: "הזמנה מהירה",
        seconds: "30 שניות",
        topRated: "מדורג גבוה",
        rating: "4.9/5"
    },
    home: {
        bookEyeExam: "קבע בדיקת ראייה",
        featured: "מוצרים מומלצים",
        viewAll: "לכל המוצרים",
        viewProduct: "לצפייה",
        services: {
            title: "השירותים שלנו",
            subtitle: "פתרונות ראייה מקיפים עם דיוק וסטייל",
            eyeExam: {
                title: "בדיקות ראייה",
                desc: "בדיקה מדויקת עם ציוד מתקדם"
            },
            eyewear: {
                title: "משקפיים ועדשות",
                desc: "מותגים מובילים ואחריות מלאה"
            },
            fitting: {
                title: "התאמה אישית",
                desc: "נוחות מושלמת לפי הצורך שלך"
            }
        },
        whyUs: {
            title: "למה אנחנו",
            subtitle: "מצוינות בכל פרט",
            desc: "אנו משלבים טכנולוגיה מתקדמת עם מבחר מסגרות כדי לתת לך את הראייה הטובה ביותר.",
            benefit1: {
                title: "מקצועיות",
                desc: "צוות אופטומטריסטים מוסמך ומנוסה"
            },
            benefit2: {
                title: "אחריות",
                desc: "אחריות מלאה על כל המוצרים והבדיקות"
            },
            benefit3: {
                title: "יחס אישי",
                desc: "ליווי צמוד מהבדיקה ועד קבלת המשקפיים"
            }
        },
        testimonials: {
            title: "לקוחות ממליצים",
            role: "לקוח מאומת",
            text: "שירות מעולה ומבחר ענק! ממליץ בחום לכל מי שמחפש משקפיים איכותיים."
        }
    },
    shop: {
        allProducts: "כל המוצרים",
        title: "חנות",
        subtitle: "גלו את קולקציית המשקפיים והטיפול בראייה שלנו",
        resetFilters: "איפוס סינון",
        filters: "סינון",
        category: "קטגוריה",
        price: "מחיר",
        addToCart: "הוסף לעגלה",
        outOfStock: "אזל המלאי"
    },
    product: {
        addToCart: "הוסף לעגלה",
        youMightAlsoLike: "אולי יעניין אותך",
        freeDelivery: "משלוח חינם",
        yearWarranty: "אחריות לשנה",
        reviewsLabel: "(ביקורות {rating})",
        comprehensiveCoverage: "כיסוי מקיף",
        ordersOver: "בהזמנות מעל ₪300",
        needLensesQuestion: "האם צריך עדשות עם המרשם?",
        withPrescriptionLenses: "עם מרשם",
        frameOnly: "מסגרת בלבד (ללא עדשות)"
    },
    booking: {
        selectType: "בחר סוג בדיקה",

        confirm: "אשר תור",
        types: {
            eye_exam: "בדיקת ראייה רגילה",
            contact_lenses: "התאמת עדשות מגע",
            kids: "בדיקת ראייה לילדים",
            driving: "בדיקת ראייה לנהיגה"
        },
        title: "קביעת בדיקת ראייה",
        subtitle: "קבע תור לבדיקה מקיפה עם האופטומטריסטים המוסמכים שלנו.",
        selectDate: "בחירת תאריך",
        selectTime: "בחירת שעה",
        details: "הפרטים שלך",
        summaryTitle: "סיכום התור",
        fullName: "שם מלא",
        phone: "טלפון",
        email: "אימייל (אופציונלי)",
        notesOptional: "הערות (אופציונלי)",
        notesPlaceholder: "יש משהו ספציפי שחשוב שנדע?",
        termsText: "בלחיצה על אישור, אני מסכים/ה לתנאי השירות.",
        legendTaken: "תפוס",
        legendSelected: "נבחר",
        legendAvailable: "פנוי",
        available: "זמין",
        checking: "בודק זמינות...",
        slotTaken: "התור הזה נתפס הרגע. אנא בחר מועד אחר.",
        successMessage: "התור נקבע בהצלחה! ניצור איתך קשר בקרוב לאישור סופי.",
        bookAnother: "קבע תור נוסף",
        needTimeHint: "יש לבחור שעה כדי להמשיך"
    },
    footer: {
        support: "תמיכה",
        contact: "יצירת קשר",
        links: "קישורים",
        about: "אודות",
        hours: "שעות פעילות",
        rights: "כל הזכויות שמורות",
        legal: "משפטי",
        privacy: "מדיניות פרטיות",
        terms: "תנאי שימוש"
    },
    account: {
        menu: {
            profile: "פרופיל",
            settings: "הגדרות",
            logout: "התנתק",
            adminPanel: "פאנל ניהול",
        },
        title: "החשבון שלי",
        dashboard: "לוח בקרה",
        clientDashboard: "אזור לקוחות",
        needHelp: "צריך עזרה?",
        supportText: "הצוות שלנו כאן לשירותך.",
        contactSupport: "צור קשר",
        dashboardSubtitle: "הנה תקציר להיום.",
        myBookings: "התורים שלי",
        profile: "פרופיל אישי",
        welcomeBack: "ברוכים השבים, {{name}}",
        stats: {
            appointments: "תורים",
            tickets: "פניות"
        },
        viewAll: "צפה בהכל",
        nextAppointment: "התור הבא שלך",
        noBookings: "אין תורים עתידיים",
        noAppointments: "אין תורים עתידיים",
        bookExamDesc: "קבע בדיקת ראייה בקלות תוך פחות מדקה.",
        scheduleVisit: "תאם את הביקור שלך במרפאה עכשיו.",
        discoverLatest: "גלה את המסגרות והעדשות החדשות שלנו.",
        recentOrders: "הזמנות אחרונות",
        bookNow: "קבע תור חדש",
        viewAllBookings: "צפה בכל התורים",
        upcoming: "עתידיים",
        history: "היסטוריה",
        cancelBooking: "בטל תור",
        confirmCancel: "האם אתה בטוח שברצונך לבטל את התור?",
        saveChanges: "שמור שינויים",
        savedSuccess: "השינויים נשמרו בהצלחה",
        fullName: "שם מלא",
        phone: "טלפון",
        email: "אימייל",
        myOrders: "ההזמנות שלי",
        myQuestions: {
            title: "השאלות שלי / פניות תמיכה",
            subtitle: "עקוב אחרי השאלות והפניות שלך",
            loginRequired: "יש להתחבר כדי לצפות בשאלות שלך",
            deleted: "השאלה הוסרה מהחשבון שלך",
            confirmDelete: "האם אתה בטוח שברצונך להסיר שאלה זו מהחשבון שלך?",
            answerLabel: "תשובה",
            stats: {
                total: "סך הכל שאלות",
                pending: "ממתין"
            },
            status: {
                pending: "בבדיקה",
                approved: "אושר",
                rejected: "נדחה"
            },
            empty: {
                title: "אין שאלות עדיין",
                desc: "לא שלחת שאלות עדיין",
                cta: "שאל שאלה"
            }
        },
        orders: {
            title: "ההזמנות שלי",
            subtitle: "מעקב אחרי הזמנות וצפייה בהיסטוריה",
            searchPlaceholder: "חפש הזמנה...",
            filters: {
                status: "סטטוס",
                date: "טווח תאריכים",
                sort: "מיין לפי"
            },
            empty: {
                title: "אין עדיין הזמנות",
                desc: "התחל לקנות כדי לראות את ההזמנות שלך כאן.",
                ctaShop: "התחל לקנות"
            },
            viewDetails: "צפה בפרטים",
            downloadInvoice: "הורד חשבונית",
            track: "עקוב אחרי הזמנה",
            reorder: "הזמן שוב",
            cancel: "בטל הזמנה",
            contactSupport: "צור קשר עם תמיכה",
            status: {
                pending: "ממתין",
                confirmed: "מאושר",
                shipped: "נשלח",
                delivered: "נמסר",
                cancelled: "בוטל"
            }
        },
        adminPanel: {
            title: "לוח ניהול",
            desc: "ניהול מוצרים, הזמנות, תורים ותוכן האתר.",
            cta: "כניסה לניהול"
        }
    },
    menu: {
        adminPanel: "לוח ניהול",
        settings: "הגדרות",
        logout: "התנתק"
    },
    auth: {
        notAuthorized: "אין לך הרשאה לצפות בעמוד זה.",
        welcomeTitle: "ברוכים הבאים",
        welcomeSubtitle: "התחבר כדי להמשיך לקניות ולצפות בהזמנות שלך",
        trust: {
            secure: "תשלום מאובטח",
            returns: "החזרות קלות",
            support: "תמיכה מהירה בוואטסאפ"
        },
        badges: {
            securePay: "תשלום מאובטח",
            fastShipping: "משלוח מהיר",
            support: "תמיכה מקצועית"
        },
        rating: "דירוג לקוחות",
        bookExam: "קבע בדיקת ראייה",
        loginTitle: "התחברות",
        loginHelper: "הזן פרטים כדי להמשיך",
        dividerOr: "או",
        noAccount: "אין לך חשבון?",
        signupLink: "הירשם",
        rememberMe: "זכור אותי",

        secureNote: "המידע שלך מאובטח ופרטי",
        quick: {
            allProducts: "לכל המוצרים",
            bookExam: "קביעת בדיקת ראייה"
        },
        comingSoon: "בקרוב",
        whyChooseUsLink: "למה לבחור בנו?",
        whyChooseUs: {
            title: "למה לבחור בנו?",
            point1: "משלוח מהיר עד הבית",
            point2: "אחריות מלאה לשנה",
            point3: "שירות לקוחות אישי"
        },
        signupTitle: "הרשמה",
        signupSubtitle: "הצטרפו אלינו לחווית ראייה טובה יותר",
        confirmPassword: "אימות סיסמה",
        passwordRules: "לפחות 8 תווים, ספרה אחת",
        agreeTerms: "אני מסכים לתנאי השימוש והפרטיות",
        haveAccount: "כבר יש לך חשבון?",
        loginLink: "התחברות",
        errors: {
            passwordMismatch: "הסיסמאות אינן תואמות",
            phoneRequired: "מספר טלפון הוא שדה חובה"
        },
        strength: {
            weak: "חלש",
            medium: "בינוני",
            strong: "חזק"
        },
        forgotPasswordLink: "שכחתי סיסמה?",
        forgotPassword: {
            title: "איפוס סיסמה",
            subtitle: "הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.",
            desc: "הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה.",
            emailLabel: "כתובת אימייל",
            submit: "שלח קישור לאיפוס",
            sendLink: "שלח קישור לאיפוס",
            cancel: "ביטול",
            successTitle: "בדוק את תיבת המייל",
            successDesc: "שלחנו קישור לאיפוס סיסמה לכתובת {email}.",
            backToLogin: "חזרה להתחברות",
            invalidLink: "הקישור לא תקין או פג תוקף. אנא בקש קישור חדש.",
            errors: {
                invalidEmail: "אנא הזן כתובת אימייל תקינה.",
                generic: "משהו השתבש. אנא נסה שנית."
            }
        },
        resetPassword: {
            title: "קביעת סיסמה חדשה",
            desc: "אנא הזן את הסיסמה החדשה שלך למטה.",
            newPasswordLabel: "סיסמה חדשה",
            confirmPasswordLabel: "אימות סיסמה חדשה",
            submit: "עדכן סיסמה",
            successTitle: "הסיסמה עודכנה",
            successDesc: "הסיסמה שלך עודכנה בהצלחה. כעת ניתן להתחבר.",
            loginNow: "התחבר עכשיו"
        }
    },
    ask: {
        title: "שאלות ותמיכה",
        subtitle: "קבלו תשובות מקצועיות לצרכי הראייה שלכם. עיינו בשאלות הנפוצות או התייעצו עם המומחים שלנו ישירות.",
        verified: "תשובות מאומתות",
        response: "מענה תוך 24 שעות",
        formTitle: "שאל את המומחה",
        formDesc: "מלאו את הטופס למטה לקבלת מענה מקצועי.",
        form: {
            fullName: "שם מלא",
            fullNamePlaceholder: "הכנס את שמך המלא",
            phone: "טלפון",
            category: "קטגוריה",
            email: "אימייל (אופציונלי)",
            question: "השאלה שלך",
            placeholders: "כתוב ברור...",
            submit: "שלח שאלה"
        },
        privacy: "המידע שלך מאובטח ופרטי.",
        faqTab: "שאלות נפוצות",
        community: "קהילה",
        searchPlaceholder: "מילות מפתח כמו 'עדשות', 'בדיקה'...",
        read: "קרא תשובה",
        noCommunity: "אין עדיין שאלות מהקהילה. היה הראשון!",
        cat: {
            general: "כללי",
            lens: "עדשות",
            frames: "מסגרות",
            exam: "בדיקת ראייה"
        },
        stats: {
            rating: "דירוג לקוחות",
            questions: "שאלות שנענו החודש"
        },
        success: "השאלה נשלחה בהצלחה!",
        error: "שגיאה בשליחת השאלה",
        updated: "עודכן לאחרונה",
        awaiting: "ממתין לתשובה",
        team: "צוות תסנים",
        cta: {
            title: "מוכנים לראות את העולם בבירור?",
            subtitle: "קבעו בדיקת ראייה מקיפה עוד היום אצל האופטומטריסטים המוסמכים שלנו.",
            learnMore: "למדו עוד"
        }
    },

    store: {
        section: {
            hotDeals: "מבצעים חמים",
            viewAllDeals: "צפה בכל המבצעים"
        },
        badge: {
            discountPercent: "הנחה -{{percent}}%"
        }
    },

    privacyPolicy: {
        title: "מדיניות פרטיות",
        subtitle: "כיצד אנו אוספים, משתמשים ומגנים על המידע שלך",
        lastUpdated: "עודכן לאחרונה: {date}",
        tableOfContents: "תוכן עניינים",
        sections: {
            introduction: {
                title: "מבוא",
                content: "אנו ב-תסנים אופטיק מכבדים את פרטיותך ומחויבים להגן על המידע האישי שלך. מדיניות פרטיות זו מסבירה כיצד אנו אוספים, משתמשים ומגנים על המידע האישי שלך כאשר אתה משתמש באתר ובשירותים שלנו."
            },
            informationWeCollect: {
                title: "מידע שאנו אוספים",
                intro: "אנו אוספים מידע שאתה מספק לנו ישירות, כגון:",
                items: [
                    "פרטי חשבון: שם, כתובת אימייל, מספר טלפון",
                    "פרטי קשר: כתובת למשלוח וכתובת לחיוב",
                    "פרטי הזמנה: רכישות, הזמנות ותשלומים",
                    "נתוני תור: פרטי בדיקות ראייה ומרשמים רפואיים (במידה וסופקו)",
                    "נתוני שימוש: כיצד אתה מתקשר עם האתר והשירותים שלנו"
                ]
            },
            howWeUse: {
                title: "כיצד אנו משתמשים במידע",
                intro: "אנו משתמשים במידע שנאסף כדי:",
                items: [
                    "לעבד הזמנות, תשלומים ותורים",
                    "לשלוח עדכונים על הזמנות ותזכורות לתורים",
                    "לספק תמיכה ושירות לקוחות",
                    "לשפר את האתר והשירותים שלנו",
                    "לשלוח הודעות שיווקיות (באישורך)",
                    "למנוע הונאות ולאבטח את השירותים"
                ]
            },
            cookies: {
                title: "עוגיות ומעקב",
                intro: "אנו משתמשים בעוגיות וטכנולוגיות מעקב דומות עבור:",
                items: [
                    "התחברות וניהול סשן (session)",
                    "העדפות משתמש ושמירת עגלת קניות",
                    "אנליטיקה ושיפור ביצועי האתר",
                    "פרסום ממוקד (באישורך)"
                ],
                manage: "ניתן לנהל העדפות עוגיות בהגדרות הדפדפן שלך."
            },
            sharing: {
                title: "שיתוף ומסירת מידע",
                intro: "אנו עשויים לשתף את המידע שלך עם:",
                items: [
                    "ספקי שירות: עיבוד תשלומים, משלוחים ואירוח",
                    "דרישות חוק: כאשר נדרש על ידי חוק או בהליך משפטי",
                    "הגנה על זכויות: לאכוף את התנאים והגנה על המשתמשים"
                ],


                note: "אנו לעולם לא מוכרים את המידע האישי שלך לצדדים שלישיים למטרות שיווק."
            },
            dataRetention: {
                title: "שמירת מידע",
                content: "אנו שומרים את המידע האישי שלך כל עוד החשבון שלך פעיל או ככל שנדרש לספק לך שירותים. המידע נשמר גם על פי דרישות חוק, ליישוב סכסוכים ולאכיפת הסכמים."
            },
            security: {
                title: "אבטחת מידע",
                content: "אנו משתמשים באמצעי אבטחה טכניים וארגוניים מתאימים כדי להגן על המידע האישי שלך מפני גישה, שינוי, גילוי או השמדה לא מורשים. עם זאת, אף שיטה של העברה דרך האינטרנט או שיטת אחסון אלקטרונית אינה מאובטחת ב-100%."
            },
            yourRights: {
                title: "הזכויות שלך",
                intro: "יש לך את הזכויות הבאות בנוגע למידע האישי שלך:",
                items: [
                    "עיון: לקבל עותק של המידע האישי שלך",
                    "תיקון: לעדכן או לתקן מידע לא מדויק",
                    "מחיקה: לבקש מחיקת המידע האישי שלך",
                    "התנגדות: להתנגד לשימוש מסוים במידע שלך",
                    "ניידות: לקבל את המידע שלך בפורמט מובנה",
                    "ביטול הסכמה: לבטל הסכמה לקבלת שיווק"
                ],
                contact: "ליישום זכויותיך, צור איתנו קשר בפרטי הקשר שלהלן."
            },
            childrensPrivacy: {
                title: "פרטיות ילדים",
                content: "השירותים שלנו אינם מיועדים לילדים מתחת לגיל 13. אנו לא אוספים ביודעין מידע אישי מילדים מתחת לגיל 13. אם אתה הורה או אפוטרופוס וידוע לך שילדך סיפק לנו מידע אישי, אנא צור איתנו קשר."
            },
            changes: {
                title: "שינויים במדיניות",
                content: "אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. נודיע לך על כל שינוי משמעותי על ידי פרסום המדיניות החדשה באתר זה ועדכון תאריך 'עודכן לאחרונה'. המשך השימוש בשירותים לאחר שינויים מהווה את הסכמתך למדיניות המעודכנת."
            },
            contact: {
                title: "צור קשר",
                intro: "אם יש לך שאלות או דאגות לגבי מדיניות פרטיות זו, אנא צור איתנו קשר:",
                email: "דוא\"ל: {email}",
                phone: "טלפון: {phone}",
                address: "כתובת: נצרת, ישראל"
            }
        }
    },


    about: {
        badge: "אופטומטריסטית מוסמכת",
        intro: "שמי תסנים עבאס, אופטומטריסטית מוסמכת עם תואר B.Sc במדעי הראייה מאוניברסיטת בר-אילן. מעל 5 שנות ניסיון באופטומטריה קלינית, בדיקות ראייה והתאמות אישיות לפתרונות ראייה מתקדמים.",
        whyChooseMe: "מה מייחד אותי?",
        mission: "הראייה שלכם — המשימה שלי",
        askDetails: "שאלי את תסנים",
        features: {
            custom: {
                title: "התאמה אישית",
                desc: "כל לקוח מקבל פתרון ייחודי לעיניים שלו."
            },
            care: {
                title: "יחס אישי",
                desc: "שירות חם, אנושי ומקצועי."
            },
            ages: {
                title: "ניסיון עם מגוון גילאים",
                desc: "ילדים, מבוגרים וגיל הזהב."
            },
            precision: {
                title: "דיוק ומקצועיות",
                desc: "בדיקות מתקדמות והסברים ברורים."
            }
        },
        title: "הכירו את תסנים אופטיק",
        hero: {
            subtitle: "אופטומטריה קלינית ופתרונות ראייה מתקדמים",
            badge: "מאז 2019",
            cred1: "B.Sc במדעי הראייה – אוניברסיטת בר אילן",
            cred2: "אופטומטריסטית מוסמכת מורשית משרד הבריאות",
            cred3: "מומחית בבדיקות ראייה לילדים ומבוגרים"
        },
        whoAmI: {
            title: "מי אני?",
            content: "שמי תסנים עבאס אופטומטריסטית מוסמכת עם תואר B.Sc במדעי הראייה מאוניברסיטת בר אילן.\nמעל 5 שנות ניסיון באופטומטריה קלינית, בדיקות ראייה והתאמות אישיות לפתרונות ראייה מתקדמים."
        },
        whyMe: {
            title: "מה מייחד אותי?",
            items: {
                personalized: {
                    title: "התאמה אישית",
                    desc: "כל לקוח מקבל פתרון ייחודי לעיניים שלו."
                },
                personalTouch: {
                    title: "יחס אישי",
                    desc: "שירות חם, אנושי ומקצועי."
                },
                allAges: {
                    title: "ניסיון עם מגוון גילאים",
                    desc: "ילדים, מבוגרים וגיל הזהב."
                },
                mission: {
                    title: "הראייה שלכם – המשימה שלי",
                    desc: "מחויבות מלאה לבריאות העין שלך."
                }
            }
        },
        cta: {
            title: "מוכנים לראות טוב יותר?",
            book: "קביעת בדיקת ראייה",
            ask: "שאלו אותי שאלה"
        },
        stats: {
            years: "שנות ניסיון",
            degree: "מדעי הראייה",
            care: "יחס אישי",
            experience: "5+",
            experienceDesc: "שנות ניסיון",
            patients: "5000+",
            patientsDesc: "מטופלים מרוצים",
            certified: "100%",
            certifiedDesc: "מוסמכת ומורשית"
        },
    },
    prescription: {
        title: "פרטי מרשם",
        useCase: {
            distance: "למרחק",
            reading: "לקריאה",
            multifocal: "מולטיפוקל",
            none: "ללא מרשם (אופנה)",
            distanceDesc: "לראייה מרחוק (נהיגה, טלוויזיה)",
            readingDesc: "לעבודה מקרוב (קריאה, טלפון)",
            multifocalDesc: "עדשות מולטיפוקל לכל הטווחים",
            noneDesc: "עדשות ללא מספר"
        },
        eye: {
            od: "עין ימין (OD)",
            os: "עין שמאל (OS)"
        },
        field: {
            sphere: "מספר (SPH)",
            cylinder: "צילינדר (CYL)",
            axis: "ציר (Axis)",
            add: "ADD",
            pd: "PD (מרחק אישונים)"
        },
        actions: {
            copy: "העתק מימין לשמאל",
            next: "הבא",
            back: "חזור",
            confirm: "אישור והוספה לסל"
        },
        steps: {
            useCase: "שימוש",
            details: "הזנת פרטים",
            summary: "סיכום"
        }
    },
    rxModal: {
        title: "עדשות מרשם",
        question: "איך תרצו לספק את המרשם?",
        upload: { badge: "מומלץ" },
        manual: { badge: "הזנה מהירה" },
        help: {
            title: "לא יודעים את המרשם?",
            subtitle: "כדי לוודא התאמה מדויקת לעיניים שלכם, מומלץ לקבוע בדיקת ראייה ב-Tasnim Optic. אפשר גם לשלוח לנו הודעה דרך האתר ונעזור לכם.",
            dialogTitle: "עזרה בהתאמת עדשות",
            dialogText: "לקבלת התאמה מושלמת, קבעו בדיקת ראייה ב-Tasnim Optic או שלחו לנו הודעה דרך האתר.",
            ctaExam: "קבעו בדיקת ראייה",
            ctaMessage: "שלחו הודעה דרך האתר"
        }
    },
    lenses: {
        selectPackageTitle: "בחירת חבילת עדשות",
        chooseDetails: "בחירת פרטי עדשה"
    },

    rx: {
        question: "האם צריך עדשות עם מרשם?",
        with: "עם עדשות מרשם",

        title: "מרשם",
        none: "ללא מרשם",
        noneDesc: "קניית מסגרת בלבד",
        withGeneric: "עם מרשם", // Renamed from duplicate
        frameOnly: "מסגרת בלבד (ללא עדשות)",
        withDesc: "הזנת פרטים או העלאת קובץ",
        usage: {
            title: "סוג עדשה",
            distance: "למרחק (Distance)",
            distanceDesc: "לראייה כללית (נהיגה, טלוויזיה)",
            reading: "לקריאה (Reading)",
            readingDesc: "לעבודה מקרוב (קריאה, טלפון)",
            multifocal: "מולטיפוקל (Multifocal)",
            multifocalDesc: "פרוגרסיב (לכל המרחקים)"
        },
        method: {
            title: "איך תרצה לספק את המרשם?",
            saved: "השתמש במרשם שמור",
            manual: "מילוי פרטים ידנית",
            upload: "העלאת צילום מרשם"
        },
        noSaved: "לא נמצאו מרשמים שמורים",
        manualTitle: "הזנת פרטי מרשם",
        rightEye: "עין ימין",
        leftEye: "עין שמאל",
        pd: "מרחק בין אישונים (PD)",
        notes: "הערות (אופציונלי)",
        notesPlaceholder: "בקשות מיוחדות?",
        addToCart: "הוסף לעגלה",
        uploadTitle: "העלאת מרשם",
        tapToUpload: "לחץ להעלאה",
        uploadTypes: "תמונה או PDF",
        uploadSuccess: "הקובץ הועלה בהצלחה",
        uploadError: "העלאת הקובץ נכשלה. אנא נסה שוב.",
        error: {
            missingSph: "אנא הזן ערך Sphere (SPH)",
            missingAxis: "ציר נדרש כאשר יש צילינדר",
            selectSaved: "נא לבחור מרשם שמור",
            missingFile: "נא להעלות קובץ מרשם",
            disclaimer: "נא להזין ערכים לפי מרשם בלבד. האתר אינו תחליף לבדיקה, האחריות על נכונות הנתונים על המשתמש."
        },
        uploadPrompt: "לחץ להעלאה",
        pdTip: "אם לא ידוע לכם ה-PD, עדיף לבחור העלאת צילום מרשם.",
        fileUploaded: "הקובץ הועלה בהצלחה ✅",
        basicRequired: "נא למלא מספר (SPH) ומרחק אישונים (PD)",
        iHaveAstigmatism: "יש לי צילינדר (Astigmatism)",
        free: "חינם"
    }
};
