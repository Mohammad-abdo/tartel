import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { adminAPI, fileUploadAPI } from '../services/api';
import { FiArrowLeft, FiSave, FiUser, FiMail, FiPhone, FiShield, FiImage, FiUpload } from 'react-icons/fi';

const EditUser = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const avatarFileRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    firstNameAr: '',
    lastName: '',
    lastNameAr: '',
    phone: '',
    avatar: '',
    role: 'STUDENT',
    status: 'ACTIVE',
    // حقول إضافية للطلاب
    memorizedParts: 0, // عدد أجزاء الحفظ
    gender: '', // جنس الطالب
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await adminAPI.getUserById(id);
      const user = response.data;
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        firstNameAr: user.firstNameAr || '',
        lastName: user.lastName || '',
        lastNameAr: user.lastNameAr || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        role: user.role || 'STUDENT',
        status: user.status || 'ACTIVE',
        // حقول إضافية للطلاب
        memorizedParts: user.memorizedParts || 0,
        gender: user.gender || '',
      });
    } catch (error) {
      toast.error(t('editUser.loadUserFailed'));
      navigate('/users');
    } finally {
      setFetching(false);
    }
  };

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
    if (!formData.avatar?.trim()) {
      toast.error(t('users.avatarRequired') || 'Photo is required for the user');
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
      await adminAPI.updateUser(id, formData);
      toast.success(t('editUser.userUpdatedSuccess'));
      navigate(`/users/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('editUser.updateFailed'));
      console.error('Error updating user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" style={{ fontFamily: 'Alexandria, sans-serif' }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-600 border-t-transparent"></div>
            <div className="absolute inset-0 animate-pulse rounded-full border-2 border-amber-400 opacity-30"></div>
          </div>
          <p className="mt-4 text-emerald-600 dark:text-emerald-400 font-alexandria">جاري تحميل بيانات المستخدم...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Alexandria, sans-serif' }}>
      {/* Islamic Header */}
      <div className="text-center mb-6">
        <div className="islamic-border inline-block px-8 py-4 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
          <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-1 font-alexandria">
            بسم الله الرحمن الرحيم
          </p>
          <p className="text-amber-600 dark:text-amber-400 text-xs font-alexandria">
            تعديل بيانات طالب القرآن الكريم
          </p>
        </div>
      </div>

      <div className="islamic-border p-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-amber-900/20 rounded-xl shadow-lg mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/users/${id}`)}
            className="islamic-button-secondary p-3"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
              <FiUser className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-200 sm:text-4xl font-alexandria">{t('editUser.title') || 'تعديل المستخدم'}</h1>
              <p className="text-amber-700 dark:text-amber-300 mt-1 font-alexandria">{t('editUser.subtitle') || 'تحديث معلومات المستخدم'}</p>
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mt-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                <span className="font-alexandria">وقل رب أصلحني وأصلح لي ديني</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="islamic-card p-8 bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/30 dark:from-gray-800 dark:via-emerald-900/10 dark:to-amber-900/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiMail className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {t('addUser.emailRequired') || 'البريد الإلكتروني *'}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="islamic-input font-alexandria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiUser className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {t('addUser.firstNameEn') || 'الاسم الأول (بالإنجليزية) *'}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="islamic-input font-alexandria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 font-alexandria">
              {t('addUser.firstNameAr') || 'الاسم الأول (بالعربية)'}
            </label>
            <input
              type="text"
              name="firstNameAr"
              value={formData.firstNameAr}
              onChange={handleChange}
              className="islamic-input font-alexandria"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiUser className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {t('addUser.lastNameEn') || 'اسم العائلة (بالإنجليزية) *'}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="islamic-input font-alexandria"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 font-alexandria">
              {t('addUser.lastNameAr') || 'اسم العائلة (بالعربية)'}
            </label>
            <input
              type="text"
              name="lastNameAr"
              value={formData.lastNameAr}
              onChange={handleChange}
              className="islamic-input font-alexandria"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiPhone className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {t('addUser.phoneNumber') || 'رقم الهاتف'}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="islamic-input font-alexandria"
            />
          </div>

          {/* صورة المستخدم مطلوبة */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiImage className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {t('users.avatar') || 'صورة المستخدم'} *
            </label>
            <input type="file" ref={avatarFileRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            {formData.avatar ? (
              <div className="flex items-center gap-4 p-4 islamic-border bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
                <div className="relative">
                  <img src={formData.avatar} alt="Avatar" className="h-24 w-24 rounded-xl object-cover islamic-border shadow-lg" />
                  <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <button type="button" onClick={() => avatarFileRef.current?.click()} disabled={uploadingAvatar} className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline font-medium font-alexandria">
                    {uploadingAvatar ? t('common.uploading') || 'جاري الرفع...' : t('users.changePhoto') || 'تغيير الصورة'}
                  </button>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder={t('users.avatarUrlPlaceholder') || 'أو الصق رابط الصورة هنا'}
                    className="mt-2 islamic-input font-alexandria text-sm"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploadingAvatar}
                className="w-full flex items-center justify-center gap-3 px-4 py-6 rounded-xl islamic-border bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 hover:from-emerald-100 hover:to-amber-100 dark:hover:from-emerald-900/30 dark:hover:to-amber-900/30 text-emerald-700 dark:text-emerald-300 transition-all duration-300 hover:shadow-lg border-2 border-dashed"
              >
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <FiUpload className="text-lg text-white" />
                </div>
                <span className="font-alexandria">{uploadingAvatar ? t('common.uploading') || 'جاري الرفع...' : (t('users.uploadPhoto') || 'رفع صورة')}</span>
              </button>
            )}
            <div className="mt-3 text-xs islamic-border p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-alexandria">
                <span className="text-lg">📸</span>
                <span>{t('users.avatarRequiredHint') || 'كل مستخدم يجب أن يكون له صورة شخصية.'}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2 font-alexandria">
              <div className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                <FiShield className="text-emerald-600 dark:text-emerald-400" />
              </div>
              {t('addUser.roleRequired') || 'دور المستخدم *'}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="islamic-select font-alexandria"
            >
              <option value="STUDENT">{t('users.student') || 'طالب'}</option>
              <option value="TEACHER">{t('users.teacher') || 'شيخ'}</option>
              <option value="ADMIN">{t('users.admin') || 'مدير'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-700 dark:text-amber-300 mb-2 font-alexandria">{t('addUser.statusRequired') || 'حالة المستخدم *'}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="islamic-select font-alexandria"
            >
              <option value="ACTIVE">{t('users.active') || 'نشط'}</option>
              <option value="INACTIVE">{t('users.inactive') || 'غير نشط'}</option>
              <option value="BANNED">{t('users.banned') || 'محظور'}</option>
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

        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/users/${id}`)}
            className="islamic-button-secondary px-6 py-3 font-alexandria"
          >
            {t('common.cancel') || 'إلغاء'}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="islamic-button-primary px-8 py-3 font-alexandria disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
          >
            <FiSave />
            {loading ? (t('editUser.updating') || 'جاري التحديث...') : (t('editUser.updateUser') || 'تحديث المستخدم')}
          </button>
        </div>
        
        {/* Islamic footer blessing */}
        <div className="mt-6 text-center">
          <div className="inline-block islamic-border px-6 py-3 bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-900/20 dark:to-amber-900/20 rounded-xl">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-alexandria">
              اللهم أصلح لنا ديننا الذي هو عصمة أمرنا
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

