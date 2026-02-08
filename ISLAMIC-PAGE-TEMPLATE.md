# 🕌 نموذج تطبيق الهوية الإسلامية على الصفحات - منصة ترتيل

## 📋 دليل التطبيق السريع

هذا الدليل يوضح كيفية تطبيق الهوية الإسلامية على أي صفحة في المنصة بطريقة موحدة ومتسقة.

---

## 🎯 المكونات الأساسية المطلوبة

### 1️⃣ **Header إسلامي موحد**

```jsx
{/* Header إسلامي مع آية قرآنية */}
<div className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/30 dark:to-amber-900/30 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 islamic-pattern">
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-4">
      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg">
        <PageIcon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 sm:text-4xl arabic-text" dir="rtl">
          عنوان الصفحة بالعربية
        </h1>
        <p className="text-emerald-700 dark:text-emerald-300 mt-1 arabic-text" dir="rtl">
          وصف مختصر للصفحة ووظيفتها
        </p>
      </div>
    </div>
    
    {/* أزرار الإجراءات */}
    <Button 
      onClick={handleAction} 
      className="gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] arabic-text"
    >
      <ActionIcon className="h-4 w-4" />
      نص الإجراء
    </Button>
  </div>
  
  {/* آية قرآنية مناسبة */}
  <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-700/50">
    <p className="text-sm text-emerald-800 dark:text-emerald-200 arabic-text text-center quran-verse" dir="rtl">
      ﴿ آية قرآنية مناسبة لموضوع الصفحة ﴾
    </p>
    <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center mt-1 arabic-text">
      اسم السورة - رقم الآية
    </p>
  </div>
</div>
```

### 2️⃣ **بطاقات الإحصائيات الإسلامية**

