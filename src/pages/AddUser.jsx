import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'react-toastify';
import { adminAPI, fileUploadAPI } from '../services/api';
import { FiArrowRight, FiSave, FiUser, FiMail, FiPhone, FiLock, FiShield, FiImage, FiUpload, FiCheckCircle } from 'react-icons/fi';

const AddUser = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const navigate = useNavigate();
  const avatarFileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    firstNameAr: '',
    lastName: '',
    lastNameAr: '',
    password: '',
    phone: '',
    avatar: '',
    role: 'STUDENT',
    status: 'ACTIVE',
    // حقول إضافية للطلاب
    memorizedParts: 0, // عدد أجزاء الحفظ
    gender: '', // جنس الطالب
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('users.avatarImageOnly') || 'Please upload an image file');
      return;
    }
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fileUploadAPI.uploadAvatar(fd);
      const url = response.data?.url ?? response.data;
      setFormData((prev) => ({ ...prev, avatar: url }));
      toast.success(t('users.avatarUploadSuccess') || 'Photo uploaded');
    } catch (err) {
      toast.error(err.response?.data?.message || t('users.avatarUploadFailed') || 'Upload failed');
    } finally {
      setUploadingAvatar(false);
      if (avatarFileRef.current) avatarFileRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.avatar?.trim()) {
      toast.error('صورة المستخدم مطلوبة.');
      return;
    }
    
    if (!formData.email?.trim()) {
      toast.error('البريد الإلكتروني مطلوب.');
      return;
    }
    
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      toast.error('الاسم الأول واسم العائلة مطلوبان.');
      return;
    }
    
    if (!formData.password || formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    
    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('البريد الإلكتروني غير صحيح.');
      return;
    }
    
    // التحقق من رقم الهاتف (إذا كان موجود)
    if (formData.phone && formData.phone.length < 10) {
      toast.error('رقم الهاتف يجب أن يكون 10 أرقام على الأقل.');
      return;
    }
    
    // التحقق من الحقول الخاصة بالطلاب
    if (formData.role === 'STUDENT') {
      if (!formData.gender) {
        toast.error('جنس الطالب مطلوب.');
        return;
      }
      
      if (formData.memorizedParts < 0 || formData.memorizedParts > 30) {
        toast.error('عدد أجزاء الحفظ يجب أن يكون بين 0 و 30.');
        return;
      }
    }
    
    setLoading(true);
    try {
      await adminAPI.createUser(formData);
      toast.success('تم إنشاء المستخدم بنجاح! 🎉');
      navigate('/users');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل في إنشاء المستخدم';
      toast.error(errorMessage);
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'} style={{ fontFamily: 'Alexandria, sans-serif' }}>
      {/* Islamic Header */}
      <div className="text-center mb-6">
        <div className="islamic-border inline-block px-8 py-4 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-1 font-alexandria">
            {isRTL ? 'بسم الله الرحمن الرحيم' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-xs font-alexandria">
            {isRTL ? 'إضافة طالب جديد لتعلم القرآن الكريم' : 'Adding a New Student to Learn the Quran'}
          </p>
        </div>
      </div>

      <div className="islamic-border p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/users')}
            className="islamic-button-secondary p-3"
          >
            <FiArrowRight className="text-xl rotate-180" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <FiUser className="size-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 uppercase mb-1 font-alexandria">
                المستخدمين
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-4xl font-alexandria">إضافة مستخدم جديد</h1>
              <p className="text-amber-700 dark:text-amber-300 mt-1 font-alexandria">إنشاء حساب مستخدم جديد في النظام</p>
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                <span className="font-alexandria">{isRTL ? 'وقل رب زدني علماً' : 'And say: My Lord, increase me in knowledge'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="islamic-card p-8 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/30 dark:from-gray-800 dark:via-emerald-900/10 dark:to-amber-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiMail className="text-emerald-600 dark:text-emerald-400" />
              </div>
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="islamic-input font-alexandria"
              placeholder="user@example.com"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiUser className="text-emerald-600 dark:text-emerald-400" />
              </div>
              الاسم الأول (بالإنجليزية) *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="islamic-input font-alexandria"
              placeholder="Ahmed"
            />
          </div>

          {/* First Name Arabic */}
          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 font-alexandria">
              الاسم الأول (بالعربية)
            </label>
            <input
              type="text"
              name="firstNameAr"
              value={formData.firstNameAr}
              onChange={handleChange}
              className="islamic-input font-alexandria"
              placeholder="أحمد"
              dir="rtl"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiUser className="text-emerald-600 dark:text-emerald-400" />
              </div>
              اسم العائلة (بالإنجليزية) *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="islamic-input font-alexandria"
              placeholder="Mohamed"
            />
          </div>

          {/* Last Name Arabic */}
          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 font-alexandria">
              اسم العائلة (بالعربية)
            </label>
            <input
              type="text"
              name="lastNameAr"
              value={formData.lastNameAr}
              onChange={handleChange}
              className="islamic-input font-alexandria"
              placeholder="محمد"
              dir="rtl"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiLock className="text-emerald-600 dark:text-emerald-400" />
              </div>
              كلمة المرور *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="islamic-input font-alexandria"
              placeholder="كلمة مرور قوية (6 أحرف على الأقل)"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiPhone className="text-emerald-600 dark:text-emerald-400" />
              </div>
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="islamic-input font-alexandria"
              placeholder="+201234567890"
            />
          </div>

          {/* صورة المستخدم مطلوبة */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiImage className="text-emerald-600 dark:text-emerald-400" />
              </div>
              صورة المستخدم *
            </label>
            <input type="file" ref={avatarFileRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            {formData.avatar ? (
              <div className="flex items-center gap-4 p-4 islamic-border bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
                <div className="relative">
                  <img src={formData.avatar} alt="صورة المستخدم" className="h-24 w-24 rounded-xl object-cover islamic-border shadow-lg" />
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <FiCheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <button 
                    type="button" 
                    onClick={() => avatarFileRef.current?.click()} 
                    disabled={uploadingAvatar} 
                    className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline font-medium font-alexandria"
                  >
                    {uploadingAvatar ? 'جاري الرفع...' : 'تغيير الصورة'}
                  </button>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="أو الصق رابط الصورة هنا"
                    className="mt-2 islamic-input font-alexandria text-sm"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full flex items-center justify-center gap-3 px-4 py-8 rounded-xl islamic-border bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 hover:from-emerald-100 hover:to-amber-100 dark:hover:from-emerald-900/30 dark:hover:to-amber-900/30 text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:shadow-lg border-2 border-dashed"
              >
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <FiUpload className="text-2xl text-white" />
                </div>
                <div className="text-center">
                  <div className="font-medium font-alexandria">
                    {uploadingAvatar ? 'جاري رفع الصورة...' : 'انقر لرفع صورة المستخدم'}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-alexandria">JPG, PNG, GIF (أقل من 5MB)</div>
                </div>
              </button>
            )}
            <div className="mt-3 text-xs islamic-border p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-alexandria">
                <span className="text-lg">📸</span>
                <span>صورة المستخدم مطلوبة لجميع المستخدمين الجدد</span>
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiShield className="text-emerald-600 dark:text-emerald-400" />
              </div>
              دور المستخدم *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="islamic-select font-alexandria"
            >
              <option value="STUDENT">طالب</option>
              <option value="TEACHER">شيخ</option>
              <option value="ADMIN">مدير</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 font-alexandria">حالة المستخدم *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="islamic-select font-alexandria"
            >
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
              <option value="BANNED">محظور</option>
            </select>
          </div>

          {/* حقول خاصة بالطلاب */}
          {formData.role === 'STUDENT' && (
            <>
              {/* جنس الطالب */}
              <div>
                <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                    <FiUser className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  جنس الطالب *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required={formData.role === 'STUDENT'}
                  className="islamic-select font-alexandria"
                >
                  <option value="">اختر الجنس</option>
                  <option value="MALE">ذكر</option>
                  <option value="FEMALE">أنثى</option>
                </select>
              </div>

              {/* عدد أجزاء الحفظ */}
              <div>
                <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-2 font-alexandria">
                  <div className="p-1 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                    <span className="text-amber-600 dark:text-amber-400 text-sm">📖</span>
                  </div>
                  عدد أجزاء الحفظ من القرآن الكريم
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="memorizedParts"
                    value={formData.memorizedParts}
                    onChange={handleChange}
                    min="0"
                    max="30"
                    className="islamic-input font-alexandria"
                    placeholder="عدد الأجزاء المحفوظة (0-30)"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 text-sm">
                    / 30
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-alexandria">
                  💡 أدخل عدد أجزاء القرآن الكريم التي يحفظها الطالب (من 0 إلى 30 جزء)
                </p>
              </div>
            </>
          )}
        </div>

        {/* ملخص البيانات */}
        <div className="mt-6 islamic-card p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
              <FiCheckCircle className="size-5 text-white" />
            </div>
            <h3 className="font-bold text-emerald-800 dark:text-emerald-200 text-lg font-alexandria">ملخص البيانات المدخلة</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">البريد الإلكتروني:</span> 
              <span className="text-gray-700 dark:text-gray-300 font-alexandria">{formData.email || 'غير محدد'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">الاسم:</span> 
              <span className="text-gray-700 dark:text-gray-300 font-alexandria">{`${formData.firstName} ${formData.lastName}`.trim() || 'غير محدد'}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">الدور:</span> 
              <span className="text-amber-600 dark:text-amber-400 font-alexandria font-semibold">{
                formData.role === 'ADMIN' ? 'مدير' : 
                formData.role === 'TEACHER' ? 'شيخ' : 'طالب'
              }</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">الحالة:</span> 
              <span className={`font-alexandria font-semibold ${
                formData.status === 'ACTIVE' ? 'text-green-600 dark:text-green-400' : 
                formData.status === 'BANNED' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
              }`}>{
                formData.status === 'ACTIVE' ? 'نشط' : 
                formData.status === 'BANNED' ? 'محظور' : 'غير نشط'
              }</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">الصورة:</span> 
              <span className={`font-alexandria font-semibold ${formData.avatar ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formData.avatar ? '✅ تم الرفع' : '❌ غير مرفوعة'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
              <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">رقم الهاتف:</span> 
              <span className="text-gray-700 dark:text-gray-300 font-alexandria">{formData.phone || 'غير محدد'}</span>
            </div>
            
            {/* حقول خاصة بالطلاب */}
            {formData.role === 'STUDENT' && (
              <>
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">جنس الطالب:</span> 
                  <span className="text-amber-600 dark:text-amber-400 font-alexandria font-semibold">
                    {formData.gender === 'MALE' ? '👨 ذكر' : formData.gender === 'FEMALE' ? '👩 أنثى' : 'غير محدد'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <span className="font-medium text-emerald-700 dark:text-emerald-300 font-alexandria">أجزاء الحفظ:</span> 
                  <span className="text-amber-600 dark:text-amber-400 font-alexandria font-semibold">
                    📖 {formData.memorizedParts || 0} / 30 جزء
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Islamic blessing */}
          <div className="text-center mt-4 pt-4 islamic-border-top">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-alexandria italic">
              {isRTL ? 'اللهم بارك لنا فيما رزقتنا وقنا عذاب النار' : 'O Allah, bless us in what You have provided for us and save us from the punishment of the Fire'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-start gap-4">
          <button
            type="submit"
            disabled={loading || uploadingAvatar}
            className="islamic-button-primary px-8 py-4 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 font-alexandria disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري إنشاء المستخدم...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                إنشاء المستخدم
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="islamic-button-secondary px-6 py-4 font-alexandria"
          >
            إلغاء
          </button>
        </div>
        
        {/* Islamic footer blessing */}
        <div className="mt-6 text-center">
          <div className="inline-block islamic-border px-6 py-3 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-alexandria">
              {isRTL ? 'وفقنا الله وإياكم لما يحب ويرضى' : 'May Allah grant us success in what He loves and is pleased with'}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUser;

