export default {
    client: {
        dashboard: {
            title: "مرحباً بعودتك",
            subtitle: "إليك ما يحدث اليوم",
            role: "لوحة العميل",
            needHelp: {
                title: "تحتاج مساعدة؟",
                subtitle: "فريقنا جاهز لمساعدتك",
                cta: "تواصل مع الدعم"
            },
            adminCta: {
                button: "لوحة الإدارة",
                title: "لوحة الإدارة",
                subtitle: "إدارة المحتوى والمنتجات والطلبات"
            },
            stats: {
                tickets: "طلبات الدعم",
                appointments: "المواعيد"
            },
            empty: {
                title: "لا توجد مواعيد قريبة",
                subtitle: "احجز فحص نظر بسهولة خلال أقل من دقيقة"
            },
            cta: {
                shop: {
                    title: "اكتشف أحدث الإطارات والعدسات",
                    button: "تسوق الآن"
                },
                exam: {
                    title: "فحص نظر",
                    subtitle: "احجز زيارتك للعيادة الآن",
                    button: "احجز الآن"
                }
            }
        }
    },
    common: {
        appName: "تسنيم أوبتيك",
        loading: "جاري التحميل...",
        error: "خطأ",
        save: "حفظ",
        cancel: "إلغاء",
        delete: "حذف",
        edit: "تعديل",
        view: "عرض",
        search: "بحث...",
        backToStore: "العودة للمتجر",
        backToHome: "العودة للصفحة الرئيسية",
        cart: "السلة",
        login: "دخول",
        signup: "تسجيل",
        logout: "خروج",
        bookNow: "احجز الآن",
        shopNow: "تسوق الآن",
        profile: "حسابي",
        guest: "زائر",
        language: "اللغة",
        remove: "إزالة",
        fullName: "الاسم الكامل",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        address: "العنوان",
        city: "المدينة",
        notes: "ملاحظات (اختياري)",
        backToShop: "العودة للمتجر",
        placeholders: {
            fullName: "أدخل اسمك الكامل",
            email: "name@example.com",
            phone: "050-0000000",
            address: "الشارع، رقم المبنى، الشقة",
            city: "مدينتك",
            notes: "تعليمات خاصة للتوصيل أو ملاحظات أخرى...",
            password: "كلمة المرور"
        }
    },
    checkout: {
        title: "الدفع",
        secureLabel: "مشفر وآمن",
        billingDetails: "تفاصيل الفاتورة",
        orderSummary: "ملخص الطلب",
        items: "العناصر ({{count}})",
        editCart: "تعديل السلة",
        subtotal: "المجموع الفرعي",
        shipping: "الشحن",
        free: "مجاني",
        total: "الإجمالي",
        placeOrder: "تأكيد الطلب",
        successTitle: "تم استلام الطلب!",
        successMessage: "شكراً لتسوقك معنا. سنتواصل معك قريباً.",
        couponLabel: "كوبون: {{code}}",
        discountLabel: "خصم: {{value}}",
        discountTypeFixed: "خصم ثابت",
        discountTypePercent: "خصم: {{percent}}%",
        applyCoupon: "تطبيق الكوبون",
        couponInvalidAtCheckout: "الكوبون لم يعد صالحاً، تمت إزالته.",
        orderPlacedSuccess: "تم الطلب بنجاح!",
        genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
        checkoutFailed: "فشل الدفع",
        paymentMethod: "طريقة الدفع",
        payWith: "الدفع بواسطة",
        methods: {
            cash: "نقداً / استلام من المتجر",
            paypal: "باي بال (PayPal)"
        },
        disclaimer: "بالنقر على 'تأكيد الطلب'، أنت توافق على شروط الخدمة وسياسة الخصوصية.",
        processingPayment: "جاري معالجة الدفع عبر PayPal..."
    },
    coupon: {
        apply: "تطبيق الكوبون",
        placeholder: "رمز الكوبون",
        applied: "تم تفعيل الكوبون ({code})",
        invalid: "رمز الكوبون غير صالح",
        remove: "إزالة الكوبون",
        discount: "خصم"
    },
    cart: {
        title: "السلة",
        emptyTitle: "سلتك فارغة",
        emptyMessage: "يبدو أنك لم تضف أي شيء إلى سلتك بعد.",
        continueShopping: "ابدأ التسوق",
        summary: "ملخص الطلب",
        subtotal: "المجموع الفرعي",
        shipping: "الشحن",
        free: "مجاني",
        total: "الإجمالي",
        checkout: "متابعة للدفع",
        itemsCount: "(عنصر {count})",
        added: "تمت الإضافة إلى السلة",
        removed: "تمت الإزالة من السلة",
        updated: "تم تحديث السلة",
        cleared: "تم إفراغ السلة",
        secureCheckout: "دفع آمن SSL"
    },
    wishlist: {
        title: "المفضلة",
        emptyTitle: "قائمة المفضلة فارغة",
        emptyDesc: "احفظ العناصر التي تعجبك هنا للشراء لاحقاً.",
        added: "تمت الإضافة للمفضلة",
        removed: "تمت الإزالة من المفضلة",
        loginRequired: "يرجى تسجيل الدخول لحفظ العناصر",
        viewWishlist: "عرض المفضلة"
    },
    admin: {
        layout: {
            backToDashboard: "العودة للوحة الأدمن الرئيسية",
            appName: "لوحة تحكم تسنيم",
            searchPlaceholder: "بحث في الطلبات، المنتجات، المستخدمين..."
        },
        nav: {
            overview: "نظرة عامة",
            dashboard: "لوحة التحكم",
            catalog: "الكتالوج",
            products: "المنتجات",
            categories: "التصنيفات",
            promotions: "العروض",
            coupons: "الكوبونات",
            sales: "المبيعات",
            orders: "الطلبات",
            services: "الخدمات",
            appointments: "المواعيد",
            support: "الدعم",
            faq: "الأسئلة الشائعة",
            notifications: "الإشعارات",
            admin: "الإدارة",
            users: "المستخدمين",
            content: "المحتوى",
            settings: "الإعدادات"
        },
        promotions: {
            title: "العروض والحملات",
            create: "إنشاء حملة جديدة",
            edit: "تعديل الحملة",
            formTitle: "تفاصيل الحملة",
            titleLabel: "عنوان الحملة",
            percent: "نسبة الخصم",
            start: "تاريخ البدء",
            end: "تاريخ الانتهاء",
            selectProducts: "اختر المنتجات",
            status: "الحالة",
            active: "فعال",
            inactive: "غير فعال",
            expired: "منتهي",
            upcoming: "قادم",
            productsCount: "المنتجات",
            save: "حفظ الحملة",
            delete: "حذف الحملة",
            searchProducts: "ابحث عن منتجات...",
            preview: "معاينة الشارة",
            type: "نوع الخصم",
            discountAmount: "مبلغ الخصم الثابت",
            discountPercent: "نسبة الخصم (%)"
        },
        dashboard: {
            salesChart: {
                title: "المبيعات في آخر 6 أشهر",
                subtitle: "الإيرادات الشهرية",
                orders: "الطلبات",
                revenue: "الإيرادات",
                noData: "لا توجد بيانات متاحة",
            }
        }
    },

    nav: {
        home: "الرئيسية",
        shop: "المتجر",
        bookExam: "فحص نظر",
        askTasnim: "اسأل تسنيم",
        account: "حسابي",
        admin: "إدارة",
        adminShort: "إدارة",
        about: "من نحن"
    },
    about: {
        title: "تعرّفوا على تسنيم أوبتك",
        hero: {
            subtitle: "بصريات سريرية وحلول رؤية متقدمة",
            badge: "منذ 2019",
            cred: "B.Sc في علوم الرؤية – جامعة بار إيلان"
        },
        whoAmI: {
            title: "من أنا؟",
            content: "اسمي تسنيم عباس، أخصائية فحص نظر (Optometrist) معتمدة، حاصلة على درجة B.Sc في علوم الرؤية من جامعة بار إيلان.\nلدي أكثر من 5 سنوات من الخبرة في البصريات السريرية، فحوصات النظر، وتقديم حلول رؤية متقدمة بتوصيات وتعديلات شخصية حسب احتياج كل عميل."
        },
        whyMe: {
            title: "ما الذي يميزني؟",
            items: {
                personalized: {
                    title: "تخصيص كامل",
                    desc: "كل عميل يحصل على حل يناسب عينيه بشكل دقيق."
                },
                personalTouch: {
                    title: "اهتمام شخصي",
                    desc: "خدمة دافئة، إنسانية واحترافية."
                },
                allAges: {
                    title: "خبرة مع جميع الأعمار",
                    desc: "الأطفال، البالغون وكبار السن."
                },
                mission: {
                    title: "رؤيتكم هي مهمتي",
                    desc: "التزام كامل بصحة عينيك."
                }
            }
        },
        cta: {
            title: "جاهز تشوف أفضل؟",
            book: "احجز فحص نظر",
            ask: "اسأل تسنيم"
        },
        stats: {
            experience: "+5",
            experienceDesc: "سنوات خبرة",
            patients: "+5000",
            patientsDesc: "عميل سعيد",
            certified: "100%",
            certifiedDesc: "معتمدة ومرخصة"
        }
    },
    hero: {
        title: "أهلاً بكم في متجر تسنيم أوبتيك",
        subtitle: "فحوصات نظر مهنية • ملاءمة شخصية • أناقة مضمونة",
        description: "في تسنيم أوبتيك نحن هنا لتروا بشكل أفضل.",
        bookBtn: "حجز فحص نظر",
        shopBtn: "شراء نظارات",
        askBtn: "اسأل تسنيم",
        badge: "جديد",
        trusted: "موثوق",
        authentic: "100% أصلي",
        fastBooking: "حجز سريع",
        seconds: "30 ثانية",
        topRated: "أعلى تقييم",
        rating: "4.9/5"
    },
    home: {
        bookEyeExam: "حجز فحص نظر",
        featured: "منتجات مختارة",
        viewAll: "كل المنتجات",
        viewProduct: "عرض",
        services: {
            title: "خدماتنا",
            subtitle: "حلول بصرية شاملة بدقة وأناقة",
            eyeExam: {
                title: "فحوصات نظر",
                desc: "فحص دقيق بأجهزة متطورة"
            },
            eyewear: {
                title: "نظارات وعدسات",
                desc: "ماركات موثوقة مع ضمان"
            },
            fitting: {
                title: "ملاءمة شخصية",
                desc: "راحة مثالية حسب احتياجك"
            }
        },
        whyUs: {
            title: "لماذا نحن",
            subtitle: "التميز في كل التفاصيل",
            desc: "نجمع بين التكنولوجيا المتقدمة وتشكيلة مختارة من الإطارات لنقدم لك أفضل رؤية ممكنة.",
            benefit1: {
                title: "احترافية",
                desc: "طاقم فحص مؤهل وذو خبرة"
            },
            benefit2: {
                title: "ضمان",
                desc: "ضمان كامل على جميع المنتجات والفحوصات"
            },
            benefit3: {
                title: "معاملة شخصية",
                desc: "مرافقة شخصية من الفحص حتى استلام النظارة"
            }
        },
        testimonials: {
            title: "آراء العملاء",
            role: "عميل موثق",
            text: "خدمة رائعة وتشكيلة كبيرة! أنصح به بشدة لكل من يبحث عن نظارات عالية الجودة."
        }
    },
    shop: {
        allProducts: "كل المنتجات",
        title: "المتجر",
        subtitle: "اكتشف مجموعتنا من النظارات وخدمات العناية بالنظر",
        resetFilters: "إعادة ضبط الفلاتر",
        filters: "تصفية",
        category: "الفئة",
        price: "السعر",
        addToCart: "أضف للسلة",
        outOfStock: "نفذت الكمية"
    },
    product: {
        addToCart: "أضف للسلة",
        youMightAlsoLike: "قد يعجبك أيضًا",
        freeDelivery: "توصيل مجاني",
        yearWarranty: "ضمان سنة",
        reviewsLabel: "(تقييم {rating})",
        comprehensiveCoverage: "تغطية شاملة",
        ordersOver: "للطلبات فوق 300₪"
    },
    booking: {
        selectType: "اختر نوع الفحص",

        confirm: "تأكيد الحجز",
        types: {
            eye_exam: "فحص نظر عادي",
            contact_lenses: "ملاءمة عدسات لاصقة",
            kids: "فحص نظر للأطفال",
            driving: "فحص نظر للسواقة"
        },
        title: "حجز فحص نظر",
        subtitle: "احجز موعداً لفحص شامل مع نخبة من فاحي النظر المعتمدين.",
        selectDate: "اختيار التاريخ",
        selectTime: "اختيار الوقت",
        details: "بياناتك الشخصية",
        summaryTitle: "ملخص الموعد",
        fullName: "الاسم الكامل",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني (اختياري)",
        notesOptional: "ملاحظات (اختياري)",
        notesPlaceholder: "هل هناك أي شيء محدد يجب أن نعرفه؟",
        termsText: "عند الحجز، أنت توافق على شروط الخدمة الخاصة بنا.",
        legendTaken: "محجوز",
        legendSelected: "محدد",
        legendAvailable: "متاح",
        available: "متاح",
        checking: "جاري التحقق...",
        slotTaken: "هذا الموعد تم حجزه للتو. يرجى اختيار موعد آخر.",
        successMessage: "تم حجز الموعد بنجاح! سنتواصل معك قريباً للتأكيد.",
        bookAnother: "حجز موعد آخر",
        needTimeHint: "يجب اختيار وقت للمتابعة"
    },
    footer: {
        support: "الدعم",
        contact: "تواصل معنا",
        links: "روابط",
        about: "من نحن",
        hours: "ساعات العمل",
        rights: "جميع الحقوق محفوظة",
        legal: "قانوني",
        privacy: "سياسة الخصوصية",
        terms: "شروط الاستخدام"
    },
    account: {
        menu: {
            profile: "الملف الشخصي",
            settings: "الإعدادات",
            logout: "تسجيل الخروج",
            adminPanel: "لوحة الإدارة",
        },
        title: "حسابي",
        dashboard: "لوحة التحكم",
        clientDashboard: "لوحة العملاء",
        needHelp: "هل تحتاج مساعدة؟",
        supportText: "فريقنا هنا لمساعدتك.",
        contactSupport: "تواصل مع الدعم",
        dashboardSubtitle: "إليك ملخص اليوم.",
        myBookings: "حجوزاتي",
        profile: "الملف الشخصي",
        welcomeBack: "أهلاً بك، {{name}}",
        stats: {
            appointments: "المواعيد",
            tickets: "تذاكر الدعم"
        },
        viewAll: "عرض الكل",
        nextAppointment: "موعدك القادم",
        noBookings: "لا توجد مواعيد قادمة",
        noAppointments: "لا توجد مواعيد قادمة",
        bookExamDesc: "احجز فحص نظر بسهولة في أقل من دقيقة.",
        scheduleVisit: "حدد موعد زيارتك للعيادة الآن.",
        discoverLatest: "اكتشف أحدث الإطارات والعدسات لدينا.",
        recentOrders: "آخر الطلبات",
        bookNow: "حجز موعد جديد",
        viewAllBookings: "عرض كل المواعيد",
        upcoming: "قادمة",
        history: "سجل المواعيد",
        cancelBooking: "إلغاء الموعد",
        confirmCancel: "هل أنت متأكد من إلغاء الموعد؟",
        saveChanges: "حفظ التغييرات",
        savedSuccess: "تم حفظ التغييرات بنجاح",
        fullName: "الاسم الكامل",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        myOrders: "طلباتي",
        myQuestions: {
            title: "أسئلتي / طلبات الدعم",
            subtitle: "تتبع أسئلتك واستفساراتك",
            loginRequired: "يرجى تسجيل الدخول لعرض أسئلتك",
            deleted: "تم حذف السؤال من حسابك",
            confirmDelete: "هل تريد إزالة هذا السؤال من حسابك؟",
            answerLabel: "الإجابة",
            stats: {
                total: "إجمالي  الأسئلة",
                pending: "قيد الانتظار"
            },
            status: {
                pending: "قيد المراجعة",
                approved: "تمت الموافقة",
                rejected: "مرفوض"
            },
            empty: {
                title: "لا توجد أسئلة بعد",
                desc: "لم تقم بإرسال أي أسئلة حتى الآن",
                cta: "اسأل سؤالاً"
            }
        },
        orders: {
            title: "طلباتي",
            subtitle: "تتبع طلباتك وعرض السجل",
            searchPlaceholder: "البحث في الطلبات...",
            filters: {
                status: "الحالة",
                date: "التاريخ",
                sort: "ترتيب حسب"
            },
            empty: {
                title: "لا توجد طلبات حتى الآن",
                desc: "ابدأ التسوق لظهور طلباتك هنا.",
                ctaShop: "ابدأ التسوق"
            },
            viewDetails: "عرض التفاصيل",
            downloadInvoice: "تحميل الفاتورة",
            track: "تتبع الطلب",
            reorder: "إعادة الطلب",
            cancel: "إلغاء الطلب",
            contactSupport: "تواصل مع الدعم",
            status: {
                pending: "قيد الانتظار",
                confirmed: "تم التأكيد",
                shipped: "تم الشحن",
                delivered: "تم التوصيل",
                cancelled: "ملغي"
            }
        },
        adminPanel: {
            title: "لوحة الإدارة",
            desc: "إدارة المنتجات، الطلبات، المواعيد والمحتوى.",
            cta: "دخول الإدارة"
        }
    },
    menu: {
        adminPanel: "لوحة الإدارة",
        settings: "الإعدادات",
        logout: "تسجيل الخروج"
    },
    auth: {
        notAuthorized: "عذراً، ليس لديك صلاحية للوصول لهذه الصفحة.",
        welcomeTitle: "أهلاً بكم",
        welcomeSubtitle: "سجل الدخول لمتابعة التسوق ومشاهدة طلباتك",
        trust: {
            secure: "دفع آمن",
            returns: "يسترجع بسهولة",
            support: "دعم سريع عبر واتساب"
        },
        badges: {
            securePay: "دفع آمن",
            fastShipping: "شحن سريع",
            support: "دعم مهني"
        },
        rating: "تقييم العملاء",
        bookExam: "حجز فحص نظر",
        loginTitle: "تسجيل الدخول",
        loginHelper: "أدخل التفاصيل للمتابعة",
        dividerOr: "أو",
        noAccount: "ليس لديك حساب؟",
        signupLink: "سجل الآن",
        rememberMe: "تذكرني",

        secureNote: "معلوماتك آمنة وخاصة",
        quick: {
            allProducts: "كل المنتجات",
            bookExam: "حجز فحص نظر"
        },
        comingSoon: "قريباً",
        whyChooseUsLink: "لماذا تختارنا؟",
        whyChooseUs: {
            title: "لماذا تختارنا؟",
            point1: "توصيل سريع",
            point2: "ضمان كامل لمدة عام",
            point3: "خدمة عملاء شخصية"
        },
        signupTitle: "إنشاء حساب",
        signupSubtitle: "انضم إلينا لتجربة رؤية أفضل",
        confirmPassword: "تأكيد كلمة المرور",
        passwordRules: "8 أحرف على الأقل، رقم واحد",
        agreeTerms: "أوافق على الشروط والخصوصية",
        haveAccount: "هل لديك حساب بالفعل؟",
        loginLink: "دخول",
        errors: {
            passwordMismatch: "كلمات المرور غير متطابقة",
            phoneRequired: "رقم الهاتف مطلوب"
        },
        strength: {
            weak: "ضعيف",
            medium: "متوسط",
            strong: "قوي"
        },
        forgotPasswordLink: "نسيت كلمة المرور؟",
        forgotPassword: {
            title: "إعادة تعيين كلمة المرور",
            subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
            desc: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
            emailLabel: "البريد الإلكتروني",
            submit: "إرسال رابط إعادة التعيين",
            sendLink: "إرسال رابط إعادة التعيين",
            cancel: "إلغاء",
            successTitle: "تحقق من بريدك الإلكتروني",
            successDesc: "لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى {email}.",
            backToLogin: "العودة لتسجيل الدخول",
            invalidLink: "الرابط غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.",
            errors: {
                invalidEmail: "يرجى إدخال عنوان بريد إلكتروني صالح.",
                generic: "حدث خطأ ما. يرجى المحاولة مرة أخرى."
            }
        },
        resetPassword: {
            title: "تعيين كلمة مرور جديدة",
            desc: "يرجى إدخال كلمة المرور الجديدة أدناه.",
            newPasswordLabel: "كلمة المرور الجديدة",
            confirmPasswordLabel: "تأكيد كلمة المرور الجديدة",
            submit: "تحديث كلمة المرور",
            successTitle: "تم تحديث كلمة المرور",
            successDesc: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.",
            loginNow: "تسجيل الدخول الآن"
        }
    },
    ask: {
        title: "الأسئلة والدعم",
        subtitle: "احصل على إجابات مهنية لاحتياجات رؤيتك. تصفح الأسئلة الشائعة أو استشر خبرائنا مباشرة.",
        verified: "إجابات موثقة",
        response: "رد خلال 24 ساعة",
        formTitle: "اسأل الخبير",
        formDesc: "املأ النموذج أدناه للحصول على رد مهني.",
        form: {
            fullName: "الاسم الكامل",
            fullNamePlaceholder: "أدخل اسمك الكامل",
            phone: "رقم الهاتف",
            category: "فئة",
            email: "البريد الإلكتروني (اختياري)",
            question: "سؤالك",
            placeholders: "اكتب بوضوح...",
            submit: "إرسال السؤال"
        },
        privacy: "معلوماتك آمنة وخاصة.",
        faqTab: "أسئلة شائعة",
        community: "المجتمع",
        searchPlaceholder: "كلمات دلالية مثل 'عدسات'، 'فحص'...",
        read: "اقرأ الإجابة",
        noCommunity: "لا توجد أسئلة من المجتمع بعد. كن الأول!",
        cat: {
            general: "عام",
            lens: "عدسات",
            frames: "إطارات",
            exam: "فحص نظر"
        },
        stats: {
            rating: "تقييم العملاء",
            questions: "أسئلة تمت الإجابة عليها هذا الشهر"
        },
        success: "تم إرسال السؤال بنجاح!",
        error: "خطأ في إرسال السؤال",
        updated: "تم التحديث مؤخراً",
        awaiting: "بانتظار الإجابة",
        team: "فريق تسنيم",
        cta: {
            title: "جاهز لرؤية العالم بوضوح؟",
            subtitle: "احجز فحص نظر شامل اليوم مع نخبة من فاحي النظر لدينا.",
            learnMore: "اعرف المزيد"
        }
    },

    store: {
        section: {
            hotDeals: "عروض ساخنة",
            viewAllDeals: "عرض كل العروض"
        },
        badge: {
            discountPercent: "خصم {{percent}}%"
        }
    },

    privacyPolicy: {
        title: "سياسة الخصوصية",
        subtitle: "كيف نجمع معلوماتك ونستخدمها ونحميها",
        lastUpdated: "آخر تحديث: {date}",
        tableOfContents: "جدول المحتويات",
        sections: {
            introduction: {
                title: "مقدمة",
                content: "نحن في تسنيم أوبتيك نحترم خصوصيتك ونلتزم بحماية معلوماتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك الشخصية واستخدامها وحمايتها عند استخدامك لموقعنا وخدماتنا."
            },
            informationWeCollect: {
                title: "المعلومات التي نجمعها",
                intro: "نجمع المعلومات التي تقدمها لنا مباشرة، مثل:",
                items: [
                    "معلومات الحساب: الاسم، عنوان البريد الإلكتروني، رقم الهاتف",
                    "معلومات الاتصال: عنوان الشحن وعنوان الفواتير",
                    "تفاصيل الطلب: المشتريات، الطلبات والمدفوعات",
                    "بيانات الموعد: تفاصيل فحوصات النظر والوصفات الطبية (إذا تم تقديمها)",
                    "بيانات الاستخدام: كيفية تفاعلك مع الموقع وخدماتنا"
                ]
            },
            howWeUse: {
                title: "كيف نستخدم معلوماتك",
                intro: "نستخدم المعلومات المجمعة من أجل:",
                items: [
                    "معالجة الطلبات والمدفوعات والمواعيد",
                    "إرسال تحديثات الطلب وتذكيرات المواعيد",
                    "تقديم الدعم وخدمة العملاء",
                    "تحسين موقعنا وخدماتنا",
                    "إرسال الرسائل التسويقية (بموافقتك)",
                    "منع الاحتيال وتأمين الخدمات"
                ]
            },
            cookies: {
                title: "ملفات تعريف الارتباط والتتبع",
                intro: "نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة من أجل:",
                items: [
                    "تسجيل الدخول وإدارة الجلسة (session)",
                    "تفضيلات المستخدم وحفظ سلة التسوق",
                    "التحليلات وتحسين أداء الموقع",
                    "الإعلانات المستهدفة (بموافقتك)"
                ],
                manage: "يمكنك إدارة إعدادات ملفات تعريف الارتباط في إعدادات المتصفح الخاص بك."
            },
            sharing: {
                title: "مشاركة المعلومات",
                intro: "قد نشارك معلوماتك مع:",
                items: [
                    "مزودي الخدمات: معالجة المدفوعات، الشحن والاستضافة",
                    "الالتزامات القانونية: عندما يتطلب القانون أو في إجراء قانوني",
                    "حماية الحقوق: لفرض الشروط وحماية المستخدمين"
                ],
                note: "نحن لا نبيع معلوماتك الشخصية أبداً لأطراف ثالثة لأغراض تسويقية."
            },
            dataRetention: {
                title: "الاحتفاظ بالبيانات",
                content: "نحتفظ بمعلوماتك الشخصية طالما كان حسابك نشطاً أو حسب الحاجة لتقديم الخدمات لك. يتم الاحتفاظ بالمعلومات أيضاً وفقاً للمتطلبات القانونية، لحل النزاعات وإنفاذ الاتفاقيات."
            },
            security: {
                title: "أمن المعلومات",
                content: "نستخدم تدابير أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الوصول أو التعديل أو الكشف أو التدمير غير المصرح به. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت أو طريقة تخزين إلكترونية آمنة بنسبة 100%."
            },
            yourRights: {
                title: "حقوقك",
                intro: "لديك الحقوق التالية فيما يتعلق بمعلوماتك الشخصية:",
                items: [
                    "الوصول: الحصول على نسخة من معلوماتك الشخصية",
                    "التصحيح: تحديث أو تصحيح المعلومات غير الدقيقة",
                    "الحذف: طلب حذف معلوماتك الشخصية",
                    "الاعتراض: الاعتراض على استخدام معين لمعلوماتك",
                    "إمكانية النقل: الحصول على معلوماتك بتنسيق منظم",
                    "سحب الموافقة: إلغاء الموافقة على تلقي التسويق"
                ],
                contact: "لممارسة حقوقك، يرجى الاتصال بنا باستخدام تفاصيل الاتصال أدناه."
            },
            childrensPrivacy: {
                title: "خصوصية الأطفال",
                content: "خدماتنا ليست موجهة للأطفال دون سن 13 عاماً. نحن لا نجمع عن قصد معلومات شخصية من الأطفال دون سن 13 عاماً. إذا كنت والداً أو وصياً وعلمت أن طفلك قد قدم لنا معلومات شخصية، يرجى الاتصال بنا."
            },
            changes: {
                title: "التغييرات على السياسة",
                content: "قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات مهمة عن طريق نشر السياسة الجديدة على هذا الموقع وتحديث تاريخ 'آخر تحديث'. استمرار استخدامك للخدمات بعد التغييرات يشكل موافقتك على السياسة المحدثة."
            },
            contact: {
                title: "اتصل بنا",
                intro: "إذا كان لديك أي أسئلة أو مخاوف بشأن سياسة الخصوصية هذه، يرجى الاتصال بنا:",
                email: "البريد الإلكتروني: {email}",
                phone: "الهاتف: {phone}",
                address: "العنوان: الناصرة، إسرائيل"
            }
        }
    },

};