```jsx
{/* بطاقات الإحصائيات */}
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat, index) => (
    <Card 
      key={index}
      className={`border-${stat.color}-200 bg-gradient-to-br from-white to-${stat.color}-50 shadow-lg dark:border-${stat.color}-800 dark:from-gray-900 dark:to-${stat.color}-900/20 islamic-pattern overflow-hidden`}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 bg-gradient-to-r from-${stat.color}-100 to-${stat.color}-200 dark:from-${stat.color}-900/30 dark:to-${stat.color}-800/30 rounded-xl shadow-lg`}>
            <stat.icon className={`h-6 w-6 text-${stat.color}-700 dark:text-${stat.color}-300`} />
          </div>
          <div>
            <p className={`text-sm font-medium text-${stat.color}-600 dark:text-${stat.color}-400 arabic-text`}>
              {stat.label}
            </p>
            <p className={`text-3xl font-bold text-${stat.color}-900 dark:text-${stat.color}-100 arabic-text`}>
              {stat.value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

### 3️⃣ **فلاتر البحث والتحكم**

```jsx
{/* قسم الفلاتر والبحث */}
<Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50 shadow-lg dark:border-emerald-800 dark:from-gray-900 dark:to-emerald-900/20 islamic-pattern">
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-emerald-900 dark:text-emerald-100 arabic-text">
          العنوان الفرعي
        </h2>
        <p className="text-sm text-emerald-600 dark:text-emerald-400 arabic-text">
          وصف مختصر للقسم
        </p>
      </div>
      <Button 
        onClick={handleRefresh} 
        disabled={loading} 
        variant="outline" 
        size="sm" 
        className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/20 arabic-text"
      >
        <FiRefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        تحديث
      </Button>
    </div>
  </CardHeader>
  
  <CardContent className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* مربع البحث */}
      <div className="relative flex-1">
        <FiSearch className={cn('absolute top-1/2 transform -translate-y-1/2 text-emerald-500 h-4 w-4', isRTL ? 'right-3' : 'left-3')} />
        <Input
          placeholder="البحث..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className={cn(
            'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 arabic-text',
            isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'
          )}
        />
      </div>
      
      {/* فلاتر إضافية */}
      <select
        value={filterValue}
        onChange={(e) => setFilterValue(e.target.value)}
        className="px-4 py-2 border-2 border-emerald-200 rounded-lg bg-white dark:bg-gray-800 text-emerald-900 dark:text-emerald-100 focus:border-emerald-500 focus:ring-emerald-500/20 arabic-text"
      >
        <option value="">جميع الخيارات</option>
        <option value="option1">خيار 1</option>
        <option value="option2">خيار 2</option>
      </select>
    </div>
  </CardContent>
</Card>
```

### 4️⃣ **بطاقات العناصر**

```jsx
{/* بطاقة عنصر واحد */}
<Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50 shadow-lg dark:border-emerald-800 dark:from-gray-900 dark:to-emerald-900/20 islamic-pattern overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02]">
  <CardContent className="p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl">
          <ItemIcon className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 arabic-text">
            اسم العنصر
          </h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 arabic-text">
            وصف مختصر
          </p>
        </div>
      </div>
      
      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleView(item.id)}
          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 arabic-text"
        >
          <FiEye className="h-4 w-4" />
          عرض
        </Button>
        <Button
          size="sm"
          onClick={() => handleEdit(item.id)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 arabic-text"
        >
          <FiEdit className="h-4 w-4" />
          تعديل
        </Button>
      </div>
    </div>
    
    {/* معلومات إضافية */}
    <div className="border-t border-emerald-200/50 pt-4">
      <div className="flex items-center justify-between text-sm text-emerald-600 dark:text-emerald-400 arabic-text">
        <span>تاريخ الإنشاء: {formatDate(item.createdAt)}</span>
        <StatusBadge status={item.status} />
      </div>
    </div>
  </CardContent>
</Card>
```

### 5️⃣ **شارة الحالة الإسلامية**

```jsx
const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      bg: 'bg-gradient-to-r from-green-100 to-green-200',
      text: 'text-green-800',
      icon: FiCheckCircle,
      label: 'نشط'
    },
    pending: {
      bg: 'bg-gradient-to-r from-amber-100 to-amber-200', 
      text: 'text-amber-800',
      icon: FiClock,
      label: 'قيد الانتظار'
    },
    inactive: {
      bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
      text: 'text-gray-800', 
      icon: FiXCircle,
      label: 'غير نشط'
    }
  };
  
  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} arabic-text`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
};
```

---

## 🎨 نظام الألوان المطبق

### الألوان الأساسية:
```jsx
const colorSystem = {
  emerald: {
    50: 'emerald-50',    // خلفيات فاتحة
    100: 'emerald-100',  // أيقونات فاتحة
    200: 'emerald-200',  // حدود
    600: 'emerald-600',  // نصوص أساسية  
    700: 'emerald-700',  // نصوص داكنة
    900: 'emerald-900'   // نصوص قوية
  },
  amber: {
    // نفس النمط للذهبي
  },
  green: {
    // للحالات الإيجابية
  },
  red: {
    // للحالات السلبية
  }
};
```

---

## 📖 مجموعة الآيات القرآنية المقترحة

### حسب نوع الصفحة:

```jsx
const quranVerses = {
  general: {
    verse: "﴿ وَقُل رَّبِّ زِدْنِي عِلْماً ﴾",
    source: "سورة طه - آية 114"
  },
  users: {
    verse: "﴿ وَجَعَلْنَا مِنْهُمْ أَئِمَّةً يَهْدُونَ بِأَمْرِنَا لَمَّا صَبَرُوا ﴾", 
    source: "سورة السجدة - آية 24"
  },
  teachers: {
    verse: "﴿ وَقُل رَّبِّ زِدْنِي عِلْماً ﴾",
    source: "سورة طه - آية 114" 
  },
  courses: {
    verse: "﴿ اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ﴾",
    source: "سورة العلق - آية 1"
  },
  bookings: {
    verse: "﴿ وَاصْبِرْ نَفْسَكَ مَعَ الَّذِينَ يَدْعُونَ رَبَّهُم بِالْغَدَاةِ وَالْعَشِيِّ ﴾",
    source: "سورة الكهف - آية 28"
  },
  finance: {
    verse: "﴿ وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ﴾",
    source: "سورة الطلاق - آية 2"
  },
  reports: {
    verse: "﴿ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ ﴾",
    source: "سورة يس - آية 12"
  },
  settings: {
    verse: "﴿ وَاللَّهُ يُحِبُّ الْمُحْسِنِينَ ﴾",
    source: "سورة آل عمران - آية 134"
  },
  notifications: {
    verse: "﴿ وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ ﴾",
    source: "سورة الذاريات - آية 55"
  }
};
```

---

## 🔧 الكلاسات المساعدة

### CSS Classes المطلوبة:
```css
/* كلاسات الهوية الإسلامية */
.arabic-text {
  font-family: "Alexandria", "Inter", sans-serif !important;
}

