# 🎯 خطة تطوير Frontend للـ Enrollment System

## 📋 المطلوب تطويره في الفرونت إند

تم إنجاز جميع الـ Backend APIs المطلوبة. الآن نحتاج لتطوير الواجهات التالية:

---

## 🛍️ 1. صفحة شراء الدورة (Course Purchase)

### المكونات المطلوبة:
- **صفحة تفاصيل الدورة** مع زر الشراء
- **نافذة اختيار الشيخ** (إذا كان هناك أكثر من شيخ للدورة)
- **نافذة تأكيد الشراء** مع تفاصيل السعر
- **رسائل النجاح/الخطأ**

### API Integration:
```javascript
// في courseAPI.js
export const enrollInCourse = async (courseId, sheikId = null) => {
  const body = sheikId ? { sheikId } : {};
  return await api.post(`/enrollments/${courseId}/enroll`, body);
};

export const checkEnrollmentStatus = async (courseId) => {
  return await api.get(`/enrollments/${courseId}/status`);
};
```

### UI Components:
```jsx
// PurchaseCourseButton.jsx
const PurchaseCourseButton = ({ courseId, sheikhs, onSuccess }) => {
  // Logic for purchase with sheikh selection
};

// SheikhSelectionModal.jsx
const SheikhSelectionModal = ({ sheikhs, onSelect, onClose }) => {
  // Modal for sheikh selection
};
```

---

## 📚 2. صفحة دوراتي (My Courses)

### المميزات:
- عرض جميع الدورات المشتراة
- بار التقدم لكل دورة
- إمكانية الدخول لمتابعة التعلم
- فلترة وبحث

### API Integration:
```javascript
// في enrollmentAPI.js
export const getMyEnrollments = async (page = 1, limit = 20) => {
  return await api.get(`/enrollments/my-courses?page=${page}&limit=${limit}`);
};
```

### UI Structure:
```jsx
// MyCourses.jsx
const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch and display enrolled courses
};

// CourseCard.jsx (with progress)
const CourseCard = ({ enrollment }) => {
  // Display course with progress bar
};
```

---

## 🎥 3. مشغل الفيديو مع تتبع التقدم

### المميزات:
- تشغيل الفيديوهات مع تتبع التقدم
- تسجيل بداية المشاهدة تلقائياً
- تسجيل الانتهاء عند إكمال المشاهدة
- عرض قائمة الدروس مع حالة الإكمال

### API Integration:
```javascript
// في videoProgressAPI.js
export const startLesson = async (lessonId, videoId = null) => {
  const body = videoId ? { videoId } : {};
  return await api.post(`/enrollments/lessons/${lessonId}/start`, body);
};

export const completeLesson = async (lessonId, videoId = null, watchDurationSeconds = 0) => {
  return await api.post(`/enrollments/lessons/${lessonId}/complete`, {
    videoId,
    watchDurationSeconds
  });
};

export const getCourseProgress = async (courseId) => {
  return await api.get(`/enrollments/${courseId}/progress`);
};
```

### UI Components:
```jsx
// VideoPlayer.jsx
const VideoPlayer = ({ lesson, onStart, onComplete }) => {
  const [watchTime, setWatchTime] = useState(0);
  
  useEffect(() => {
    // Auto-trigger start lesson API
    onStart(lesson.id);
  }, []);
  
  const handleVideoEnd = () => {
    // Auto-trigger complete lesson API
    onComplete(lesson.id, watchTime);
  };
};

// LessonsList.jsx
const LessonsList = ({ lessons, currentLesson, onLessonSelect }) => {
  // Display lessons with completion status
};
```

---

## 📊 4. صفحة إحصائيات التقدم

### المميزات:
- إحصائيات شاملة للتقدم
- رسوم بيانية للتقدم
- تفاصيل الوقت المستهلك
- قائمة الدروس المكتملة

### UI Components:
```jsx
// ProgressStats.jsx
const ProgressStats = ({ courseId }) => {
  const [progress, setProgress] = useState(null);
  
  // Fetch and display detailed progress
};

// ProgressChart.jsx
const ProgressChart = ({ progressData }) => {
  // Visual progress representation
};
```

---

## 🔧 5. تحديثات على الصفحات الموجودة

### CourseDetail.jsx
```jsx
// إضافة زر الشراء وحالة التسجيل
const [enrollmentStatus, setEnrollmentStatus] = useState(null);
const [isEnrolled, setIsEnrolled] = useState(false);

useEffect(() => {
  checkEnrollmentStatus(courseId).then(status => {
    setIsEnrolled(status.isEnrolled);
    setEnrollmentStatus(status.enrollment);
  });
}, [courseId]);

// عرض زر الشراء أو الانتقال للتعلم
{!isEnrolled ? (
  <PurchaseCourseButton courseId={courseId} />
) : (
  <Button onClick={() => navigate(`/learn/${courseId}`)}>
    متابعة التعلم
  </Button>
)}
```

