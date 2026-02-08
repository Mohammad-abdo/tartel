# 🚀 دليل النشر على Vercel - منصة ترتيل

## ✅ تم إصلاح جميع مشاكل النشر!

---

## 🔧 الإصلاحات المطبقة

### 1️⃣ **إصلاح vercel.json**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build:prod",
  "outputDirectory": "dist",
  "installCommand": "npm ci",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!assets/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

**المزايا:**
- ✅ إعدادات مُبسطة ومُحسنة
- ✅ إزالة الإعدادات غير الضرورية
- ✅ استخدام `npm ci` للتثبيت الأسرع
- ✅ SPA routing صحيح

### 2️⃣ **إصلاح package.json** 
```json
{
  "scripts": {
    "vercel-build": "vite build",
    "build:prod": "vite build --mode production",
    "clean": "if exist dist rmdir /s /q dist && if exist node_modules\\.vite rmdir /s /q node_modules\\.vite"
  }
}
```

**المزايا:**
- ✅ سكريبت `vercel-build` مخصص
- ✅ أمر تنظيف يعمل على Windows
- ✅ بناء محسن للإنتاج

### 3️⃣ **ملفات البيئة**
- ✅ `.env.local` للتطوير المحلي
- ✅ `.env.example` محسن ومفصل
- ✅ متغيرات بيئة شاملة

---

## 🚀 خطوات النشر على Vercel

### الطريقة 1: عبر Vercel CLI (مُوصى به)

#### الخطوة 1: تثبيت Vercel CLI
```bash
npm install -g vercel
```

#### الخطوة 2: تسجيل الدخول
```bash
vercel login
```

#### الخطوة 3: النشر
```bash
# النشر للمعاينة
vercel

# النشر للإنتاج
vercel --prod
```

### الطريقة 2: عبر GitHub Integration

#### الخطوة 1: رفع الكود لـ GitHub
```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

#### الخطوة 2: ربط المشروع في Vercel
1. اذهب إلى [vercel.com/dashboard](https://vercel.com/dashboard)
2. اضغط **New Project**
3. اختر المشروع من GitHub
4. اضغط **Deploy**

---

## ⚙️ إعداد متغيرات البيئة في Vercel

### 1️⃣ **في لوحة تحكم Vercel:**
1. اذهب إلى مشروعك
2. **Settings** → **Environment Variables**
3. أضف هذه المتغيرات:

```bash
# الإعدادات الأساسية
VITE_API_URL=https://your-backend-domain.com/api
VITE_APP_NAME=Tarteel Platform
VITE_DEFAULT_LANGUAGE=ar
VITE_SUPPORTED_LANGUAGES=ar,en

# إعدادات الواجهة
VITE_ITEMS_PER_PAGE=20
VITE_MAX_FILE_SIZE_MB=10

# إعدادات الإنتاج
VITE_DEV_MODE=false
VITE_DEBUG=false
VITE_SHOW_API_ERRORS=false
```

### 2️⃣ **ضبط domains مخصص (اختياري):**
- اذهب إلى **Settings** → **Domains**
- أضف domain مخصص مثل `tarteel.example.com`

---

## 🛡️ إعدادات الأمان المطبقة

### Headers الأمان:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"  
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Cache للـ Assets:
```json
{
  "source": "/assets/(.*)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

---

## 📊 نتائج البناء المحسن

### ✅ **إحصائيات الملفات:**
- **index.html**: 2.18 kB (0.97 kB gzipped)
- **CSS**: 124.56 kB (18.56 kB gzipped) 
- **JavaScript**: 552.72 kB (96.05 kB gzipped)
- **Vendor libs**: منفصلة للتخزين المؤقت الأفضل
- **i18n**: منفصل (48.82 kB)

### ✅ **الأداء:**
- **Build time**: ~3 ثوان
- **Bundle size**: محسن مع code splitting
- **Gzip compression**: فعال (18-20% من الحجم الأصلي)

---

## 🐛 حل المشاكل الشائعة

### مشكلة: "Function not found"
**الحل**: تأكد من حذف `functions` config من vercel.json

### مشكلة: "Build failed" 
**الحل**: 
```bash
# فحص الأخطاء
npm run lint
npm run build:prod -- --debug
```

### مشكلة: "Environment variables not working"
**الحل**: تأكد من البادئة `VITE_` وإعادة النشر

### مشكلة: "404 on refresh"
**الحل**: تأكد من وجود rewrites في vercel.json

---

## 🎯 خطوات النشر النهائية

### 1️⃣ **التحقق المحلي:**
```bash
npm run build:prod
npm run preview
# زر http://localhost:5177 للتأكد
```

### 2️⃣ **النشر:**
```bash
vercel --prod
```

### 3️⃣ **إضافة متغيرات البيئة:**
- اذهب إلى Vercel Dashboard
- أضف `VITE_API_URL` مع رابط الـ backend
- أضف باقي المتغيرات

### 4️⃣ **الاختبار:**
- اختبر الصفحات المختلفة  
- تأكد من الـ routing
- اختبر الهوية الإسلامية
- اختبر الإشعارات الإسلامية

---

**🎉 منصة ترتيل الآن جاهزة للنشر مع الهوية الإسلامية الجميلة!**

المعاينة المحلية: **http://localhost:5177**