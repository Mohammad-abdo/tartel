import axios from 'axios';
import { fixImageUrls, fixImageUrlsInArray } from '../utils/imageUtils';

// const API_BASE_URL = 'http://localhost:8002/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add auth token; for FormData omit Content-Type so axios sets multipart boundary
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    const isFileUpload = config.url && String(config.url).includes('/files/upload');
    if (isFormData || isFileUpload) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: unwrap unified format { success, message, data } and fix image URLs
api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && body.success === true && 'data' in body) {
      response.data = body.data;
    }

    // Fix image URLs in response data
    if (response.data) {
      const imageFields = ['image', 'avatar', 'photo', 'thumbnail', 'introVideoThumbnail', 'introVideoUrl', 'videoUrl', 'thumbnailUrl', 'logoUrl', 'url', 'video_url', 'thumbnail_url', 'intro_video_url', 'intro_video_thumbnail'];

      if (Array.isArray(response.data)) {
        // Fix image URLs in array of objects
        response.data = fixImageUrlsInArray(response.data, imageFields);
      } else if (typeof response.data === 'object') {
        // Fix image URLs in single object
        response.data = fixImageUrls(response.data, imageFields);

        // Handle nested arrays (like courses, teachers, etc.)
        Object.keys(response.data).forEach(key => {
          if (Array.isArray(response.data[key])) {
            response.data[key] = fixImageUrlsInArray(response.data[key], imageFields);
          } else if (response.data[key] && typeof response.data[key] === 'object') {
            response.data[key] = fixImageUrls(response.data[key], imageFields);
          }
        });
      }
    }

    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/me'), // Get user profile
};

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),
  banUser: (id) => api.post(`/admin/users/${id}/ban`),
  activateUser: (id) => api.post(`/admin/users/${id}/activate`),

  // Teachers
  getTeachers: (params) => api.get('/admin/teachers', { params }),
  getTeacherById: (id) => api.get(`/admin/teachers/${id}`),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),

  // Bookings
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getBookingTeachersWalletReport: () => api.get('/admin/bookings/teachers-wallet-report'),
  forceCancelBooking: (id) => api.post(`/admin/bookings/${id}/force-cancel`),
  forceConfirmBooking: (id) => api.post(`/admin/bookings/${id}/force-confirm`),
  exportBookings: (status) => api.get('/admin/bookings/export', { params: { status } }),
  toggleBookingFeatured: (id, isFeatured) => api.patch(`/admin/bookings/${id}/featured`, { isFeatured }),
  getFeaturedBookings: (params) => api.get('/admin/bookings/featured', { params }),

  // Course enrollments (admin — separate from session bookings)
  getCourseEnrollments: (params) => api.get('/admin/course-enrollments', { params }),
  getCourseEnrollmentById: (id) => api.get(`/admin/course-enrollments/${id}`),

  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPaymentById: (id) => api.get(`/admin/payments/${id}`),
  getPaymentStats: () => api.get('/admin/payments/stats'),

  // Reports
  getPrincipalReport: (params) => api.get('/admin/reports/principal', { params }),
  getTeacherReport: (params) => api.get('/admin/reports/teachers', { params }),
  getStudentReport: (params) => api.get('/admin/reports/students', { params }),
  getProfitReport: (params) => api.get('/admin/reports/profits', { params }),
  getDailyReport: (date) => api.get('/admin/reports/daily', { params: { date } }),
  getMonthlyReport: (year, month) => api.get('/admin/reports/monthly', { params: { year, month } }),
  getBookingTrends: (params) => api.get('/admin/reports/trends', { params }),
  getSessionReports: (params) => api.get('/admin/reports/sessions', { params }),
  getSessions: (params) => api.get('/admin/sessions', { params }),

  // Notifications
  sendGlobalNotification: (data) => api.post('/admin/notifications/global', data),
  sendNotificationToUsers: (data) => api.post('/admin/notifications/users', data),

  // Wallets
  getTeacherWallets: (params) => api.get('/admin/wallets', { params }),
  getTeacherWallet: (id) => api.get(`/admin/wallets/${id}`),
  sendMoneyToTeacher: (id, data) => api.post(`/admin/wallets/${id}/send-money`, data),
  ensureAllWallets: () => api.post('/admin/wallets/ensure-all'),
  syncPaymentsToWallets: () => api.post('/admin/wallets/sync-payments'),
  createWalletForTeacher: (teacherId) => api.post(`/admin/wallets/create/${teacherId}`),
  disableWallet: (id) => api.put(`/admin/wallets/${id}/disable`),
  enableWallet: (id) => api.put(`/admin/wallets/${id}/enable`),

  // Student Wallets
  getStudentWallets: (params) => api.get('/admin/student-wallets', { params }),
  getStudentWallet: (studentId) => api.get(`/admin/student-wallets/${studentId}`),
  depositToStudentWallet: (data) => api.post('/admin/student-wallets/deposit', data),
  withdrawFromStudentWallet: (data) => api.post('/admin/student-wallets/withdraw', data),
  processStudentPayment: (data) => api.post('/admin/student-wallets/process-payment', data),
  getStudentWalletTransactions: (walletId, params) => api.get(`/admin/student-wallets/${walletId}/transactions`, { params }),
};

