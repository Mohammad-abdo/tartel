import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastConfirm } from '../utils/toastConfirm';
import { adminAPI, fileUploadAPI } from '../services/api';
import { FiArrowRight, FiSave, FiUser, FiMail, FiPhone, FiLock, FiDollarSign, FiBook, FiUpload, FiImage, FiVideo, FiCalendar, FiClock, FiPlus, FiTrash2 } from 'react-icons/fi';

const AddTeacher = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    teacherType: 'FULL_TEACHER',
    email: '',
    firstName: '',
    firstNameAr: '',
    lastName: '',
    lastNameAr: '',
    password: '',
    phone: '',
    bio: '',
    bioAr: '',
    image: '',
    experience: '',
    hourlyRate: '',
    specialization: '',
    specialties: '',
    readingType: '',
    readingTypeAr: '',
    introVideoUrl: '',
  });

  const daysOfWeek = [
    { value: 0, label: 'الأحد' },
    { value: 1, label: 'الاثنين' },
    { value: 2, label: 'الثلاثاء' },
    { value: 3, label: 'الأربعاء' },
    { value: 4, label: 'الخميس' },
    { value: 5, label: 'الجمعة' },
    { value: 6, label: 'السبت' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // إذا تم تغيير نوع الشيخ، نظف المواعيد إذا أصبح شيخ دورات
    if (name === 'teacherType' && value === 'COURSE_SHEIKH') {
      setSchedules([]);
    }
  };

  const addSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(), // temporary ID
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: '17:00'
    };
    setSchedules([...schedules, newSchedule]);
  };

  const removeSchedule = (id) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
  };

  const updateSchedule = (id, field, value) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, [field]: value } : schedule
    ));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setImageUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await fileUploadAPI.uploadImage(formDataUpload);
      const imageUrl = response.data.url || response.data.fileUrl;
      
      setFormData(prev => ({ ...prev, image: imageUrl }));
      setImagePreview(URL.createObjectURL(file));
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      toast.error('فشل في رفع الصورة: ' + (error.response?.data?.message || error.message));
      console.error('Image upload error:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('يرجى اختيار ملف فيديو صالح');
      return;
    }

    if (file.size > 5 * 1024 * 1024 * 1024) { // 5GB
      toast.error('حجم الفيديو يجب أن يكون أقل من 5 جيجابايت');
      return;
    }

    setVideoUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      
      const response = await fileUploadAPI.uploadVideo(formDataUpload);
      const videoUrl = response.data.url || response.data.fileUrl;
      
      setFormData(prev => ({ ...prev, introVideoUrl: videoUrl }));
      toast.success('تم رفع الفيديو بنجاح');
    } catch (error) {
      toast.error('فشل في رفع الفيديو: ' + (error.response?.data?.message || error.message));
      console.error('Video upload error:', error);
    } finally {
      setVideoUploading(false);
    }
  };

  const doSubmit = async () => {
    const isCourseSheikh = formData.teacherType === 'COURSE_SHEIKH';
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        teacherType: formData.teacherType === 'COURSE_SHEIKH' ? 'COURSE_SHEIKH' : 'FULL_TEACHER',
        experience: formData.experience ? parseInt(formData.experience) : undefined,
        hourlyRate: isCourseSheikh ? 0 : (formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined),
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : undefined,
        schedules: isCourseSheikh ? [] : schedules.map(schedule => ({
          dayOfWeek: parseInt(schedule.dayOfWeek),
          startTime: schedule.startTime,
          endTime: schedule.endTime
        }))
      };
      await adminAPI.createTeacher(submitData);
      toast.success('تم إنشاء الشيخ بنجاح!');
      navigate('/teachers');
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في إنشاء الشيخ');
      console.error('Error creating teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image?.trim()) {
      toast.error('صورة الشيخ مطلوبة.');
      return;
    }
    if (!formData.introVideoUrl?.trim()) {
      toast.error('فيديو التعريف مطلوب للشيخ.');
      return;
    }
    
    if (formData.teacherType === 'FULL_TEACHER') {
      if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
        toast.error('يجب تحديد سعر الساعة للشيخ الكامل.');
        return;
      }
      
      if (schedules.length === 0) {
        toastConfirm({
          title: 'لم تقم بإضافة أي مواعيد عمل للشيخ',
          description: 'هل تريد المتابعة بدون مواعيد؟ (يمكن إضافتها لاحقاً)',
          confirmLabel: 'متابعة',
          cancelLabel: 'إلغاء',
          type: 'warn',
          confirmStyle: { background: '#f59e0b' },
          onConfirm: doSubmit,
        });
        return;
      }
      
      for (let i = 0; i < schedules.length; i++) {
        const schedule = schedules[i];
        if (schedule.startTime >= schedule.endTime) {
          toast.error(`الموعد رقم ${i + 1}: وقت البداية يجب أن يكون قبل وقت النهاية.`);
          return;
        }
        
        const sameDaySchedules = schedules.filter(s => s.dayOfWeek === schedule.dayOfWeek && s.id !== schedule.id);
        for (const otherSchedule of sameDaySchedules) {
          if (
            (schedule.startTime >= otherSchedule.startTime && schedule.startTime < otherSchedule.endTime) ||
            (schedule.endTime > otherSchedule.startTime && schedule.endTime <= otherSchedule.endTime) ||
            (schedule.startTime <= otherSchedule.startTime && schedule.endTime >= otherSchedule.endTime)
          ) {
            const dayName = daysOfWeek.find(d => d.value === parseInt(schedule.dayOfWeek))?.label;
            toast.error(`يوجد تداخل في مواعيد يوم ${dayName}. يرجى مراجعة الأوقات.`);
            return;
          }
        }
      }
    }
    await doSubmit();
  };

  return (
    <div dir="rtl">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/teachers')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <FiArrowRight className="text-xl" />
        </button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">إضافة شيخ جديد</h1>
          <p className="text-gray-600 mt-1">إنشاء حساب شيخ جديد</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="space-y-6">
          {/* User Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">معلومات المستخدم</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الأول (بالعربية)
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
                  اسم العائلة (بالإنجليزية) *
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
                  اسم العائلة (بالعربية)
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Teacher Profile */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">الملف الشخصي للشيخ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الشيخ</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.teacherType === 'FULL_TEACHER' 
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="teacherType"
                      value="FULL_TEACHER"
                      checked={formData.teacherType === 'FULL_TEACHER'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900">شيخ كامل</span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">
                          ✅ حجوزات ومواعيد<br/>
                          ✅ دورات ومحفظة<br/>
                          ✅ سعر بالساعة
                        </span>
                      </div>
                    </div>
                    {formData.teacherType === 'FULL_TEACHER' && (
                      <div className="text-blue-600">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                  
                  <label className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    formData.teacherType === 'COURSE_SHEIKH' 
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}>
                    <input
                      type="radio"
                      name="teacherType"
                      value="COURSE_SHEIKH"
                      checked={formData.teacherType === 'COURSE_SHEIKH'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex flex-1">
                      <div className="flex flex-col">
                        <span className="block text-sm font-medium text-gray-900">شيخ دورات</span>
                        <span className="mt-1 flex items-center text-sm text-gray-500">
                          ❌ بدون حجوزات<br/>
                          ✅ دورات ومحفظة فقط<br/>
                          ❌ بدون مواعيد
                        </span>
                      </div>
                    </div>
                    {formData.teacherType === 'COURSE_SHEIKH' && (
                      <div className="text-amber-600">
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </label>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiBook />
                  التخصص
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="مثال: حفظ القرآن الكريم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المهارات (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="التجويد، التحفيظ"
                />
              </div>
              {formData.teacherType !== 'COURSE_SHEIKH' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <FiDollarSign />
                  السعر بالساعة *
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سنوات الخبرة
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">السيرة الذاتية (بالإنجليزية)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">السيرة الذاتية (بالعربية)</label>
                <textarea
                  name="bioAr"
                  value={formData.bioAr}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">صورة الشيخ *</label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      {imageUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4" />
                          رفع صورة
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={imageUploading}
                      />
                    </label>
                    <span className="text-xs text-gray-500">أو</span>
                    <FiImage className="text-gray-400" />
                  </div>
                  
                  {/* URL Input */}
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="أو أدخل رابط الصورة"
                  />
                  
                  {/* Image Preview */}
                  {(imagePreview || formData.image) && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || formData.image}
                        alt="معاينة صورة الشيخ"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        onError={() => {
                          setImagePreview(null);
                          if (imagePreview) {
                            setFormData(prev => ({ ...prev, image: '' }));
                          }
                        }}
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">الحد الأقصى: 5 ميجابايت - الأنواع المدعومة: JPG, PNG, GIF</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">فيديو التعريف *</label>
                <div className="space-y-3">
                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                      {videoUploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <FiUpload className="w-4 h-4" />
                          رفع فيديو
                        </>
                      )}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                        disabled={videoUploading}
                      />
                    </label>
                    <span className="text-xs text-gray-500">أو</span>
                    <FiVideo className="text-gray-400" />
                  </div>
                  
                  {/* URL Input */}
                  <input
                    type="url"
                    name="introVideoUrl"
                    value={formData.introVideoUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="أو أدخل رابط الفيديو (يوتيوب أو مباشر)"
                  />
                  
                  {/* Video Preview */}
                  {formData.introVideoUrl && (
                    <div className="mt-2">
                      <video
                        src={formData.introVideoUrl}
                        className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                        controls
                        muted
                        onError={() => {
                          console.warn('خطأ في تحميل الفيديو');
                        }}
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">الحد الأقصى: 50 ميجابايت - الأنواع المدعومة: MP4, MOV, AVI</p>
                </div>
              </div>
            </div>
          </div>

          {/* مواعيد العمل - فقط للمشايخ الكاملين */}
          {formData.teacherType === 'FULL_TEACHER' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">مواعيد العمل</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <FiCalendar className="text-blue-600" />
                  <h3 className="font-medium text-blue-900">إدارة جدول المواعيد</h3>
                </div>
                <p className="text-sm text-blue-700">
                  حدد مواعيد العمل الأسبوعية للشيخ. هذه المواعيد ستكون متاحة للطلاب للحجز.
                </p>
              </div>

              {schedules.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <FiClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواعيد محددة</h3>
                  <p className="text-gray-500 mb-4">أضف مواعيد العمل الأسبوعية للشيخ</p>
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <FiPlus />
                    إضافة موعد عمل
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule, index) => (
                    <div key={schedule.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            اليوم
                          </label>
                          <select
                            value={schedule.dayOfWeek}
                            onChange={(e) => updateSchedule(schedule.id, 'dayOfWeek', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            من الساعة
                          </label>
                          <input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateSchedule(schedule.id, 'startTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            إلى الساعة
                          </label>
                          <input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateSchedule(schedule.id, 'endTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSchedule(schedule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="حذف الموعد"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSchedule}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FiPlus />
                    إضافة موعد آخر
                  </button>
                </div>
              )}

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>ملاحظة:</strong> يمكن للشيخ تعديل مواعيد العمل لاحقاً من خلال لوحة التحكم الخاصة به.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-start gap-4">
          <button
            type="submit"
            disabled={loading || imageUploading || videoUploading}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                {formData.teacherType === 'COURSE_SHEIKH' ? 'إنشاء شيخ الدورات' : `إنشاء الشيخ${schedules.length > 0 ? ` مع ${schedules.length} موعد` : ''}`}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/teachers')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
        </div>
        
        {/* ملخص البيانات */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">ملخص البيانات المدخلة:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">نوع الشيخ:</span> {formData.teacherType === 'COURSE_SHEIKH' ? 'شيخ دورات فقط' : 'شيخ كامل (حجوزات ومواعيد)'}
            </div>
            <div>
              <span className="font-medium">السعر بالساعة:</span> {formData.teacherType === 'COURSE_SHEIKH' ? 'غير مطبق' : (formData.hourlyRate || '0') + ' جنيه'}
            </div>
            <div>
              <span className="font-medium">عدد المواعيد:</span> {formData.teacherType === 'COURSE_SHEIKH' ? 'غير مطبق' : schedules.length + ' موعد أسبوعي'}
            </div>
            <div>
              <span className="font-medium">الصورة:</span> {formData.image ? '✅ تم الرفع' : '❌ غير مرفوعة'}
            </div>
            <div>
              <span className="font-medium">الفيديو:</span> {formData.introVideoUrl ? '✅ تم الرفع' : '❌ غير مرفوع'}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;