.quran-verse {
  font-family: "Alexandria", serif !important;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.8;
}

.islamic-pattern {
  background-image: 
    radial-gradient(circle at 25% 25%, hsla(160, 60%, 23%, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, hsla(45, 86%, 58%, 0.1) 0%, transparent 50%);
}
```

---

## 📋 قائمة التحقق للصفحة الجديدة

### ✅ العناصر الأساسية:
- [ ] Header إسلامي مع آية قرآنية مناسبة
- [ ] بطاقات إحصائيات بألوان متدرجة إسلامية  
- [ ] فلاتر وبحث بالألوان الإسلامية
- [ ] بطاقات/جداول العناصر محسنة
- [ ] أزرار بتدرجات إسلامية
- [ ] شارات حالة ملونة

### ✅ الألوان والخطوط:
- [ ] استخدام الألوان الإسلامية (emerald, amber, green, red)
- [ ] تطبيق خط Alexandria على النصوص العربية
- [ ] إضافة كلاس `arabic-text` للنصوص
- [ ] تطبيق `dir="rtl"` للنصوص العربية

### ✅ التأثيرات والتفاعل:
- [ ] تأثيرات hover ناعمة
- [ ] انتقالات duration-200
- [ ] تأثيرات scale للأزرار والبطاقات
- [ ] ظلال متدرجة للبطاقات

### ✅ التوافق:
- [ ] دعم الوضع الليلي
- [ ] تصميم متجاوب
- [ ] دعم RTL كامل
- [ ] تحميل وحالات الخطأ

---

## 🎯 نصائح للتطبيق السريع

### 1️⃣ **البدء السريع**:
1. انسخ Header الإسلامي وغير الأيقونة والنصوص
2. انسخ بطاقات الإحصائيات وعدل البيانات
3. انسخ قسم الفلاتر وعدل الخيارات
4. طبق الألوان على العناصر الموجودة

### 2️⃣ **التخصيص**:
- اختر آية قرآنية مناسبة لموضوع الصفحة
- استخدم ألوان مختلفة للبطاقات (emerald, amber, blue, green)
- أضف أيقونات مناسبة من react-icons/fi
- تأكد من الترجمة العربية للنصوص

### 3️⃣ **الاختبار**:
- اختبر في الوضع الليلي والنهاري
- تأكد من التجاوب على الموبايل
- اختبر حالات التحميل والخطأ
- تأكد من وضوح النصوص العربية

---

## 🎉 نتيجة التطبيق

**بعد تطبيق هذا النموذج، ستحصل على:**

✅ صفحة بهوية إسلامية أصيلة ومتناسقة
✅ تصميم حديث مع طابع ديني جميل  
✅ تجربة مستخدم ممتازة وتفاعلية
✅ توافق مع باقي صفحات المنصة
✅ دعم كامل للغة العربية وRTL

**🌟 المنصة ستصبح نموذجاً فريداً في التطبيقات الإسلامية التعليمية!**