// Audit / Activity Logs API
export const auditAPI = {
  getLogs: (params) => api.get('/audit/logs', { params }),
};

// System settings API (public GET; PATCH requires super admin)
export const settingsAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.patch('/settings', data),
};

// Subscriptions API (aliases same backend as studentSubscriptionAPI — legacy path was /subscriptions/* which is not mounted)
export const subscriptionAPI = {
  getAllPackages: (activeOnly) => api.get('/student-subscriptions/packages', { params: { activeOnly } }),
  getPackageById: (id) => api.get(`/student-subscriptions/packages/${id}`),
  createPackage: (data) => api.post('/student-subscriptions/packages', data),
  updatePackage: (id, data) => api.put(`/student-subscriptions/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/student-subscriptions/packages/${id}`),
  getAllSubscriptions: (params) => api.get('/student-subscriptions/admin/all', { params }),
};

// Courses API
export const courseAPI = {
  getAllCourses: (params) => api.get('/courses', { params }),
  getCourseById: (id) => api.get(`/courses/${id}`),
  getFeaturedCourses: (params) => api.get('/courses/featured', { params }),
  /** جلب المشايخ المضافين لدورة محددة (معرف الدورة) */
  getCourseSheikhs: (courseId, params) => api.get(`/courses/${courseId}/sheikhs`, { params }),
  createCourse: (data) => api.post('/courses', data),
  createTeacherCourse: (data) => api.post('/courses/teacher/create', data), // For teachers to create their own courses
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  toggleFeatured: (id, isFeatured) => api.patch(`/courses/${id}/featured`, { isFeatured }),
};

// Enrollment API
export const enrollmentAPI = {
  enrollInCourse: (courseId, data) => api.post(`/v1/enrollments/${courseId}/enroll`, data),
  createCourseFawryReference: (courseId, data) =>
    api.post(`/v1/enrollments/${courseId}/fawry/reference-number`, data),
  getEnrollmentStatus: (courseId) => api.get(`/v1/enrollments/${courseId}/status`),
  getMyEnrolledCourses: (params) => api.get('/v1/enrollments/my-courses', { params }),
  getCourseProgress: (courseId) => api.get(`/v1/enrollments/${courseId}/progress`),
};

// Exams API
export const examAPI = {
  createExam: (data) => api.post('/exams', data),
  updateExam: (id, data) => api.put(`/exams/${id}`, data),
  addQuestion: (examId, data) => api.post(`/exams/${examId}/questions`, data),
  publishExam: (examId) => api.post(`/exams/${examId}/publish`),
  getExamById: (id) => api.get(`/exams/${id}`),
  submitExam: (examId, data) => api.post(`/exams/${examId}/submit`, data),
  getExamResults: (examId) => api.get(`/exams/${examId}/results`),
  gradeExam: (examId, submissionId) => api.put(`/exams/${examId}/submissions/${submissionId}/grade`),
  getStudentExams: () => api.get('/exams/student/my-exams'),
  getTeacherExams: () => api.get('/exams/teacher/my-exams'),
  deleteExam: (id) => api.delete(`/exams/${id}`),
};

