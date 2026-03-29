import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { toast } from 'react-toastify';
import { adminAPI, fileUploadAPI } from '../services/api';
import { FiArrowLeft, FiSave, FiDollarSign, FiImage, FiVideo, FiUpload, FiUser, FiCalendar, FiClock, FiPlus, FiTrash2, FiChevronDown } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { Switch } from '../components/ui/switch';
import { cn } from '../lib/utils';

const EditTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const { currency, formatCurrency } = useCurrency();
  const imageFileRef = useRef(null);
  const videoFileRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [formData, setFormData] = useState({
    teacherType: 'FULL_TEACHER',
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
    isApproved: false,
  });
  const [schedules, setSchedules] = useState([]);

  const daysOfWeek = [
    { value: 0, label: 'الأحد' },
    { value: 1, label: 'الاثنين' },
    { value: 2, label: 'الثلاثاء' },
    { value: 3, label: 'الأربعاء' },
    { value: 4, label: 'الخميس' },
    { value: 5, label: 'الجمعة' },
    { value: 6, label: 'السبت' },
  ];

  useEffect(() => {
    fetchTeacher();
  }, [id]);

  const fetchTeacher = async () => {
    try {
      const response = await adminAPI.getTeacherById(id);
      const teacher = response.data;
      setFormData({
        teacherType: teacher.teacherType === 'COURSE_SHEIKH' ? 'COURSE_SHEIKH' : 'FULL_TEACHER',
        bio: teacher.bio || '',
        bioAr: teacher.bioAr || '',
        image: teacher.image || '',
        experience: teacher.experience || '',
        hourlyRate: teacher.hourlyRate ?? '',
        specialization: teacher.specialization || '',
        specialties: Array.isArray(teacher.specialties) ? teacher.specialties.join(', ') : (teacher.specialties || ''),
        readingType: teacher.readingType || '',
        readingTypeAr: teacher.readingTypeAr || '',
        introVideoUrl: teacher.introVideoUrl || '',
        isApproved: teacher.isApproved ?? false,
      });
      const list = (teacher.schedules || []).map((s) => ({
        id: s.id || `s-${s.dayOfWeek}-${s.startTime}-${s.endTime}`,
        dayOfWeek: s.dayOfWeek,
        startTime: String(s.startTime || '09:00').slice(0, 5),
        endTime: String(s.endTime || '17:00').slice(0, 5),
      }));
      setSchedules(list);
    } catch (error) {
      toast.error(t('teachers.loadFailed'));
      navigate('/teachers');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'teacherType' && value === 'COURSE_SHEIKH') setSchedules([]);
  };

  const addSchedule = () => {
    setSchedules((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        dayOfWeek: 0,
        startTime: '09:00',
        endTime: '17:00',
      },
    ]);
  };

  const removeSchedule = (scheduleId) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  const updateSchedule = (scheduleId, field, value) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, [field]: value } : s))
    );
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('teachers.invalidImage'));
      return;
    }
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fileUploadAPI.uploadImage(fd);
      console.log(response)
      const url = (response.data && (response.data.url ?? (typeof response.data === 'string' ? response.data : response.data.url))) || '';
      setFormData((prev) => ({ ...prev, image: url }));
      toast.success(t('teachers.imageUploadSuccess'));
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || t('teachers.imageUploadFailed');
      toast.error(typeof msg === 'string' ? msg : t('teachers.imageUploadFailed'));
    } finally {
      setUploadingImage(false);
      if (imageFileRef.current) imageFileRef.current.value = '';
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error(t('teachers.invalidVideo'));
      return;
    }
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fileUploadAPI.uploadVideo(fd);
      const url = (response.data && (response.data.url ?? (typeof response.data === 'string' ? response.data : response.data.url))) || '';
      setFormData((prev) => ({ ...prev, introVideoUrl: url }));
      toast.success(t('teachers.videoUploadSuccess'));
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || t('teachers.videoUploadFailed');
      toast.error(typeof msg === 'string' ? msg : t('teachers.videoUploadFailed'));
    } finally {
      setUploadingVideo(false);
      if (videoFileRef.current) videoFileRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image?.trim()) {
      toast.error(t('teachers.photoRequired') || 'صورة الشيخ مطلوبة.');
      return;
    }
    if (formData.teacherType === 'FULL_TEACHER') {
      if (!formData.hourlyRate || parseFloat(formData.hourlyRate) <= 0) {
        toast.error(t('teachers.hourlyRateRequired') || 'يجب تحديد سعر الساعة للشيخ الكامل.');
        return;
      }
      for (let i = 0; i < schedules.length; i++) {
        const s = schedules[i];
        if (s.startTime >= s.endTime) {
          toast.error(
            t('teachers.invalidScheduleTime') || `الموعد رقم ${i + 1}: وقت البداية يجب أن يكون قبل وقت النهاية.`
          );
          return;
        }
        const sameDay = schedules.filter((x) => Number(x.dayOfWeek) === Number(s.dayOfWeek) && x.id !== s.id);
        for (const other of sameDay) {
          if (
            (s.startTime >= other.startTime && s.startTime < other.endTime) ||
            (s.endTime > other.startTime && s.endTime <= other.endTime) ||
            (s.startTime <= other.startTime && s.endTime >= other.endTime)
          ) {
            const dayName = daysOfWeek.find((d) => d.value === Number(s.dayOfWeek))?.label;
            toast.error(
              t('teachers.scheduleOverlap') || `يوجد تداخل في مواعيد يوم ${dayName}. يرجى مراجعة الأوقات.`
            );
            return;
          }
        }
      }
    }
    setLoading(true);
    try {
      const isCourseSheikh = formData.teacherType === 'COURSE_SHEIKH';
      const submitData = {
        ...formData,
        introVideoUrl: formData.introVideoUrl?.trim() || null,
        teacherType: formData.teacherType === 'COURSE_SHEIKH' ? 'COURSE_SHEIKH' : 'FULL_TEACHER',
        experience: formData.experience ? parseInt(formData.experience, 10) : undefined,
        hourlyRate: isCourseSheikh ? 0 : (formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined),
        specialties: formData.specialties ? formData.specialties.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        schedules: isCourseSheikh ? [] : schedules.map((s) => ({
          dayOfWeek: parseInt(s.dayOfWeek, 10),
          startTime: s.startTime,
          endTime: s.endTime,
        })),
      };
      await adminAPI.updateTeacher(id, submitData);
      toast.success(t('teachers.updateSuccess'));
      navigate(`/teachers/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('teachers.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="space-y-8 max-w-4xl">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[420px] rounded-2xl lg:col-span-2" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen', isRTL && 'text-right')}>
      {/* Modern header */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/teachers/${id}`)}
            className="size-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm"
          >
            <FiArrowLeft className="size-5 text-gray-600" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1">
              {t('teachers.editTeacher')}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl tracking-tight">
              {t('teachers.updateTeacherInfo')}
            </h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Basic info - 2/3 width */}
          <Card className="lg:col-span-2 rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-500 text-white shadow-md shadow-primary-500/25">
                  <FiUser className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('teachers.basicInfo')}
                  </CardTitle>
                  <CardDescription className="text-sm mt-0.5">
                    {t('teachers.basicInfoDesc')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">{t('teachers.teacherType')}</Label>
                <select
                  name="teacherType"
                  value={formData.teacherType}
                  onChange={handleChange}
                  className={cn(
                    'w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50',
                    'focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors',
                    isRTL && 'text-right'
                  )}
                >
                  <option value="FULL_TEACHER">{t('teachers.fullTeacher')}</option>
                  <option value="COURSE_SHEIKH">{t('teachers.courseSheikh')}</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">{t('teachers.specialization')}</Label>
                  <Input
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="e.g. Quran Recitation"
                    className={cn('rounded-xl h-11', isRTL && 'text-right')}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">{t('teachers.specialties')}</Label>
                  <Input
                    name="specialties"
                    value={formData.specialties}
                    onChange={handleChange}
                    placeholder="Tajweed, Recitation, ..."
                    className={cn('rounded-xl h-11', isRTL && 'text-right')}
                  />
                </div>
                {formData.teacherType !== 'COURSE_SHEIKH' && (
                  <>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium flex items-center gap-2">
                    <FiDollarSign className="size-4 text-emerald-600" />
                    {t('teachers.hourlyRate')}
                    <span className="text-xs text-gray-500">
                      {language === 'ar'
                        ? `(بالـ ${currency?.nameAr || 'عملة النظام'} - ${currency?.symbol || ''})`
                        : `(in ${currency?.nameEn || 'system currency'} - ${currency?.symbol || ''})`}
                    </span>
                  </Label>
                  <Input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className={cn('rounded-xl h-11', isRTL && 'text-right')}
                  />
                  {formData.hourlyRate && (
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar'
                        ? `سيتم عرضها كـ ${formatCurrency(formData.hourlyRate)} في الواجهات.`
                        : `Will be shown as ${formatCurrency(formData.hourlyRate)} in the UI.`}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">{t('teachers.experience')}</Label>
                  <Input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min={0}
                    placeholder="0"
                    className={cn('rounded-xl h-11', isRTL && 'text-right')}
                  />
                </div>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">{t('teachers.bioEn')}</Label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Short bio in English..."
                  className={cn(
                    'w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 placeholder:text-gray-400',
                    'focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors resize-none',
                    isRTL && 'text-right'
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">{t('teachers.bioAr')}</Label>
                <textarea
                  name="bioAr"
                  value={formData.bioAr}
                  onChange={handleChange}
                  rows={3}
                  dir="rtl"
                  placeholder="السيرة بالعربية..."
                  className={cn(
                    'w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-gray-50/50 placeholder:text-gray-400',
                    'focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors resize-none',
                    isRTL && 'text-right'
                  )}
                />
              </div>

              {/* Approved — high-contrast switch (visible on light backgrounds) */}
              <div
                className={cn(
                  'flex items-center justify-between gap-4 rounded-xl border-2 px-4 py-3.5 shadow-sm transition-colors',
                  formData.isApproved
                    ? 'border-emerald-500/70 bg-gradient-to-l from-emerald-100/90 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/30 dark:border-emerald-600'
                    : 'border-amber-400/80 bg-amber-50/90 dark:border-amber-600 dark:bg-amber-950/25'
                )}
              >
                <Label htmlFor="teacher-is-approved" className="text-gray-900 dark:text-gray-100 font-semibold cursor-pointer flex-1">
                  {t('teachers.approved')}
                </Label>
                <span dir="ltr" className="inline-flex shrink-0 scale-125 origin-center">
                  <Switch
                    id="teacher-is-approved"
                    checked={formData.isApproved}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isApproved: checked }))}
                    className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-slate-500 border border-slate-600/30"
                  />
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Right: Media - 1/3 width */}
          <div className="space-y-6">
            {/* Photo card */}
            <Card className="rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary-500 text-white">
                    <FiImage className="size-4" />
                  </div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    {t('teachers.photo')} *
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <input type="file" ref={imageFileRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                {formData.image ? (
                  <div className="relative group">
                    <img
                      src={formData.image}
                      alt="Teacher"
                      className="w-full aspect-square max-h-52 rounded-xl object-cover border border-gray-200 shadow-inner"
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => imageFileRef.current?.click()}
                        disabled={uploadingImage}
                        className="bg-white/90 text-gray-900 hover:bg-white shadow-md"
                      >
                        <FiUpload className="size-4" />
                        {uploadingImage ? t('common.uploading') : t('teachers.uploadFromDevice')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageFileRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full aspect-square max-h-52 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50/30 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-primary-600"
                  >
                    <FiImage className="size-10 text-gray-400" />
                    <span className="text-sm font-medium">
                      {uploadingImage ? t('common.uploading') : t('teachers.uploadFromDevice')}
                    </span>
                  </button>
                )}
                <Input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="أو الصق رابط الصورة"
                  className={cn('rounded-xl h-10 text-sm', isRTL && 'text-right')}
                />
              </CardContent>
            </Card>

            {/* Intro video — optional, collapsed by default */}
            <details className="group rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden open:shadow-md open:border-emerald-200/80 transition-shadow">
              <summary
                className={cn(
                  'flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 bg-gray-50/80 hover:bg-emerald-50/60 transition-colors',
                  isRTL && 'flex-row-reverse text-right'
                )}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                    <FiVideo className="size-4" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-gray-900">
                      {t('teachers.introVideo')}
                    </span>
                    <span className="text-xs text-gray-500 font-normal">
                      {t('teachers.introVideoOptionalHint') || 'اختياري — اضغط للعرض أو الرفع'}
                    </span>
                  </span>
                </span>
                <FiChevronDown className="size-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180" />
              </summary>
              <CardContent className="p-5 space-y-4 border-t border-gray-100">
                <input type="file" ref={videoFileRef} accept="video/*" onChange={handleVideoUpload} className="hidden" />
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <Input
                    type="url"
                    name="introVideoUrl"
                    value={formData.introVideoUrl}
                    onChange={handleChange}
                    placeholder={t('teachers.introVideoUrlPlaceholder') || 'رابط الفيديو (يوتيوب أو ملف)'}
                    className={cn('flex-1 min-w-0 rounded-xl h-10 text-sm', isRTL && 'text-right')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => videoFileRef.current?.click()}
                    disabled={uploadingVideo}
                    className="shrink-0 rounded-xl h-10 px-4 border-emerald-200 text-emerald-800 hover:bg-emerald-50"
                  >
                    <FiUpload className="size-4" />
                    {uploadingVideo ? t('common.uploading') : t('teachers.uploadIntroVideo')}
                  </Button>
                </div>
                {formData.introVideoUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                    {formData.introVideoUrl.match(/\.(mp4|webm|ogg)(\?|$)/i) ? (
                      <video
                        src={formData.introVideoUrl}
                        controls
                        preload="none"
                        className="w-full aspect-video object-contain"
                      />
                    ) : (
                      <a
                        href={formData.introVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 text-sm text-primary-600 hover:underline break-all font-medium"
                      >
                        {formData.introVideoUrl}
                      </a>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setFormData((prev) => ({ ...prev, introVideoUrl: '' }))}
                  disabled={!formData.introVideoUrl}
                >
                  {t('teachers.clearIntroVideo') || 'إزالة الفيديو التعريفي'}
                </Button>
              </CardContent>
            </details>
          </div>
        </div>

        {/* مواعيد العمل - نفس صفحة الإضافة (للمشايخ الكاملين فقط) */}
        {formData.teacherType === 'FULL_TEACHER' && (
          <Card className="rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-blue-50/50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500 text-white">
                  <FiCalendar className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    {t('teachers.workSchedule') || 'مواعيد العمل'}
                  </CardTitle>
                  <CardDescription className="text-sm mt-0.5">
                    {t('teachers.workScheduleDesc') || 'حدد مواعيد العمل الأسبوعية للشيخ. هذه المواعيد ستكون متاحة للطلاب للحجز.'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {schedules.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                  <FiClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('teachers.noSchedules') || 'لا توجد مواعيد محددة'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {t('teachers.addWorkSchedule') || 'أضف مواعيد العمل الأسبوعية للشيخ'}
                  </p>
                  <Button type="button" onClick={addSchedule} className="bg-blue-600 hover:bg-blue-700">
                    <FiPlus className="size-4" />
                    {t('teachers.addSchedule') || 'إضافة موعد عمل'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule, index) => (
                    <div
                      key={schedule.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">
                            {t('teachers.day') || 'اليوم'}
                          </Label>
                          <select
                            value={schedule.dayOfWeek}
                            onChange={(e) => updateSchedule(schedule.id, 'dayOfWeek', e.target.value)}
                            className={cn(
                              'w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white',
                              'focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none',
                              isRTL && 'text-right'
                            )}
                          >
                            {daysOfWeek.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">
                            {t('teachers.startTime') || 'من الساعة'}
                          </Label>
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) => updateSchedule(schedule.id, 'startTime', e.target.value)}
                            className="rounded-xl h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-700">
                            {t('teachers.endTime') || 'إلى الساعة'}
                          </Label>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) => updateSchedule(schedule.id, 'endTime', e.target.value)}
                            className="rounded-xl h-10"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSchedule(schedule.id)}
                        className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl size-10"
                        title={t('teachers.deleteSchedule') || 'حذف الموعد'}
                      >
                        <FiTrash2 className="size-5" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addSchedule} className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                    <FiPlus className="size-4" />
                    {t('teachers.addAnotherSchedule') || 'إضافة موعد آخر'}
                  </Button>
                </div>
              )}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>{t('common.note') || 'ملاحظة:'}</strong>{' '}
                  {t('teachers.scheduleNote') || 'يمكن للشيخ تعديل مواعيد العمل لاحقاً من خلال لوحة التحكم الخاصة به.'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sticky actions bar */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/teachers/${id}`)}
            className="rounded-xl h-11 px-6 border-gray-200"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl h-11 px-8 bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/25"
          >
            <FiSave className="size-4" />
            {loading ? t('common.saving') : t('teachers.updateTeacher')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTeacher;