### Navigation
```jsx
// إضافة رابط "دوراتي" في القائمة الجانبية
{
  title: 'دوراتي',
  href: '/my-courses',
  icon: FiBook
}
```

---

## 🛣️ 6. المسارات الجديدة (Routes)

### في App.jsx:
```jsx
// إضافة المسارات الجديدة
<Route path="/my-courses" element={
  <ProtectedRoute>
    <DashboardLayout>
      <MyCourses />
    </DashboardLayout>
  </ProtectedRoute>
} />

<Route path="/learn/:courseId" element={
  <ProtectedRoute>
    <VideoLearningLayout>
      <CourseLearning />
    </VideoLearningLayout>
  </ProtectedRoute>
} />

<Route path="/learn/:courseId/lesson/:lessonId" element={
  <ProtectedRoute>
    <VideoLearningLayout>
      <LessonViewer />
    </VideoLearningLayout>
  </ProtectedRoute>
} />
```

---

## 🎨 7. تصميم UI جديد

### VideoLearningLayout.jsx
```jsx
// تخطيط خاص بصفحات التعلم
const VideoLearningLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          {/* Video Player Area */}
          {children}
        </div>
        <div className="col-span-4">
          {/* Lessons List Sidebar */}
          <LessonsList />
        </div>
      </div>
    </div>
  );
};
```

### Progress Components Styling
- استخدام الألوان الإسلامية الموجودة
- بار التقدم مع الذهبي والأخضر
- أيقونات مناسبة للتعلم القرآني

---

## 🚀 8. تحسينات UX

### Auto-Progress Tracking
```jsx
// في VideoPlayer component
const trackProgress = useCallback(
  throttle((currentTime, duration) => {
    const progressPercent = (currentTime / duration) * 100;
    
    // Auto-save progress every 30 seconds
    if (progressPercent >= 90) {
      completeLesson(lessonId, videoId, currentTime);
    }
  }, 30000),
  [lessonId, videoId]
);
```

### Smart Navigation
- الانتقال التلقائي للدرس التالي
- تذكير بالدروس غير المكتملة
- إشعارات التقدم

### Offline Support
- تخزين تقدم المشاهدة محلياً
- مزامنة عند العودة للإنترنت

---

## 📱 9. Responsive Design

### Mobile Optimization
- مشغل فيديو محسّن للموبايل
- قائمة دروس قابلة للطي
- تحكم سهل باللمس

### Tablet Support
- استغلال أفضل للمساحة
- إمكانية عرض جانبي للدروس

---

## 🧪 10. Testing Strategy

### Unit Tests
```javascript
// Example test for enrollment API
describe('Enrollment API', () => {
  test('should enroll in course successfully', async () => {
    const result = await enrollInCourse('course-123', 'sheikh-456');
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
- تجربة المسار الكامل للشراء والتعلم
- اختبار تتبع التقدم
- اختبار التزامن بين الأجهزة

---

## ⚡ 11. Performance Optimization

### API Optimization
- تخزين مؤقت لحالة التسجيل
- تحديث التقدم بشكل متدرج
- تحميل الفيديوهات تدريجياً

### Bundle Optimization
- Code splitting للصفحات الجديدة
- Lazy loading للمكونات الثقيلة

---

## 🎯 خطة التنفيذ (Priority Order)

### Phase 1 (أولوية عالية) 🔥
1. **إضافة زر الشراء** في CourseDetail
2. **API integration** الأساسي
3. **صفحة دوراتي** البسيطة

### Phase 2 (أولوية متوسطة) ⚡
4. **مشغل الفيديو** مع تتبع التقدم
5. **صفحة التعلم** الكاملة
6. **قائمة الدروس** التفاعلية

### Phase 3 (أولوية منخفضة) 📈
7. **صفحة الإحصائيات**
8. **تحسينات UX** المتقدمة
9. **Testing** الشامل

---

## 💡 نصائح للتطوير

### 1. استخدم Context للتقدم
```jsx
// ProgressContext.js
const ProgressContext = createContext();

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
};
```

### 2. Real-time Updates
```jsx
// استخدم Socket.IO أو polling للتحديثات المباشرة
useEffect(() => {
  const interval = setInterval(() => {
    // Update progress from server
    refreshProgress();
  }, 60000); // كل دقيقة

  return () => clearInterval(interval);
}, []);
```

### 3. Error Handling
```jsx
// Centralized error handling
const useApiCall = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);
  
  return { execute, loading, error };
};
```

---

هذه الخطة توفر roadmap شاملة لتطوير frontend متكامل مع الـ enrollment system الجديد! 🎉