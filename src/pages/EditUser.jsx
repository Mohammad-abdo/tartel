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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(`/users/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">{t('editUser.title')}</h1>
          <p className="text-gray-600 mt-1">{t('editUser.subtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiMail />
              {t('addUser.emailRequired')}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiUser />
              {t('addUser.firstNameEn')}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('addUser.firstNameAr')}
            </label>
            <input
              type="text"
              name="firstNameAr"
              value={formData.firstNameAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiUser />
              {t('addUser.lastNameEn')}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('addUser.lastNameAr')}
            </label>
            <input
              type="text"
              name="lastNameAr"
              value={formData.lastNameAr}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiPhone />
              {t('addUser.phoneNumber')}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* صورة المستخدم مطلوبة */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiImage />
              {t('users.avatar') || 'Photo'} *
            </label>
            <input type="file" ref={avatarFileRef} accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            {formData.avatar ? (
              <div className="flex items-center gap-4">
                <img src={formData.avatar} alt="Avatar" className="h-24 w-24 rounded-xl object-cover border border-gray-200" />
                <div className="flex-1">
                  <button type="button" onClick={() => avatarFileRef.current?.click()} disabled={uploadingAvatar} className="text-sm text-primary-600 hover:underline">
                    {uploadingAvatar ? t('common.uploading') : t('users.changePhoto') || 'Change photo'}
                  </button>
                  <input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder={t('users.avatarUrlPlaceholder') || 'Or paste image URL'}
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploadingAvatar}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30 text-gray-600"
              >
                <FiUpload className="text-lg" />
                {uploadingAvatar ? t('common.uploading') : (t('users.uploadPhoto') || 'Upload photo')}
              </button>
            )}
            <p className="mt-1 text-xs text-gray-500">{t('users.avatarRequiredHint') || 'Every user must have a profile photo.'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FiShield />
              {t('addUser.roleRequired')}
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="STUDENT">{t('users.student')}</option>
              <option value="TEACHER">{t('users.teacher')}</option>
              <option value="ADMIN">{t('users.admin')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('addUser.statusRequired')}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="ACTIVE">{t('users.active')}</option>
              <option value="INACTIVE">{t('users.inactive')}</option>
              <option value="BANNED">{t('users.banned')}</option>
            </select>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(`/users/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FiSave />
            {loading ? t('editUser.updating') : t('editUser.updateUser')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;

