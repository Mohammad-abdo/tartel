import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditCourse = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const thumbnailFileRef = useRef(null);
  const imageFileRef = useRef(null);
  const [fetching, setFetching] = useState(true);
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
    if (id) {
      fetchTeachers();
      fetchCourse();
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
        setShowTeacherDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCourse = async () => {
    try {
      const response = await courseAPI.getCourseById(id);
      const course = response.data;
      let teacherIds = [];
      if (
        course.courseTeachers &&
        Array.isArray(course.courseTeachers) &&
        course.courseTeachers.length > 0
      ) {
        teacherIds = course.courseTeachers.map((ct) => ct.teacherId);
      } else if (course.teacherId) {
        teacherIds = [course.teacherId];
      }
      setFormData({
        title: course.title || '',
        titleAr: course.titleAr || '',
        description: course.description || '',
        descriptionAr: course.descriptionAr || '',
        teacherIds,
        price: course.price ?? '',
        duration: course.duration ?? '',
        image: course.image || '',
        introVideoUrl: course.introVideoUrl || '',
        introVideoThumbnail: course.introVideoThumbnail || '',
        status: course.status || 'DRAFT',
      });
      if (course.lessons && Array.isArray(course.lessons) && course.lessons.length > 0) {
        const rows = course.lessons.map((lesson) => {
          const firstVideo = lesson.videos?.[0];
          return {
            id: lesson.id,
            videoUrl: firstVideo?.videoUrl || '',
            thumbnailUrl: firstVideo?.thumbnailUrl || '',
            durationMinutes: firstVideo ? String(Math.round((firstVideo.durationSeconds || 0) / 60)) : '',
            teacherId: firstVideo?.teacherId || '',
          };
        });
        setLessonRows(rows);
      } else {
        setLessonRows([newLessonRow()]);
      }
    } catch (err) {
      toast.error(t('courses.loadCourseFailed') || t('courses.loadTeachersFailed'));
      navigate('/courses');
    } finally {
      setFetching(false);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await adminAPI.getTeachers({ page: 1, limit: 100 });
      const list = response.data?.teachers ?? response.data ?? [];
      list.sort((a, b) => (a.teacherType === 'COURSE_SHEIKH' ? 0 : 1) - (b.teacherType === 'COURSE_SHEIKH' ? 0 : 1));
      setTeachers(list);
    } catch (error) {
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
    if (isSelected) {
      setFormData((prev) => ({
        ...prev,
        teacherIds: prev.teacherIds.filter((tid) => tid !== teacher.id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        teacherIds: [...prev.teacherIds, teacher.id],
      }));
    }
  };

  const handleRemoveTeacher = (teacherId) => {
    setFormData((prev) => ({
      ...prev,
      teacherIds: prev.teacherIds.filter((tid) => tid !== teacherId),
    }));
  };

  const getSelectedTeachers = () => teachers.filter((tch) => formData.teacherIds.includes(tch.id));

  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.user?.firstName || ''} ${teacher.user?.lastName || ''}`.toLowerCase();
    const email = (teacher.user?.email || '').toLowerCase();
    const search = teacherSearch.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const handleVideoUpload = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    const response = await fileUploadAPI.uploadVideo(formDataUpload);
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

  const removeLessonRow = (rowId) => {
    setLessonRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== rowId)));
  };

  const updateLessonRow = (rowId, field, value) => {
    setLessonRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: value } : r))
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
        ...formData,
        teacherId: formData.teacherIds[0],
        price: parseFloat(formData.price) || 0,
        duration: formData.duration ? parseFloat(formData.duration) : undefined,
        lessons,
      };
      await courseAPI.updateCourse(id, submitData);
      toast.success(t('courses.updateSuccess'));
      navigate(`/courses/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || t('courses.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const textareaClass =
    'flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50';

  if (fetching) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate('/courses')} aria-label={t('common.back')}>
              <FiArrowLeft className="size-5" aria-hidden />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">{t('courses.editCourse')}</h1>
              <p className="text-xs text-muted-foreground">{t('courses.editCourseSubtitle')}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="size-12 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Top bar – مثل صفحة إضافة الدورة */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/courses/${id}`)} aria-label={t('common.back')}>
            <FiArrowLeft className="size-5" aria-hidden />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{t('courses.editCourse')}</h1>
            <p className="text-xs text-muted-foreground">{t('courses.editCourseSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate(`/courses/${id}`)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="edit-course-form" variant="default" disabled={loading} className="gap-2">
            <FiSave className="size-4" aria-hidden />
            {loading ? t('common.saving') : t('courses.saveChanges')}
          </Button>
        </div>
      </div>

      <form id="edit-course-form" onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-2">
            {/* العمود الأيسر: معلومات الدورة، المعلمون، السعر، الوسائط */}
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiBook className="size-4 text-primary" aria-hidden />
                    {t('courses.courseInfo')}
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

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiUser className="size-4 text-primary" aria-hidden />
                    {t('courses.teachers')} *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
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
                      <div className="absolute top-full left-0 right-0 z-20 mt-1 max-h-64 overflow-hidden rounded-xl border border-border bg-popover shadow-tarteel-md">
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

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiDollarSign className="size-4 text-primary" aria-hidden />
                    {t('courses.price')} &amp; {t('courses.statusLabel')}
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

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FiImage className="size-4 text-primary" aria-hidden />
                    {t('courses.media')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>{t('courses.courseImageLabel')}</Label>
                    <div className="flex gap-2">
                      <Input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="URL" className="flex-1" />
                      <input type="file" ref={imageFileRef} accept="image/*" onChange={handleImageUpload} className="sr-only" id="course-image-file-edit" />
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
                      <input type="file" ref={thumbnailFileRef} accept="image/*" onChange={handleThumbnailUpload} className="sr-only" id="thumbnail-file-edit" />
                      <Button type="button" variant="secondary" size="sm" onClick={() => thumbnailFileRef.current?.click()} disabled={uploadingThumbnail}>
                        {uploadingThumbnail ? t('courses.uploading') : t('courses.upload')}
                      </Button>
                    </div>
                    {formData.introVideoThumbnail && <img src={formData.introVideoThumbnail} alt="" className="mt-1 h-20 w-32 rounded-lg object-cover border border-border" />}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* العمود الأيمن: فيديوهات الدورة (الدروس) */}
            <Card className="xl:max-h-[calc(100vh-8rem)] xl:flex xl:flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FiVideo className="size-4 text-primary" aria-hidden />
                  {t('courses.courseVideos')}
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
                              {teachers.map((tch) => (
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

export default EditCourse;