// Content API
export const contentAPI = {
  getAllContent: (params) => api.get('/content', { params }),
  getPendingContent: (params) => api.get('/content/pending', { params }),
  getMyContent: (params) => api.get('/content/my-content', { params }),
  getContentById: (id) => api.get(`/content/${id}`),
  createContent: (data) => api.post('/content', data),
  approveContent: (id, data) => api.post(`/content/${id}/approve`, data),
  rejectContent: (id, data) => api.post(`/content/${id}/reject`, data),
  deleteContent: (id) => api.delete(`/content/${id}`),
};

// Site pages API (about, app, policy, privacy)
export const pagesAPI = {
  getAll: () => api.get('/pages'),
  getBySlug: (slug) => api.get(`/pages/${slug}`),
  getBySlugPublic: (slug) => api.get(`/pages/by-slug/${slug}`),
  update: (slug, data) => api.patch(`/pages/${slug}`, data),
};

// RBAC API
export const rbacAPI = {
  // Roles
  getAllRoles: () => api.get('/rbac/roles'),
  getRoleById: (id) => api.get(`/rbac/roles/${id}`),
  createRole: (data) => api.post('/rbac/roles', data),
  updateRole: (id, data) => api.put(`/rbac/roles/${id}`, data),
  deleteRole: (id) => api.delete(`/rbac/roles/${id}`),
  assignRole: (data) => api.post('/rbac/roles/assign', data),
  removeRole: (userId, roleId) => api.delete(`/rbac/users/${userId}/roles/${roleId}`),
  getUserRoles: (userId) => api.get(`/rbac/users/${userId}/roles`),
  getUserPermissions: (userId) => api.get(`/rbac/users/${userId}/permissions`),

  // Permissions
  getAllPermissions: () => api.get('/rbac/permissions'),
  createPermission: (data) => api.post('/rbac/permissions', data),
  updatePermission: (id, data) => api.put(`/rbac/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/rbac/permissions/${id}`),
  assignPermission: (data) => api.post('/rbac/permissions/assign', data),
  removePermission: (roleId, permissionId) => api.delete(`/rbac/roles/${roleId}/permissions/${permissionId}`),
};

// Certificates API
export const certificateAPI = {
  createCertificate: (data) => api.post('/certificates', data),
  getStudentCertificates: (studentId) => api.get(`/certificates/student/${studentId}`),
  getTeacherCertificates: () => api.get('/certificates/teacher/my-certificates'),
  revokeCertificate: (id, reason) => api.delete(`/certificates/${id}/revoke`, { data: { reason } }),
};

// Reviews API
export const reviewAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  getTeacherReviews: (teacherId) => api.get(`/reviews/teachers/${teacherId}`),
  createReview: (bookingId, data) => api.post(`/reviews/bookings/${bookingId}`, data),
  updateReview: (bookingId, data) => api.put(`/reviews/bookings/${bookingId}`, data),
  deleteReview: (bookingId) => api.delete(`/reviews/bookings/${bookingId}`),
  updateById: (id, data) => api.put(`/reviews/${id}`, data),
  deleteById: (id) => api.delete(`/reviews/${id}`),
  suspend: (id) => api.patch(`/reviews/${id}/suspend`),
  activate: (id) => api.patch(`/reviews/${id}/activate`),
};

// Sessions API (bookingSessionId = one slot of a booking)
export const sessionAPI = {
  listMySessions: (params) => api.get('/sessions', { params }),
  createSession: (bookingSessionId, data) => api.post(`/sessions/booking-sessions/${bookingSessionId}`, data),
  getSession: (bookingSessionId) => api.get(`/sessions/booking-sessions/${bookingSessionId}`),
  startSession: (bookingSessionId) => api.post(`/sessions/booking-sessions/${bookingSessionId}/start`),
  endSession: (bookingSessionId, data) => api.post(`/sessions/booking-sessions/${bookingSessionId}/end`, data),
  getSessionDetails: (sessionId) => api.get(`/sessions/${sessionId}/details`),
  saveMemorization: (sessionId, data) => api.post(`/sessions/${sessionId}/memorization`, data),
  getMemorizations: (sessionId) => api.get(`/sessions/${sessionId}/memorization`),
  saveRevision: (sessionId, data) => api.post(`/sessions/${sessionId}/revision`, data),
  getRevisions: (sessionId) => api.get(`/sessions/${sessionId}/revisions`),
  saveReport: (sessionId, data) => api.post(`/sessions/${sessionId}/report`, data),
  getReport: (sessionId) => api.get(`/sessions/${sessionId}/report`),
};

