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
    <div className={isRTL ? 'text-right' : 'text-left'} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FiArrowRight className="text-xl text-gray-600 rotate-180" />
        </button>
        <div>
          <p className="text-xs font-semibold tracking-wide text-primary-600 uppercase mb-1">
            المستخدمين
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">إضافة مستخدم جديد</h1>
          <p className="text-gray-600 mt-1">إنشاء حساب مستخدم جديد في النظام</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiMail />
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="user@example.com"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiUser />
              الاسم الأول (بالإنجليزية) *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Ahmed"
            />
          </div>

          {/* First Name Arabic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الأول (بالعربية)
            </label>
            <input
              type="text"
              name="firstNameAr"
              value={formData.firstNameAr}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="أحمد"
              dir="rtl"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiUser />
              اسم العائلة (بالإنجليزية) *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Mohamed"
            />
          </div>

          {/* Last Name Arabic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اسم العائلة (بالعربية)
            </label>
            <input
              type="text"
              name="lastNameAr"
              value={formData.lastNameAr}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="محمد"
              dir="rtl"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiLock />
              كلمة المرور *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="كلمة مرور قوية (6 أحرف على الأقل)"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiPhone />
              رقم الهاتف
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="+201234567890"
            />
          </div>

          {/* صورة المستخدم مطلوبة */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiImage />
              صورة المستخدم *
            </label>
            <input type="file" ref={avatarFileRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            {formData.avatar ? (
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img src={formData.avatar} alt="صورة المستخدم" className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 shadow-sm" />
                  <div className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
                    <FiCheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <button 
                    type="button" 
                    onClick={() => avatarFileRef.current?.click()} 
                    disabled={uploadingAvatar} 
                    className="text-sm text-primary-600 hover:underline font-medium"
                  >
                    {uploadingAvatar ? 'جاري الرفع...' : 'تغيير الصورة'}
                  </button>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="أو الصق رابط الصورة هنا"
                    className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full flex items-center justify-center gap-3 px-4 py-6 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30 text-gray-600 transition-all duration-200 hover:text-primary-600"
              >
                <FiUpload className="text-2xl" />
                <div className="text-center">
                  <div className="font-medium">
                    {uploadingAvatar ? 'جاري رفع الصورة...' : 'انقر لرفع صورة المستخدم'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">JPG, PNG, GIF (أقل من 5MB)</div>
                </div>
              </button>
            )}
            <p className="mt-2 text-xs text-gray-500 bg-blue-50 p-2 rounded-lg border border-blue-200">
              📸 صورة المستخدم مطلوبة لجميع المستخدمين الجدد
            </p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiShield />
              دور المستخدم *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
            >
              <option value="STUDENT">طالب</option>
              <option value="TEACHER">شيخ</option>
              <option value="ADMIN">مدير</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">حالة المستخدم *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200 bg-white"
            >
              <option value="ACTIVE">نشط</option>
              <option value="INACTIVE">غير نشط</option>
              <option value="BANNED">محظور</option>
            </select>
          </div>
        </div>

        {/* ملخص البيانات */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">ملخص البيانات المدخلة:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">البريد الإلكتروني:</span> {formData.email || 'غير محدد'}
            </div>
            <div>
              <span className="font-medium">الاسم:</span> {`${formData.firstName} ${formData.lastName}`.trim() || 'غير محدد'}
            </div>
            <div>
              <span className="font-medium">الدور:</span> {
                formData.role === 'ADMIN' ? 'مدير' : 
                formData.role === 'TEACHER' ? 'شيخ' : 'طالب'
              }
            </div>
            <div>
              <span className="font-medium">الحالة:</span> {
                formData.status === 'ACTIVE' ? 'نشط' : 
                formData.status === 'BANNED' ? 'محظور' : 'غير نشط'
              }
            </div>
            <div>
              <span className="font-medium">الصورة:</span> {formData.avatar ? '✅ تم الرفع' : '❌ غير مرفوعة'}
            </div>
            <div>
              <span className="font-medium">رقم الهاتف:</span> {formData.phone || 'غير محدد'}
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-start gap-4">
          <button
            type="submit"
            disabled={loading || uploadingAvatar}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;

