import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { courseAPI, adminAPI, fileUploadAPI } from '../services/api';
import {
  FiArrowLeft,
  FiSave,
  FiBook,
  FiDollarSign,
  FiUser,
  FiImage,
  FiUpload,
  FiX,
  FiSearch,
  FiChevronDown,
  FiVideo,
  FiPlus,
  FiTrash2,
} from 'react-icons/fi';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import VideoUpload from '../components/VideoUpload';
import { cn } from '../lib/utils';

const newLessonRow = () => ({
  id: crypto.randomUUID?.() ?? `row-${Date.now()}`,
  videoUrl: '',
  thumbnailUrl: '',
  durationMinutes: '',
  teacherId: '',
});

const AddCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const thumbnailFileRef = useRef(null);
  const imageFileRef = useRef(null);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const teacherDropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    teacherIds: [],
    price: '',
    duration: '',
    image: '',
    introVideoUrl: '',
    introVideoThumbnail: '',
    status: 'DRAFT',
  });
  const [lessonRows, setLessonRows] = useState([newLessonRow()]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(e.target)) {
        setShowTeacherDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await adminAPI.getTeachers({ page: 1, limit: 100 });
      const list = response.data?.teachers ?? response.data ?? [];
      // Sort so course sheikhs (for courses) appear first
      list.sort((a, b) => (a.teacherType === 'COURSE_SHEIKH' ? 0 : 1) - (b.teacherType === 'COURSE_SHEIKH' ? 0 : 1));
      setTeachers(list);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error(t('courses.loadTeachersFailed'));
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeacherSelect = (teacher) => {
    const isSelected = formData.teacherIds.includes(teacher.id);
    setFormData((prev) => ({
      ...prev,
      teacherIds: isSelected
        ? prev.teacherIds.filter((id) => id !== teacher.id)
        : [...prev.teacherIds, teacher.id],
    }));
  };

  const handleRemoveTeacher = (teacherId) => {
    setFormData((prev) => ({ ...prev, teacherIds: prev.teacherIds.filter((id) => id !== teacherId) }));
  };

  const getSelectedTeachers = () => teachers.filter((tch) => formData.teacherIds.includes(tch.id));

  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.toLowerCase();
    const email = (teacher.user?.email || '').toLowerCase();
    const search = teacherSearch.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleVideoUpload = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const response = await fileUploadAPI.uploadVideo(fd);
    const url = response.data?.url ?? response.data;
    setFormData((prev) => ({ ...prev, introVideoUrl: url }));
    toast.success(t('courses.videoUploadSuccess'));
    return { url };
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumbnail(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fileUploadAPI.uploadImage(fd);
      setFormData((prev) => ({ ...prev, introVideoThumbnail: response.data?.url ?? response.data }));
      toast.success(t('courses.imageUploadSuccess'));
    } catch {
      toast.error(t('courses.imageUploadFailed'));
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = '';
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await fileUploadAPI.uploadImage(fd);
      setFormData((prev) => ({ ...prev, image: response.data?.url ?? response.data }));
      toast.success(t('courses.imageUploadSuccess'));
    } catch {
      toast.error(t('courses.imageUploadFailed'));
    } finally {
      setUploadingImage(false);
      if (imageFileRef.current) imageFileRef.current.value = '';
    }
  };

  const addLessonRow = () => setLessonRows((prev) => [...prev, newLessonRow()]);

  const removeLessonRow = (id) => {
    setLessonRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const updateLessonRow = (id, field, value) => {
    setLessonRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleLessonVideoUpload = (rowId) => async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const response = await fileUploadAPI.uploadVideo(fd);
    const url = response.data?.url ?? response.data;
    updateLessonRow(rowId, 'videoUrl', url);
    toast.success(t('courses.videoUploadSuccess'));
    return { url };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.teacherIds.length === 0) {
      toast.error(t('courses.selectAtLeastOneTeacher'));
      return;
    }
    setLoading(true);
    try {
      const lessons = lessonRows
        .filter((row) => row.videoUrl?.trim())
        .map((row, i) => ({
          title: `Lesson ${i + 1}`,
          titleAr: `درس ${i + 1}`,
          order: i,
          durationMinutes: parseInt(row.durationMinutes, 10) || 0,
          videos: [
            {
              videoUrl: row.videoUrl,
              thumbnailUrl: row.thumbnailUrl || undefined,
              durationSeconds: (parseInt(row.durationMinutes, 10) || 0) * 60,
              order: 0,
              teacherId: row.teacherId || undefined,
            },
          ],
        }));

      const submitData = {
        title: formData.title,
        titleAr: formData.titleAr,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        teacherId: formData.teacherIds[0],
        teacherIds: formData.teacherIds,
        price: parseFloat(formData.price) || 0,
        duration: formData.duration ? parseFloat(formData.duration) : undefined,
        image: formData.image,
        introVideoUrl: formData.introVideoUrl,
        introVideoThumbnail: formData.introVideoThumbnail,
        status: formData.status,
        lessons: lessons,
      };
      
      console.log('Submitting course data:', submitData);
      console.log('Lessons to submit:', lessons);
      await courseAPI.createCourse(submitData);
      toast.success(t('courses.createSuccess'));
      navigate('/courses');
    } catch (error) {
      toast.error(error.response?.data?.message || t('courses.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  const textareaClass =
    'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50';

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Islamic Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
                aria-label={t('common.back')}
              >
                <FiArrowLeft className="size-6" />
              </button>
              <div className="islamic-pattern">
                <div className="flex items-center gap-4 mb-2">
                  <FiPlus className="text-3xl text-white/90" />
                  <div>
                    <h1 className="text-3xl font-bold arabic-text tracking-tight">إضافة دورة جديدة</h1>
                    <p className="text-emerald-100 mt-1 arabic-text">أنشئ دورة تعليمية جديدة لنشر العلم والمعرفة</p>
                  </div>
                </div>
                <div className="mt-3 text-emerald-100 text-sm arabic-text">
                  "وَقُلْ رَبِّ زِدْنِي عِلْمًا" - سورة طه
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="add-course-form"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg arabic-text"
              >
                <FiSave className="size-5" />
                {loading ? 'جاري الحفظ...' : 'إنشاء الدورة'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <form id="add-course-form" onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-2">
            {/* Left column: Basic info, Teachers, Pricing, Media */}
            <div className="flex flex-col gap-6">
              <Card className="islamic-border shadow-lg">
                <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
                  <CardTitle className="flex items-center gap-3 text-base arabic-text">
                    <div className="p-2 bg-emerald-200 rounded-lg">
                      <FiBook className="size-5 text-emerald-700" aria-hidden />
                    </div>
                    <span className="text-emerald-800 dark:text-emerald-200">معلومات الدورة الأساسية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="title">{t('courses.courseTitleEn')} *</Label>
                      <Input id="title" name="title" value={formData.title} onChange={handleChange} required placeholder="Course Title" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="titleAr">{t('courses.courseTitleAr')}</Label>
                      <Input id="titleAr" name="titleAr" value={formData.titleAr} onChange={handleChange} placeholder="عنوان الدورة" dir="rtl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">{t('courses.descriptionEn')}</Label>
                    <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={2} placeholder="Course description..." className={textareaClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="descriptionAr">{t('courses.descriptionAr')}</Label>
                    <textarea id="descriptionAr" name="descriptionAr" value={formData.descriptionAr} onChange={handleChange} rows={2} placeholder="وصف الدورة..." dir="rtl" className={textareaClass} />
                  </div>
                </CardContent>
              </Card>

              <Card className="islamic-border shadow-lg overflow-visible">
                <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <CardTitle className="flex items-center gap-3 text-base arabic-text">
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <FiUser className="size-5 text-blue-700" aria-hidden />
                    </div>
                    <span className="text-blue-800 dark:text-blue-200">اختيار المعلمين *</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 overflow-visible">
                  {formData.teacherIds.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getSelectedTeachers().map((teacher) => (
                        <div key={teacher.id} className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-sm">
                          <span className="font-medium text-foreground">
                            {teacher.user?.firstName} {teacher.user?.lastName}
                          </span>
                          <button type="button" onClick={() => handleRemoveTeacher(teacher.id)} className="rounded p-0.5 text-muted-foreground hover:text-destructive" aria-label={t('common.close')}>
                            <FiX className="size-3.5" aria-hidden />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="relative" ref={teacherDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowTeacherDropdown(!showTeacherDropdown)}
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground hover:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <span>{formData.teacherIds.length === 0 ? t('courses.selectTeachersPlaceholder') : `${formData.teacherIds.length} ${t('courses.teachers')}`}</span>
                      <FiChevronDown className={cn('size-4 transition-transform', showTeacherDropdown && 'rotate-180')} aria-hidden />
                    </button>
                    {showTeacherDropdown && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-hidden rounded-xl border border-border bg-popover shadow-tarteel-md">
                        <div className="border-b border-border p-2">
                          <div className="relative">
                            <FiSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                            <Input placeholder={t('common.search')} value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} className="h-9 pl-8" onClick={(e) => e.stopPropagation()} />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {loadingTeachers ? (
                            <div className="flex justify-center py-6">
                              <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            </div>
                          ) : filteredTeachers.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">{t('teachers.noTeachers')}</p>
                          ) : (
                            filteredTeachers.map((teacher) => {
                              const isSelected = formData.teacherIds.includes(teacher.id);
                              return (
                                <button
                                  key={teacher.id}
                                  type="button"
                                  onClick={() => handleTeacherSelect(teacher)}
                                  className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50', isSelected && 'bg-primary/10')}
                                >
                                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                                    {teacher.user?.firstName?.[0] || 'T'}
                                  </div>
                                  <div className="min-w-0 flex-1 truncate">
                                    {teacher.user?.firstName} {teacher.user?.lastName}
                                    {teacher.teacherType === 'COURSE_SHEIKH' && (
                                      <span className="ml-1.5 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                                        {t('teachers.courseSheikh')}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && <div className="size-4 rounded-full bg-primary" />}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="islamic-border shadow-lg">
                <CardHeader className="pb-3 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
                  <CardTitle className="flex items-center gap-3 text-base arabic-text">
                    <div className="p-2 bg-amber-200 rounded-lg">
                      <FiDollarSign className="size-5 text-amber-700" aria-hidden />
                    </div>
                    <span className="text-amber-800 dark:text-amber-200">السعر والحالة</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="price">{t('courses.priceLabel')} *</Label>
                      <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required min={0} step={0.01} placeholder="0.00" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="duration">{t('courses.durationHours')}</Label>
                      <Input id="duration" name="duration" type="number" value={formData.duration} onChange={handleChange} min={0} step={0.5} placeholder="10" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="status">{t('courses.statusLabel')}</Label>
                      <select id="status" name="status" value={formData.status} onChange={handleChange} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring">
                        <option value="DRAFT">{t('courses.draft')}</option>
                        <option value="PUBLISHED">{t('courses.published')}</option>
                        <option value="ARCHIVED">{t('courses.archived')}</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="islamic-border shadow-lg">
                <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <CardTitle className="flex items-center gap-3 text-base arabic-text">
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <FiImage className="size-5 text-purple-700" aria-hidden />
                    </div>
                    <span className="text-purple-800 dark:text-purple-200">الوسائط والصور</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>{t('courses.courseImageLabel')}</Label>
                    <div className="flex gap-2">
                      <Input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="URL" className="flex-1" />
                      <input type="file" ref={imageFileRef} accept="image/*" onChange={handleImageUpload} className="sr-only" id="course-image-file" />
                      <Button type="button" variant="secondary" size="sm" onClick={() => imageFileRef.current?.click()} disabled={uploadingImage}>
                        {uploadingImage ? t('courses.uploading') : t('courses.upload')}
                      </Button>
                    </div>
                    {formData.image && <img src={formData.image} alt="" className="mt-1 h-20 w-32 rounded-lg object-cover border border-border" />}
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('courses.introVideo')}</Label>
                    <VideoUpload value={formData.introVideoUrl} onUpload={handleVideoUpload} onRemove={() => setFormData((prev) => ({ ...prev, introVideoUrl: '' }))} aria-label={t('courses.introVideo')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('courses.introVideoThumbnailLabel')}</Label>
                    <div className="flex gap-2">
                      <Input type="url" name="introVideoThumbnail" value={formData.introVideoThumbnail} onChange={handleChange} placeholder="URL" className="flex-1" />
                      <input type="file" ref={thumbnailFileRef} accept="image/*" onChange={handleThumbnailUpload} className="sr-only" id="thumbnail-file" />
                      <Button type="button" variant="secondary" size="sm" onClick={() => thumbnailFileRef.current?.click()} disabled={uploadingThumbnail}>
                        {uploadingThumbnail ? t('courses.uploading') : t('courses.upload')}
                      </Button>
                    </div>
                    {formData.introVideoThumbnail && <img src={formData.introVideoThumbnail} alt="" className="mt-1 h-20 w-32 rounded-lg object-cover border border-border" />}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Course videos (lessons) */}
            <Card className="xl:max-h-[calc(100vh-8rem)] xl:flex xl:flex-col islamic-border shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardTitle className="flex items-center gap-3 text-base arabic-text">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <FiVideo className="size-5 text-green-700" aria-hidden />
                  </div>
                  <span className="text-green-800 dark:text-green-200">فيديوهات الدورة (الدروس)</span>
                </CardTitle>
                <Button type="button" variant="default" size="sm" onClick={addLessonRow} className="gap-1.5">
                  <FiPlus className="size-4" aria-hidden />
                  {t('courses.addVideo')}
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                <ul className="space-y-4">
                  {lessonRows.map((row, index) => (
                    <li key={row.id} className="rounded-xl border border-border bg-muted/30 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{t('courses.lessonNumber', { n: index + 1 })}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeLessonRow(row.id)} disabled={lessonRows.length <= 1} aria-label={t('common.delete')}>
                          <FiTrash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <Label>{t('courses.introVideo')}</Label>
                          <VideoUpload
                            value={row.videoUrl}
                            onUpload={handleLessonVideoUpload(row.id)}
                            onRemove={() => updateLessonRow(row.id, 'videoUrl', '')}
                            aria-label={`${t('courses.introVideo')} ${index + 1}`}
                          />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <Label>{t('courses.videoDuration')}</Label>
                            <Input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={row.durationMinutes}
                              onChange={(e) => updateLessonRow(row.id, 'durationMinutes', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>{t('courses.videoTeacher')}</Label>
                            <select
                              value={row.teacherId}
                              onChange={(e) => updateLessonRow(row.id, 'teacherId', e.target.value)}
                              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                              <option value="">—</option>
                              {getSelectedTeachers().map((tch) => (
                                <option key={tch.id} value={tch.id}>
                                  {tch.user?.firstName} {tch.user?.lastName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