// Student Subscriptions API
export const studentSubscriptionAPI = {
  getAllPackages: (activeOnly) => api.get('/student-subscriptions/packages', { params: { activeOnly } }),
  getPackageById: (id) => api.get(`/student-subscriptions/packages/${id}`),
  createPackage: (data) => api.post('/student-subscriptions/packages', data),
  updatePackage: (id, data) => api.put(`/student-subscriptions/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/student-subscriptions/packages/${id}`),
  getAllSubscriptions: (params) => api.get('/student-subscriptions/admin/all', { params }),
  getMySubscriptions: () => api.get('/student-subscriptions/my-subscriptions'),
  getMyActive: () => api.get('/student-subscriptions/my-active'),
  subscribe: (data) => api.post('/student-subscriptions/subscribe', data),
  cancel: (id) => api.post(`/student-subscriptions/cancel/${id}`),
};

// Finance API
export const financeAPI = {
  getStatistics: () => api.get('/finance/statistics'),
  getPayouts: (params) => api.get('/finance/payouts', { params }),
  approvePayout: (id) => api.post(`/finance/payouts/${id}/approve`),
  rejectPayout: (id, reason) => api.post(`/finance/payouts/${id}/reject`, { reason }),
  completePayout: (id) => api.post(`/finance/payouts/${id}/complete`),
};

// Notification API (User notifications - inbox for logged-in user)
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params: params || {} }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  sendNotification: (data) => api.post('/notifications/send', data),
  broadcastNotification: (data) => api.post('/notifications/broadcast', data),
};

// Teacher API
export const teacherAPI = {
  getProfile: () => api.get('/teachers/profile/me'),
  getAvailability: (teacherId, startDate, endDate) => api.get(`/teachers/${teacherId}/availability`, { params: { startDate, endDate } }),
  getAllTeachers: (params) => api.get('/teachers', { params }),
  getTeacherById: (id) => api.get(`/teachers/${id}`),
  createTeacher: (data) => api.post('/teachers', data),
  updateTeacher: (id, data) => api.put(`/teachers/${id}`, data),
  createSchedule: (teacherId, data) => api.post(`/teachers/${teacherId}/schedules`, data),
  updateSchedule: (teacherId, scheduleId, data) => api.put(`/teachers/${teacherId}/schedules/${scheduleId}`, data),
  deleteSchedule: (teacherId, scheduleId) => api.delete(`/teachers/${teacherId}/schedules/${scheduleId}`),
  approveTeacher: (id) => api.post(`/teachers/${id}/approve`),
  rejectTeacher: (id) => api.delete(`/teachers/${id}/reject`),
};

// Booking API (User bookings)
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getMyBookings: (status) => api.get('/bookings/my-bookings', { params: { status } }),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  getBookingDetails: (id) => api.get(`/bookings/${id}/details`),
  getTeacherSubscriptionPackages: (teacherId) => api.get(`/bookings/teacher/${teacherId}/subscription-packages`),
  confirmBooking: (id) => api.post(`/bookings/${id}/confirm`),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel`),
  rejectBooking: (id) => api.post(`/bookings/${id}/reject`),
  updateBookingSession: (bookingId, bookingSessionId, data) =>
    api.patch(`/bookings/${bookingId}/sessions/${bookingSessionId}`, data),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (bookingId, data) => api.post(`/payments/bookings/${bookingId}/intent`, data),
  getPaymentByBooking: (bookingId) => api.get(`/payments/bookings/${bookingId}`),
  refundPayment: (bookingId, data) => api.post(`/payments/bookings/${bookingId}/refund`, data),
  // Fawry (Express Checkout Link)
  getFawryInfo: () => api.get('/payments/fawry'),
  createFawryCheckoutLink: (data) => api.post('/payments/fawry/checkout-link', data),
  createFawryReferenceNumber: (data) => api.post('/payments/fawry/reference-number', data),
  getFawryPaymentStatus: (merchantRefNum) => api.get(`/payments/fawry/status/${encodeURIComponent(merchantRefNum)}`),
};

// File Upload API - use post with FormData so multipart/form-data is sent with correct boundary (field name: "file")
export const fileUploadAPI = {
  uploadFile: (formData) => api.post('/files/upload', formData),
  uploadAvatar: (formData) => api.post('/files/upload/avatar', formData),
  uploadVideo: (formData, onUploadProgress) =>
    api.post('/files/upload/video', formData, {
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      ...(onUploadProgress ? { onUploadProgress } : {}),
    }),
  uploadImage: (formData) => api.post('/files/upload/image', formData),
};

// ── Chunked Upload API (large videos) ──────────────────────────────────────
const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB
const PARALLEL_CHUNKS = 3;
const MAX_RETRIES = 3;

async function uploadOneChunk(uploadId, chunkIndex, blob, retries = MAX_RETRIES) {
  const fd = new FormData();
  fd.append('uploadId', uploadId);
  fd.append('chunkIndex', String(chunkIndex));
  fd.append('file', blob, `chunk-${chunkIndex}`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await api.post('/upload/chunk', fd, {
        timeout: 60_000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      return res.data;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

/**
 * Upload a video file using chunked upload with parallel chunks, retry, resume, and progress.
 * @param {File} file
 * @param {(progress: {loaded: number, total: number}) => void} onProgress
 * @returns {Promise<{url: string, filename: string}>}
 */
export async function chunkedUploadVideo(file, onProgress) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

  // 1. Init session
  const { data: initData } = await api.post('/upload/init', {
    filename: file.name,
    totalChunks,
  });
  const { uploadId } = initData;

  // 2. Check which chunks already exist (resume support)
  let doneSet = new Set();
  try {
    const { data: statusData } = await api.get('/upload/status', { params: { uploadId } });
    if (statusData.uploadedChunks) {
      doneSet = new Set(statusData.uploadedChunks);
    }
  } catch (_) { /* fresh upload */ }

  // 3. Upload chunks in parallel batches with progress
  let completedBytes = 0;
  for (const idx of doneSet) {
    const start = idx * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    completedBytes += end - start;
  }

  const pending = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!doneSet.has(i)) pending.push(i);
  }

  const report = () => {
    if (onProgress) onProgress({ loaded: completedBytes, total: file.size });
  };
  report();

  // Process in batches of PARALLEL_CHUNKS
  for (let b = 0; b < pending.length; b += PARALLEL_CHUNKS) {
    const batch = pending.slice(b, b + PARALLEL_CHUNKS);
    await Promise.all(
      batch.map(async (idx) => {
        const start = idx * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const blob = file.slice(start, end);
        await uploadOneChunk(uploadId, idx, blob);
        completedBytes += end - start;
        report();
      })
    );
  }

  // 3b. Reconcile with server (handles rare failures / race recovery)
  const { data: statusAfter } = await api.get('/upload/status', { params: { uploadId } });
  const onServer = new Set(statusAfter.uploadedChunks || []);
  const stillMissing = [];
  for (let i = 0; i < totalChunks; i++) {
    if (!onServer.has(i)) stillMissing.push(i);
  }
  for (const idx of stillMissing) {
    const start = idx * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const blob = file.slice(start, end);
    await uploadOneChunk(uploadId, idx, blob);
    completedBytes += end - start;
    report();
  }

  // 4. Merge
  const { data: mergeData } = await api.post('/upload/merge', { uploadId });
  if (onProgress) onProgress({ loaded: file.size, total: file.size });

  return { url: mergeData.url, filename: mergeData.filename };
}

// Video API (bookingSessionId = one slot of a booking)
export const videoAPI = {
  createSession: (bookingSessionId) => api.post('/video/session/create', { bookingSessionId }),
  getSessionToken: (bookingSessionId) => api.get(`/video/session/token/${bookingSessionId}`),
  getTestToken: (channelName, uid) => api.get('/video/session/test-token', { params: { channelName, uid } }),
  endSession: (bookingSessionId) => api.post('/video/session/end', { bookingSessionId }),
  getSessionHistory: (bookingSessionId) => api.get('/video/session/history', { params: bookingSessionId ? { bookingSessionId } : {} }),
};
//Hero slider

export const heroAPI = {
  // GET /hero/slides - Get active slides (public)
  getActive: async () => {
    const response = await api.get('/hero/slides');
    return response.data;
  },
  
  // GET /hero/slides/all - Get all slides (admin)
  getAll: async () => {
    const response = await api.get('/hero/slides/all');
    return response.data;
  },
  
  // GET /hero/slides/:id - Get single slide by ID (admin)
  getById: async (id) => {
    const response = await api.get(`/hero/slides/${id}`);
    return response.data;
  },
  
  // POST /hero/slides - Create new slide with image (admin)
  create: async (formData) => {
    const response = await api.post('/hero/slides', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  // PATCH /hero/slides/:id - Update slide with image (admin)
  update: async (id, formData) => {
    const response = await api.patch(`/hero/slides/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  // DELETE /hero/slides/:id - Delete slide (admin)
  delete: async (id) => {
    const response = await api.delete(`/hero/slides/${id}`);
    return response.data;
  },
  
  // POST /hero/slides/reorder - Reorder slides (admin)
  reorder: async (slides) => {
    const response = await api.post('/hero/slides/reorder', { slides });
    return response.data;
  },
  
  // PATCH /hero/slides/:id/toggle - Toggle slide active status (admin)
  toggleActive: async (id, isActive) => {
    const response = await api.patch(`/hero/slides/${id}/toggle`, { isActive });
    return response.data;
  },
  
  // POST /hero/initialize - Initialize default slider (admin)
  initialize: async () => {
    const response = await api.post('/hero/initialize');
    return response.data;
  }
};
//  Subscription Packages API )
export const subscriptionPackagesAPI = {
  /**
   * Get all subscription packages
   * @param {boolean} activeOnly - Filter only active packages
   * @returns {Promise} List of packages
   */
  getAllPackages: (activeOnly = false) => 
    api.get('/subscription-packages/packages', { params: { activeOnly } }),

  /**
   * Get package by ID
   * @param {string} id - Package ID
   * @returns {Promise} Package details
   */
  getPackageById: (id) => 
    api.get(`/subscription-packages/packages/${id}`),

  /**
   * Create a new package (Admin only)
   * @param {Object} data - Package data
   * @returns {Promise} Created package
   */
  createPackage: (data) => 
    api.post('/subscription-packages/packages', data),

  /**
   * Update a package (Admin only)
   * @param {string} id - Package ID
   * @param {Object} data - Updated package data
   * @returns {Promise} Updated package
   */
  updatePackage: (id, data) => 
    api.put(`/subscription-packages/packages/${id}`, data),

  /**
   * Delete a package (Admin only)
   * @param {string} id - Package ID
   * @returns {Promise} Deletion result
   */
  deletePackage: (id) => 
    api.delete(`/subscription-packages/packages/${id}`),

  /**
   * Get all subscriptions (Admin only)
   * @param {Object} params - Query params (page, limit, status)
   * @returns {Promise} Paginated subscriptions
   */
  getAllSubscriptions: (params) => 
    api.get('/subscription-packages/admin/all', { params }),

  /**
   * Get current user's subscriptions
   * @returns {Promise} List of user's subscriptions
   */
  getMySubscriptions: () => 
    api.get('/subscription-packages/my-subscriptions'),

  /**
   * Get current user's active subscription
   * @returns {Promise} Active subscription or null
   */
  getMyActive: () => 
    api.get('/subscription-packages/my-active'),

  /**
   * Subscribe to a package
   * @param {Object} data - Subscription data { packageId, paymentId }
   * @returns {Promise} Created subscription
   */
  subscribe: (data) => 
    api.post('/subscription-packages/subscribe', data),

  /**
   * Cancel a subscription
   * @param {string} id - Subscription ID
   * @returns {Promise} Cancelled subscription
   */
  cancel: (id) => 
    api.post(`/subscription-packages/cancel/${id}`),
};
export default api;

