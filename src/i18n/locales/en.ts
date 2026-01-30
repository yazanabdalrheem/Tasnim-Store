export default {
    client: {
        dashboard: {
            title: "Welcome back",
            subtitle: "Here is what’s happening today",
            role: "Client Dashboard",
            needHelp: {
                title: "Need help?",
                subtitle: "Our team is here to assist you",
                cta: "Contact support"
            },
            adminCta: {
                button: "Admin Dashboard",
                title: "Admin Dashboard",
                subtitle: "Manage content, products, and orders"
            },
            stats: {
                tickets: "Tickets",
                appointments: "Appointments"
            },
            empty: {
                title: "No upcoming appointments",
                subtitle: "Book an eye exam easily in less than a minute"
            },
            cta: {
                shop: {
                    title: "Discover our latest frames and lenses",
                    button: "Shop now"
                },
                exam: {
                    title: "Book Eye Exam",
                    subtitle: "Schedule your visit to the clinic now",
                    button: "Book now"
                }
            }
        }
    },
    common: {
        appName: "Tasnim Optic",
        loading: "Loading...",
        error: "Error",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        view: "View",
        search: "Search...",
        backToStore: "Back to Store",
        backToHome: "Back to Home",
        cart: "Cart",
        login: "Login",
        signup: "Sign up",
        logout: "Logout",
        bookNow: "Book Now",
        shopNow: "Shop Now",
        profile: "Profile",
        guest: "Guest",
        language: "Language",
        remove: "Remove",
        fullName: "Full Name",
        email: "Email Address",
        phone: "Phone Number",
        address: "Address",
        city: "City",
        notes: "Order Notes (Optional)",
        backToShop: "Back to Shop",
        placeholders: {
            fullName: "Enter your full name",
            email: "name@example.com",
            phone: "050-0000000",
            address: "Street, Building, Apt",
            city: "Your City",
            notes: "Special instructions for delivery...",
            password: "Password"
        }
    },
    checkout: {
        title: "Checkout",
        secureLabel: "Encrypted & Secure",
        billingDetails: "Billing Details",
        orderSummary: "Order Summary",
        items: "Items ({{count}})",
        editCart: "Edit Cart",
        subtotal: "Subtotal",
        shipping: "Shipping",
        free: "Free",
        total: "Total",
        placeOrder: "Place Order",
        successTitle: "Order Confirmed!",
        successMessage: "Thank you for your purchase. We will contact you soon.",
        couponLabel: "Coupon: {{code}}",
        discountLabel: "Discount: {{value}}",
        discountTypeFixed: "Fixed discount",
        discountTypePercent: "Discount: {{percent}}%",
        applyCoupon: "Apply Coupon",
        couponInvalidAtCheckout: "Coupon was invalid at checkout time, removing.",
        orderPlacedSuccess: "Order placed successfully!",
        genericError: "Something went wrong. Please try again.",
        checkoutFailed: "Checkout failed",
        paymentMethod: "Payment Method",
        payWith: "Pay with",
        methods: {
            cash: "Cash / Pickup",
            paypal: "PayPal"
        },
        disclaimer: "By clicking \"Place Order\", you agree to our Terms of Service and Privacy Policy.",
        processingPayment: "Processing PayPal payment..."
    },
    coupon: {
        apply: "Apply Coupon",
        placeholder: "Coupon Code",
        applied: "Coupon Applied ({code})",
        invalid: "Invalid Coupon Code",
        remove: "Remove Coupon",
        discount: "Discount"
    },
    cart: {
        title: "Cart",
        emptyTitle: "Your cart is empty",
        emptyMessage: "Looks like you haven't added anything to your cart yet.",
        continueShopping: "Start Shopping",
        summary: "Order Summary",
        subtotal: "Subtotal",
        shipping: "Shipping",
        free: "Free",
        total: "Total",
        checkout: "Checkout",
        itemsCount: "(Item {count})",
        added: "Added to cart",
        removed: "Removed from cart",
        updated: "Cart updated",
        cleared: "Cart cleared",
        secureCheckout: "Secure SSL Checkout",
        lensesSummary: "Lenses: {{status}} — {{type}} — {{method}}"
    },
    wishlist: {
        title: "My Wishlist",
        emptyTitle: "Your wishlist is empty",
        emptyDesc: "Save items you love here to buy later.",
        added: "Added to wishlist",
        removed: "Removed from wishlist",
        loginRequired: "Please login to save items",
        viewWishlist: "View Wishlist"
    },
    admin: {
        layout: {
            backToDashboard: "Back to Dashboard",
            appName: "Tasnim Admin",
            searchPlaceholder: "Search orders, products, users..."
        },
        nav: {
            overview: "Overview",
            dashboard: "Dashboard",
            catalog: "Catalog",
            products: "Products",
            categories: "Categories",
            promotions: "Promotions",
            coupons: "Coupons",
            sales: "Sales",
            orders: "Orders",
            services: "Services",
            appointments: "Appointments",
            support: "Support",
            faq: "FAQ",
            notifications: "Notifications",
            admin: "Admin",
            users: "Users",
            prescriptions: "Prescriptions",
            content: "Content",
            settings: "Settings"
        },
        promotions: {
            title: "Promotions",
            create: "Create Promotion",
            edit: "Edit Promotion",
            formTitle: "Campaign Details",
            titleLabel: "Campaign Title",
            percent: "Discount Percentage",
            start: "Start Date",
            end: "End Date",
            selectProducts: "Select Products",
            status: "Status",
            active: "Active",
            inactive: "Inactive",
            expired: "Expired",
            upcoming: "Upcoming",
            productsCount: "Products",
            save: "Save Campaign",
            delete: "Delete Campaign",
            searchProducts: "Search products...",
            preview: "Badge Preview",
            type: "Discount Type",
            discountAmount: "Fixed Discount Amount",
            discountPercent: "Discount Percentage (%)"
        },
        dashboard: {
            salesChart: {
                title: "Sales in Last 6 Months",
                subtitle: "Monthly Revenue",
                orders: "Orders",
                revenue: "Revenue",
                noData: "No data available",
            }
        }
    },

    nav: {
        home: "Home",
        shop: "Shop",
        bookExam: "Eye Exam",
        askTasnim: "Ask Tasnim",
        account: "Account",
        admin: "Admin",
        about: "About"
    },
    about: {
        title: "Meet Tasnim Optic",
        hero: {
            subtitle: "Clinical Optometry & Advanced Vision Solutions",
            badge: "Since 2019",
            cred1: "B.Sc in Vision Science – Bar-Ilan University",
            cred2: "Certified Optometrist licensed by the Ministry of Health",
            cred3: "Specialist in eye exams for children and adults"
        },
        whoAmI: {
            title: "Who I am?",
            content: "My name is Tasnim Abbas, a certified optometrist with a B.Sc in Vision Science from Bar-Ilan University.\nI have over 5 years of experience in clinical optometry, eye examinations, and personalized fitting for advanced vision solutions."
        },
        whyMe: {
            title: "What makes me unique?",
            items: {
                personalized: {
                    title: "Personalized Care",
                    desc: "Every client receives a solution tailored to their eyes."
                },
                personalTouch: {
                    title: "Personal Approach",
                    desc: "Warm, human, and professional service."
                },
                allAges: {
                    title: "Experience with All Ages",
                    desc: "Children, adults, and seniors."
                },
                mission: {
                    title: "Your Vision is My Mission",
                    desc: "Full commitment to your eye health."
                }
            }
        },
        cta: {
            title: "Ready to see better?",
            book: "Book an Eye Test",
            ask: "Ask Tasnim"
        }
    },
    menu: {
        adminPanel: "Admin Panel",
        settings: "Settings",
        logout: "Logout",
        profile: "Profile"
    },
    hero: {
        title: "Welcome to Tasnim Optic",
        subtitle: "Professional Eye Exams • Personal Fit • Guaranteed Style",
        description: "At Tasnim Optic we are here so you can see better.",
        bookBtn: "Book Eye Exam",
        shopBtn: "Buy Glasses",
        askBtn: "Ask Tasnim",
        badge: "New",
        trusted: "Trusted",
        authentic: "100% Authentic",
        fastBooking: "Fast Booking",
        seconds: "30 seconds",
        topRated: "Top Rated",
        rating: "4.9/5"
    },
    home: {
        bookEyeExam: "Book Eye Exam",
        featured: "Featured Products",
        viewAll: "View all",
        viewProduct: "View",
        services: {
            title: "Our Services",
            subtitle: "Comprehensive eye care solutions with precision and style",
            eyeExam: {
                title: "Eye Exams",
                desc: "Accurate testing with modern equipment"
            },
            eyewear: {
                title: "Eyewear & Lenses",
                desc: "Top brands with warranty"
            },
            fitting: {
                title: "Personal Fitting",
                desc: "Comfort tailored to you"
            }
        },
        whyUs: {
            title: "Why Choose Us",
            subtitle: "Excellence in Every Detail",
            desc: "We combine advanced technology with a curated selection of frames to provide you with the best vision possible.",
            benefit1: {
                title: "Professionalism",
                desc: "Certified and experienced optometrists"
            },
            benefit2: {
                title: "Warranty",
                desc: "Full warranty on all products and exams"
            },
            benefit3: {
                title: "Personal Care",
                desc: "Personal guidance from exam to glasses pickup"
            }
        },
        testimonials: {
            title: "Happy Customers",
            role: "Verified Client",
            text: "Amazing service and great selection. Highly recommended for anyone looking for quality eyewear."
        }
    },
    shop: {
        allProducts: "All Products",
        title: "Shop",
        subtitle: "Discover our collection of premium eyewear and vision care products",
        resetFilters: "Reset Filters",
        filters: "Filters",
        category: "Category",
        price: "Price",
        addToCart: "Add to Cart",
        outOfStock: "Out of Stock"
    },
    product: {
        addToCart: "Add to Cart",
        youMightAlsoLike: "You Might Also Like",
        freeDelivery: "Free Delivery",
        yearWarranty: "1-Year Warranty",
        reviewsLabel: "({rating} reviews)",
        comprehensiveCoverage: "Comprehensive coverage",
        ordersOver: "Orders over ₪300",
        needLensesQuestion: "Do you need prescription lenses?",
        withPrescriptionLenses: "With Prescription Lenses",
        frameOnly: "Frame Only (No Lenses)"
    },
    booking: {
        selectType: "Select Exam Type",

        confirm: "Confirm Booking",
        types: {
            eye_exam: "Standard Eye Exam",
            contact_lenses: "Contact Lenses Fit",
            kids: "Kids Eye Exam",
            driving: "Driving Eye Exam"
        },
        title: "Book Eye Exam",
        subtitle: "Schedule a comprehensive eye examination with our certified optometrists.",
        selectDate: "Select Date",
        selectTime: "Select Time",
        details: "Your Details",
        summaryTitle: "Appointment Summary",
        fullName: "Full Name",
        phone: "Phone Number",
        email: "Email (Optional)",
        notesOptional: "Notes (Optional)",
        notesPlaceholder: "Any specific concerns?",
        termsText: "By booking, you agree to our terms of service.",
        legendTaken: "Taken",
        legendSelected: "Selected",
        legendAvailable: "Available",
        available: "Available",
        checking: "Checking availability...",
        slotTaken: "This slot was just taken. Please choose another.",
        successMessage: "Your appointment has been requested successfully. We will contact you shortly.",
        bookAnother: "Book Another",
        needTimeHint: "Please select a time to continue"
    },
    footer: {
        support: "Support",
        contact: "Contact",
        links: "Links",
        about: "About",
        hours: "Working Hours",
        rights: "All rights reserved",
        legal: "Legal",
        privacy: "Privacy Policy",
        terms: "Terms of Service"
    },
    account: {
        menu: {
            profile: "Profile",
            settings: "Settings",
            logout: "Logout",
            adminPanel: "Admin Panel",
        },
        title: "My Account",
        dashboard: "Dashboard",
        clientDashboard: "Client Dashboard",
        needHelp: "Need Help?",
        supportText: "Our team is here to assist you.",
        contactSupport: "Contact Support",
        dashboardSubtitle: "Here is what's happening today.",
        myBookings: "My Bookings",
        profile: "My Profile",
        adminPanel: {
            title: "Admin Dashboard",
            desc: "Manage content, products, and orders.",
            cta: "Go to Dashboard"
        },
        stats: {
            appointments: "Appointments",
            tickets: "Tickets"
        },
        viewAll: "View All",
        welcomeBack: "Welcome back, {{name}}",
        nextAppointment: "Next Appointment",
        noBookings: "No upcoming bookings",
        noAppointments: "No upcoming appointments",
        bookExamDesc: "Book an eye exam easily in less than a minute.",
        scheduleVisit: "Schedule your visit to the clinic now.",
        discoverLatest: "Discover our latest frames and lenses.",
        recentOrders: "Recent Orders",
        bookNow: "Book New Appointment",
        viewAllBookings: "View All Bookings",
        upcoming: "Upcoming",
        history: "History",
        cancelBooking: "Cancel Booking",
        confirmCancel: "Are you sure you want to cancel?",
        saveChanges: "Save Changes",
        savedSuccess: "Changes saved successfully",
        fullName: "Full Name",
        phone: "Phone",
        email: "Email",
        myOrders: "My Orders",
        myQuestions: {
            title: "My Questions / Support Requests",
            subtitle: "Track your questions and inquiries",
            loginRequired: "Please login to view your questions",
            deleted: "Question removed from your account",
            confirmDelete: "Are you sure you want to remove this question from your account?",
            answerLabel: "Answer",
            stats: {
                total: "Total Questions",
                pending: "Pending"
            },
            status: {
                pending: "Under Review",
                approved: "Approved",
                rejected: "Rejected"
            },
            empty: {
                title: "No questions yet",
                desc: "You haven't submitted any questions yet",
                cta: "Ask a Question"
            }
        },
        orders: {
            title: "My Orders",
            subtitle: "Track your orders and view history",
            searchPlaceholder: "Search orders...",
            filters: {
                status: "Status",
                date: "Date Range",
                sort: "Sort By"
            },
            empty: {
                title: "No orders yet",
                desc: "Start shopping to see your orders here.",
                ctaShop: "Start Shopping"

            },
            viewDetails: "View Details",
            downloadInvoice: "Download Invoice",
            track: "Track Order",
            reorder: "Reorder",
            cancel: "Cancel Order",
            contactSupport: "Contact Support",
            status: {
                pending: "Pending",
                confirmed: "Confirmed",
                shipped: "Shipped",
                delivered: "Delivered",
                cancelled: "Cancelled"
            }
        },

    },

    auth: {
        notAuthorized: "Access Denied: You do not have permission to view this page.",
        welcomeTitle: "Welcome Back",
        welcomeSubtitle: "Login to continue shopping and view your orders",
        trust: {
            secure: "Secure Payment",
            returns: "Easy Returns",
            support: "Fast Support"
        },
        badges: {
            securePay: "Secure Payment",
            fastShipping: "Fast Shipping",
            support: "Professional Support"
        },
        rating: "Customer Rating",
        bookExam: "Book Eye Exam",
        loginTitle: "Login",
        loginHelper: "Enter your details to continue",
        dividerOr: "OR",
        noAccount: "Don't have an account?",
        signupLink: "Sign up",
        rememberMe: "Remember me",

        secureNote: "Your information is secure and private",
        quick: {
            allProducts: "All Products",
            bookExam: "Book Eye Exam"
        },
        comingSoon: "Coming Soon",
        whyChooseUsLink: "Why choose us?",
        whyChooseUs: {
            title: "Why choose us?",
            point1: "Fast home delivery",
            point2: "Full 1-year warranty",
            point3: "Personal customer service"
        },
        signupTitle: "Create Account",
        signupSubtitle: "Join us for a better vision experience",
        confirmPassword: "Confirm Password",
        passwordRules: "Min 8 chars, 1 number",
        agreeTerms: "I agree to Terms & Privacy",
        haveAccount: "Already have an account?",
        loginLink: "Login",
        errors: {
            passwordMismatch: "Passwords do not match",
            phoneRequired: "Phone number is required"
        },
        strength: {
            weak: "Weak",
            medium: "Medium",
            strong: "Strong"
        },
        forgotPasswordLink: "Forgot password?",
        forgotPassword: {
            title: "Reset Password",
            subtitle: "Enter your email address and we'll send you a link to reset your password.",
            desc: "Enter your email address and we'll send you a link to reset your password.",
            emailLabel: "Email Address",
            submit: "Send Reset Link",
            sendLink: "Send Reset Link",
            cancel: "Cancel",
            successTitle: "Check your email",
            successDesc: "We have sent a password reset link to {email}.",
            backToLogin: "Back to Login",
            invalidLink: "Invalid or expired link. Please request a new one.",
            errors: {
                invalidEmail: "Please enter a valid email address.",
                generic: "Something went wrong. Please try again."
            }
        },
        resetPassword: {
            title: "Set New Password",
            desc: "Please enter your new password below.",
            newPasswordLabel: "New Password",
            confirmPasswordLabel: "Confirm New Password",
            submit: "Update Password",
            successTitle: "Password Updated",
            successDesc: "Your password has been successfully updated. You can now login.",
            loginNow: "Login Now"
        }
    },
    ask: {
        title: "Questions & Support",
        subtitle: "Get professional answers for your vision needs. Browse our common questions or consult our experts directly.",
        verified: "Verified Answers",
        response: "Response within 24h",
        formTitle: "Ask the Expert",
        formDesc: "Fill out the form below to get a professional response.",
        form: {
            fullName: "Full Name",
            fullNamePlaceholder: "Enter your full name",
            phone: "Phone",
            category: "Category",
            email: "Email (Optional)",
            question: "Your Question",
            placeholders: "Type clearly...",
            submit: "Send Question"
        },
        privacy: "Your information is secure and private.",
        faqTab: "Common Questions",
        community: "Community",
        searchPlaceholder: "Keywords like 'Lens', 'Exam'...",
        read: "Read Answer",
        noCommunity: "No community questions yet. Be the first!",
        cat: {
            general: "General",
            lens: "Lenses",
            frames: "Frames",
            exam: "Eye Exam"
        },
        stats: {
            rating: "Customer Rating",
            questions: "Questions answered this month"
        },
        success: "Question submitted successfully!",
        error: "Error submitting question",
        updated: "Updated recently",
        awaiting: "Awaiting Answer",
        team: "Tasnim Team",
        cta: {
            title: "Ready to see the world clearly?",
            subtitle: "Book your comprehensive eye exam today with our certified optometrists.",
            learnMore: "Learn More"
        }
    },

    store: {
        section: {
            hotDeals: "Hot deals",
            viewAllDeals: "View all deals"
        },
        badge: {
            discountPercent: "Save {{percent}}%"
        }
    },

    privacyPolicy: {
        title: "Privacy Policy",
        subtitle: "How we collect, use, and protect your information",
        lastUpdated: "Last updated: {date}",
        tableOfContents: "Table of Contents",
        sections: {
            introduction: {
                title: "Introduction",
                content: "At Tasnim Optic, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our website and services."
            },
            informationWeCollect: {
                title: "Information We Collect",
                intro: "We collect information you provide directly to us, such as:",
                items: [
                    "Account information: name, email address, phone number",
                    "Contact details: shipping and billing addresses",
                    "Order details: purchases, orders, and payments",
                    "Appointment data: eye exam details and prescriptions (if provided)",
                    "Usage data: how you interact with our website and services"
                ]
            },
            howWeUse: {
                title: "How We Use Your Information",
                intro: "We use the collected information to:",
                items: [
                    "Process orders, payments, and appointments",
                    "Send order updates and appointment reminders",
                    "Provide customer support and service",
                    "Improve our website and services",
                    "Send marketing communications (with your consent)",
                    "Prevent fraud and secure our services"
                ]
            },
            cookies: {
                title: "Cookies & Tracking",
                intro: "We use cookies and similar tracking technologies for:",
                items: [
                    "Login and session management",
                    "User preferences and shopping cart storage",
                    "Analytics and website performance improvement",
                    "Targeted advertising (with your consent)"
                ],
                manage: "You can manage cookie preferences in your browser settings."
            },
            sharing: {
                title: "Sharing & Disclosure",
                intro: "We may share your information with:",
                items: [
                    "Service providers: payment processing, shipping, and hosting",
                    "Legal requirements: when required by law or in legal proceedings",
                    "Rights protection: to enforce our terms and protect users"
                ],
                note: "We never sell your personal information to third parties for marketing purposes."
            },
            dataRetention: {
                title: "Data Retention",
                content: "We retain your personal information as long as your account is active or as needed to provide you services. Information is also retained as required by law, to resolve disputes, and to enforce agreements."
            },
            security: {
                title: "Information Security",
                content: "We use appropriate technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage method is 100% secure."
            },
            yourRights: {
                title: "Your Rights",
                intro: "You have the following rights regarding your personal information:",
                items: [
                    "Access: obtain a copy of your personal information",
                    "Correction: update or correct inaccurate information",
                    "Deletion: request deletion of your personal information",
                    "Object: object to certain uses of your information",
                    "Portability: receive your information in a structured format",
                    "Withdraw consent: cancel consent to receive marketing"
                ],
                contact: "To exercise your rights, please contact us using the details below."
            },
            childrensPrivacy: {
                title: "Children's Privacy",
                content: "Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us."
            },
            changes: {
                title: "Changes to This Policy",
                content: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this website and updating the 'Last updated' date. Your continued use of the services after changes constitutes your acceptance of the updated policy."
            },
            contact: {
                title: "Contact Us",
                intro: "If you have any questions or concerns about this Privacy Policy, please contact us:",
                email: "Email: {email}",
                phone: "Phone: {phone}",
                address: "Address: Nazareth, Israel"
            }
        }
    },

    prescription: {
        title: "Prescription Details",
        useCase: {
            distance: "Distance",
            reading: "Reading",
            multifocal: "Multifocal",
            none: "None (Fashion/ Non-Rx)",
            distanceDesc: "For seeing things far away (driving, TV)",
            readingDesc: "For close work (reading, phone)",
            multifocalDesc: "Progressive lenses for all distances",
            noneDesc: "Lenses without prescription power"
        },
        eye: {
            od: "OD",
            os: "OS"
        },
        field: {
            sphere: "Sphere (SPH)",
            cylinder: "Cylinder (CYL)",
            axis: "Axis",
            add: "ADD",
            pd: "PD (Pupillary Distance)"
        },
        actions: {
            copy: "Copy OD to OS",
            next: "Next",
            back: "Back",
            confirm: "Confirm & Add to Cart"
        },
        steps: {
            useCase: "Use Case",
            details: "Enter Details",
            summary: "Summary"
        }
    },
    rxModal: {
        title: "Prescription Lenses",
        question: "How would you like to provide your prescription?",
        upload: { badge: "Recommended" },
        manual: { badge: "Quick Entry" },
        help: {
            title: "I don’t know my prescription",
            subtitle: "For the most accurate lenses, we recommend visiting Tasnim Optic for an eye exam. You can also send us a message in the site and we’ll help.",
            dialogTitle: "Help choosing lenses",
            dialogText: "For a perfect match, book an eye exam at Tasnim Optic or send us a message in the site.",
            ctaExam: "Book an eye exam",
            ctaMessage: "Send a message in the site"
        }
    },
    lenses: {
        selectPackageTitle: "Select Lens Package",
        chooseDetails: "Choose Lenses Details"
    },

    rx: {
        question: "Do you need prescription lenses?",
        with: "With Prescription Lenses",
        frameOnly: "Frame Only (No Lenses)",
        title: "Prescription",
        none: "No prescription",
        noneDesc: "Buy frames only",
        withGeneric: "With prescription",
        withDesc: "Enter details or upload",
        usage: {
            title: "Lens Type",
            distance: "Distance",
            distanceDesc: "For general vision (driving, TV)",
            reading: "Reading",
            readingDesc: "For close work",
            multifocal: "Progressive (Multifocal)",
            multifocalDesc: "See near, far, and in-between"
        },
        method: {
            title: "How to provide prescription?",
            saved: "Use saved prescription",
            manual: "✍️ Enter Numbers Manually",
            upload: "📷 Upload Prescription Image",
            help: "🩺 I don't know – Book Exam/Contact"
        },
        noSaved: "No saved prescription found",
        manualTitle: "Enter Prescription Details",
        rightEye: "OD",
        leftEye: "OS",
        pd: "PD (Pupillary Distance)",
        notes: "Notes (Optional)",
        notesPlaceholder: "Any special requests?",
        addToCart: "Add to Cart",
        uploadTitle: "Upload Prescription",
        uploadPrompt: "Click to upload",
        tapToUpload: "Tap to upload",
        uploadTypes: "Images or PDF",
        uploadSuccess: "File uploaded successfully",
        uploadError: "Failed to upload file. Please try again.",
        doYouNeedLenses: "Do you need prescription lenses?",

        withLenses: "Yes, Prescription Lenses",
        chooseLenses: "Choose Lenses",
        chooseMethod: "How do you want to provide your prescription?",
        recommended: "(Recommended)",
        quickEntry: "Quick Entry",
        contactUs: "Contact us or Book Exam",
        pdTip: "If you don't know your PD, choose 'Upload' instead.",
        fileUploaded: "File Uploaded ✅",
        basicRequired: "Please fill SPH and PD",
        iHaveAstigmatism: "I have Astigmatism (Cylinder)",
        selectPackage: "Select Lenses Package",
        modalTitle: "Prescription Lenses",
        free: "Free",
        od: "OD",
        os: "OS",
        error: {
            missingSph: "Please enter Sphere (SPH) value",
            missingAxis: "Axis is required when Cylinder is present",
            selectSaved: "Please select a saved prescription",
            missingFile: "Please upload a prescription file",
            uploadRequired: "Please upload a prescription file",
            pdRequired: "Please enter PD",
            basicRequired: "Please enter SPH and PD",
            sphRequired: "Please enter SPH",
            axisRequired: "Please enter Axis",
            disclaimer: 'Please enter values exactly as in your prescription. This website is not a substitute for an eye exam; you are responsible for the accuracy of the entered data.'
        }
    }
};
