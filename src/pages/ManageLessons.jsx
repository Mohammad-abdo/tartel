import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { courseAPI, adminAPI, fileUploadAPI } from '../services/api';
import {
  FiArrowLeft,
  FiSave,
  FiVideo,
  FiPlus,
  FiTrash2,
  FiUpload,
  FiSearch,
  FiChevronDown,
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

const ManageLessons = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [course, setCourse] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [lessonRows, setLessonRows] = useState([newLessonRow()]);

  useEffect(() => {
    fetchCourse();
    fetchTeachers();
  }, [id]);

  const fetchCourse = async () => {
    setFetching(true);
    try {
      const response = await courseAPI.getCourseById(id);
      setCourse(response.data);
      
      // Load existing lessons into lessonRows
      if (response.data.lessons && response.data.lessons.length > 0) {
        const existingLessons = response.data.lessons.map(lesson => {
          const firstVideo = lesson.videos?.[0];
          return {
            id: lesson.id || crypto.randomUUID(),
            videoUrl: firstVideo?.videoUrl || '',
            thumbnailUrl: firstVideo?.thumbnailUrl || '',
            durationMinutes: lesson.durationMinutes || (firstVideo ? Math.floor(firstVideo.durationSeconds / 60) : ''),
            teacherId: firstVideo?.teacherId || '',
            title: lesson.title || '',
            titleAr: lesson.titleAr || '',
          };
        });
        setLessonRows(existingLessons.length > 0 ? existingLessons : [newLessonRow()]);
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('فشل في تحميل بيانات الدورة');
    } finally {
      setFetching(false);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const response = await adminAPI.getTeachers({ page: 1, limit: 100 });
      const list = response.data?.teachers ?? response.data ?? [];
      setTeachers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const addLessonRow = () => {
    setLessonRows([...lessonRows, newLessonRow()]);
  };

  const removeLessonRow = (id) => {
    if (lessonRows.length > 1) {
      setLessonRows(lessonRows.filter((row) => row.id !== id));
    }
  };

  const updateLessonRow = (id, field, value) => {
    setLessonRows(lessonRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleLessonVideoUpload = (rowId) => async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const response = await fileUploadAPI.uploadVideo(fd);
      const url = response.data?.url ?? response.data;
      updateLessonRow(rowId, 'videoUrl', url);
      toast.success('تم رفع الفيديو بنجاح');
      return { url };
    } catch (error) {
      toast.error('فشل في رفع الفيديو');
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const lessons = lessonRows
        .filter((row) => row.videoUrl?.trim())
        .map((row, i) => ({
          title: row.title || `Lesson ${i + 1}`,
          titleAr: row.titleAr || `درس ${i + 1}`,
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

      console.log('Updating course lessons:', { lessons });
      
      // Update course with new lessons
      await courseAPI.updateCourse(id, { lessons });
      toast.success('تم حفظ الدروس بنجاح');
      navigate(`/courses/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل في حفظ الدروس');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col">
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="size-12 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">الدورة غير موجودة</h3>
        <Button onClick={() => navigate('/courses')}>
          العودة للدورات
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(`/courses/${id}`)}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors backdrop-blur-sm"
              >
                <FiArrowLeft className="size-6" />
              </button>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <FiVideo className="text-3xl text-white/90" />
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">إدارة دروس الدورة</h1>
                    <p className="text-blue-100 mt-1">{course.title}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(`/courses/${id}`)}
                className="px-4 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium border border-white/20"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="manage-lessons-form"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-all duration-300 font-medium shadow-lg"
              >
                <FiSave className="size-5" />
                {loading ? 'جاري الحفظ...' : 'حفظ الدروس'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <form id="manage-lessons-form" onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          <div className="mx-auto max-w-4xl">
            {/* Course Videos (lessons) */}
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-3 text-base">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <FiVideo className="size-5 text-green-700" />
                  </div>
                  <span className="text-green-800">دروس الدورة ({lessonRows.length})</span>
                </CardTitle>
                <Button type="button" variant="default" size="sm" onClick={addLessonRow} className="gap-1.5">
                  <FiPlus className="size-4" />
                  إضافة درس
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessonRows.map((row, index) => (
                  <div key={row.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">درس {index + 1}</span>
                      {lessonRows.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLessonRow(row.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <FiTrash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {/* Video Upload */}
                      <div>
                        <Label>فيديو الدرس</Label>
                        <VideoUpload
                          value={row.videoUrl}
                          onUpload={handleLessonVideoUpload(row.id)}
                          onRemove={() => updateLessonRow(row.id, 'videoUrl', '')}
                        />
                      </div>
                      
                      {/* Duration and Teacher */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`duration-${row.id}`}>المدة (بالدقائق)</Label>
                          <Input
                            id={`duration-${row.id}`}
                            type="number"
                            min="1"
                            value={row.durationMinutes}
                            onChange={(e) => updateLessonRow(row.id, 'durationMinutes', e.target.value)}
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`teacher-${row.id}`}>المعلم (اختياري)</Label>
                          <select
                            id={`teacher-${row.id}`}
                            value={row.teacherId}
                            onChange={(e) => updateLessonRow(row.id, 'teacherId', e.target.value)}
                            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            <option value="">اختر معلم</option>
                            {teachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.user?.firstName} {teacher.user?.lastName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Lesson Title */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <Label htmlFor={`title-${row.id}`}>عنوان الدرس (إنجليزي)</Label>
                          <Input
                            id={`title-${row.id}`}
                            value={row.title}
                            onChange={(e) => updateLessonRow(row.id, 'title', e.target.value)}
                            placeholder={`Lesson ${index + 1}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`titleAr-${row.id}`}>عنوان الدرس (عربي)</Label>
                          <Input
                            id={`titleAr-${row.id}`}
                            value={row.titleAr}
                            onChange={(e) => updateLessonRow(row.id, 'titleAr', e.target.value)}
                            placeholder={`درس ${index + 1}`}
                            dir="rtl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {lessonRows.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FiVideo className="mx-auto mb-2 size-12 text-gray-300" />
                    <p>لا توجد دروس بعد</p>
                    <Button type="button" onClick={addLessonRow} className="mt-4">
                      إضافة أول درس
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManageLessons;