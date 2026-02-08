// Translation utility for Arabic/English support

export const translations = {
    en: {
        // Navigation
        dashboard: 'Dashboard',
        courses: 'Courses',
        teachers: 'Teachers',
        students: 'Students',
        users: 'Users',
        bookings: 'Bookings',
        payments: 'Payments',
        reviews: 'Reviews',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',

        // Course Detail Page
        courseDetails: 'Course Details',
        completeInfo: 'Complete course information',
        editCourse: 'Edit Course',
        enrolledStudents: 'Enrolled Students',
        price: 'Price',
        duration: 'Duration',
        created: 'Created',
        hours: 'hours',
        status: 'Status',
        courseSummary: 'Course Summary',
        courseId: 'Course ID',
        courseTeacher: 'Course Teacher',
        viewTeacherProfile: 'View Teacher Profile',
        enrolled: 'Enrolled',
        courseNotFound: 'Course not found',
        backToCourses: 'Back to Courses',
        introVideo: 'Intro Video',
        lessonsAndVideos: 'Lessons & Videos',
        lesson: 'Lesson',
        lessons: 'Lessons',
        videos: 'Videos',
        video: 'Video',
        completionRate: 'Completion Rate',
        averageProgress: 'Average Progress',
        totalRevenue: 'Total Revenue',
        courseProgress: 'Course Progress',
        enrollmentDate: 'Enrollment Date',
        completionStatus: 'Completion Status',
        completed: 'Completed',
        inProgress: 'In Progress',
        notStarted: 'Not Started',

        // Common
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        import: 'Import',
        actions: 'Actions',
        description: 'Description',
        title: 'Title',
        name: 'Name',
        email: 'Email',
        phone: 'Phone',
        address: 'Address',
        date: 'Date',
        time: 'Time',
        total: 'Total',
        subtotal: 'Subtotal',

        // Status
        active: 'Active',
        inactive: 'Inactive',
        pending: 'Pending',
        approved: 'Approved',
        rejected: 'Rejected',
        draft: 'Draft',
        published: 'Published',
        archived: 'Archived',

        // Messages
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info',
        confirmDelete: 'Are you sure you want to delete this?',
        deleteSuccess: 'Deleted successfully',
        updateSuccess: 'Updated successfully',
        createSuccess: 'Created successfully',
    },

    ar: {
        // Navigation
        dashboard: 'لوحة التحكم',
        courses: 'الدورات',
        teachers: 'المعلمين',
        students: 'الطلاب',
        users: 'المستخدمين',
        bookings: 'الحجوزات',
        payments: 'المدفوعات',
        reviews: 'التقييمات',
        settings: 'الإعدادات',
        profile: 'الملف الشخصي',
        logout: 'تسجيل الخروج',

        // Course Detail Page
        courseDetails: 'تفاصيل الدورة',
        completeInfo: 'معلومات الدورة الكاملة',
        editCourse: 'تعديل الدورة',
        enrolledStudents: 'الطلاب المسجلين',
        price: 'السعر',
        duration: 'المدة',
        created: 'تاريخ الإنشاء',
        hours: 'ساعات',
        status: 'الحالة',
        courseSummary: 'ملخص الدورة',
        courseId: 'معرف الدورة',
        courseTeacher: 'معلم الدورة',
        viewTeacherProfile: 'عرض ملف المعلم',
        enrolled: 'تاريخ التسجيل',
        courseNotFound: 'الدورة غير موجودة',
        backToCourses: 'العودة إلى الدورات',
        introVideo: 'فيديو تعريفي',
        lessonsAndVideos: 'الدروس والفيديوهات',
        lesson: 'درس',
        lessons: 'الدروس',
        videos: 'الفيديوهات',
        video: 'فيديو',
        completionRate: 'معدل الإنجاز',
        averageProgress: 'متوسط التقدم',
        totalRevenue: 'إجمالي الإيرادات',
        courseProgress: 'تقدم الدورة',
        enrollmentDate: 'تاريخ التسجيل',
        completionStatus: 'حالة الإنجاز',
        completed: 'مكتمل',
        inProgress: 'قيد التقدم',
        notStarted: 'لم يبدأ',

        // Common
        loading: 'جاري التحميل...',
        save: 'حفظ',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        search: 'بحث',
        filter: 'تصفية',
        export: 'تصدير',
        import: 'استيراد',
        actions: 'الإجراءات',
        description: 'الوصف',
        title: 'العنوان',
        name: 'الاسم',
        email: 'البريد الإلكتروني',
        phone: 'الهاتف',
        address: 'العنوان',
        date: 'التاريخ',
        time: 'الوقت',
        total: 'الإجمالي',
        subtotal: 'المجموع الفرعي',

        // Status
        active: 'نشط',
        inactive: 'غير نشط',
        pending: 'قيد الانتظار',
        approved: 'موافق عليه',
        rejected: 'مرفوض',
        draft: 'مسودة',
        published: 'منشور',
        archived: 'مؤرشف',

        // Messages
        success: 'نجح',
        error: 'خطأ',
        warning: 'تحذير',
        info: 'معلومات',
        confirmDelete: 'هل أنت متأكد من الحذف؟',
        deleteSuccess: 'تم الحذف بنجاح',
        updateSuccess: 'تم التحديث بنجاح',
        createSuccess: 'تم الإنشاء بنجاح',
    }
};

// Get translation based on language
export const t = (key, language = 'ar') => {
    const lang = translations[language] || translations.ar;
    return lang[key] || key;
};

// Language context hook
export const getLanguage = () => {
    return localStorage.getItem('language') || 'ar';
};

export const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    // Update document direction for RTL/LTR
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
};

// Initialize language on app load
export const initLanguage = () => {
    const lang = getLanguage();
    setLanguage(lang);
    return lang;
};
