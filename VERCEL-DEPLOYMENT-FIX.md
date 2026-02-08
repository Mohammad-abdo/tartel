# 🚀 إصلاح مشاكل النشر على Vercel - منصة ترتيل

## 🔧 المشاكل المحتملة والحلول

### 1️⃣ **إعدادات vercel.json**

#### ❌ المشاكل السابقة:
- استخدام `builds` مع `@vercel/static-build` (غير مطلوب لـ Vite)
- وجود `functions` configuration للـ API (هذا frontend فقط)  
- `routes` بدلاً من `rewrites` الحديثة
- إعدادات معقدة غير ضرورية

#### ✅ الإعدادات الجديدة المبسطة:
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

### 2️⃣ **إعدادات package.json**

#### ✅ سكريبت جديد للـ Vercel:
```json
{
  "scripts": {
    "vercel-build": "vite build",
    "build:prod": "vite build --mode production"
  }
}
```

### 3️⃣ **متغيرات البيئة**

#### في لوحة تحكم Vercel:
```bash
# Environment Variables في Vercel Dashboard:
VITE_API_URL=https://your-backend-api.com/api
VITE_APP_NAME=Tarteel Platform
VITE_DEFAULT_LANGUAGE=ar
VITE_SUPPORTED_LANGUAGES=ar,en
VITE_ITEMS_PER_PAGE=20
VITE_MAX_FILE_SIZE_MB=10
VITE_DEV_MODE=false
VITE_DEBUG=false
VITE_SHOW_API_ERRORS=false
```

---

## 🛠️ خطوات إصلاح النشر

### الخطوة 1: تنظيف وإعادة البناء
```bash
npm run clean
npm install
npm run build:prod
```

### الخطوة 2: اختبار محلي  
```bash
npm run preview
# يجب أن يعمل على http://localhost:5174
```

### الخطوة 3: النشر على Vercel
```bash
# إذا لم تقم بتثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

### الخطوة 4: إعداد متغيرات البيئة في Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. افتح مشروعك
3. اذهب إلى **Settings** → **Environment Variables**
4. أضف المتغيرات المطلوبة

---

## 🐛 مشاكل شائعة وحلولها

### مشكلة 1: Build Failure
```bash
Error: Process completed with exit code 1
```
**الحل**: 
- تأكد من عدم وجود أخطاء في الكود
- فحص console.log statements
- إزالة imports غير مستخدمة

### مشكلة 2: Environment Variables
```bash
VITE_API_URL is undefined
```
**الحل**:
- تأكد من إضافة متغيرات البيئة في Vercel Dashboard
- استخدم البادئة `VITE_` لجميع المتغيرات
- أعد النشر بعد إضافة المتغيرات

### مشكلة 3: Routing Issues
```bash
404 on page refresh
```
**الحل**:
- تأكد من وجود `rewrites` في vercel.json
- استخدم `/((?!assets/.*).*)`  للـ SPA routing

### مشكلة 4: Assets Not Loading
```bash
Failed to load assets
```
**الحل**:
- تأكد من أن `outputDirectory` هو `dist`
- فحص مسارات الـ assets في التطبيق
- تأكد من Cache headers للـ assets

---

## 🔍 فحص سريع للمشاكل

### تشغيل هذه الأوامر للتأكد:
```bash
# 1. تنظيف وبناء جديد
npm run clean && npm install && npm run build:prod

# 2. فحص حجم الملفات
ls -la dist/

# 3. اختبار محلي  
npm run preview

# 4. فحص متغيرات البيئة
echo $VITE_API_URL
```

### إذا ما زالت هناك مشاكل:
```bash
# فحص logs أكثر تفصيلاً
npm run build:prod -- --debug

# أو استخدام البناء العادي
npm run build

# فحص ملفات dist المولدة
tree dist/
```

---

## 📝 ملفات الـ Deployment الجديدة

### 1. `vercel.json` - مُبسط ومحسن
### 2. `.env.local` - للتطوير المحلي  
### 3. `.env.example` - محدث بجميع المتغيرات
### 4. `package.json` - سكريبت `vercel-build` جديد

---

## ✅ النتيجة المتوقعة

بعد تطبيق هذه الإصلاحات:

✅ **بناء ناجح** بدون أخطاء
✅ **نشر سريع** على Vercel  
✅ **routing صحيح** للـ SPA
✅ **assets محملة** بشكل صحيح
✅ **متغيرات البيئة** تعمل
✅ **أمان عالي** مع security headers

---

**🎯 جرب الآن النشر باستخدام: `vercel --prod`**