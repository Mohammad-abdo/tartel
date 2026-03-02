import axios from 'axios';
import { fixImageUrls, fixImageUrlsInArray } from '../utils/imageUtils';

// const API_BASE_URL = 'http://localhost:3001/api';
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
      const imageFields = ['image', 'avatar', 'photo', 'thumbnail', 'introVideoThumbnail', 'introVideoUrl', 'videoUrl', 'thumbnailUrl'];

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

  // Payments
  getPayments: (params) => api.get('/admin/payments', { params }),
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

// Subscriptions API
export const subscriptionAPI = {
  getAllPackages: (activeOnly) => api.get('/subscriptions/packages', { params: { activeOnly } }),
  getPackageById: (id) => api.get(`/subscriptions/packages/${id}`),
  createPackage: (data) => api.post('/subscriptions/packages', data),
  updatePackage: (id, data) => api.put(`/subscriptions/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/subscriptions/packages/${id}`),
  getAllSubscriptions: (params) => api.get('/subscriptions/admin/all', { params }),
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
  createReview: (bookingId, data) => api.post(`/reviews/bookings/${bookingId}`, data),
  getTeacherReviews: (teacherId) => api.get(`/reviews/teachers/${teacherId}`),
  updateReview: (bookingId, data) => api.put(`/reviews/bookings/${bookingId}`, data),
  deleteReview: (bookingId) => api.delete(`/reviews/bookings/${bookingId}`),
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

// Notification API (User notifications)
export const notificationAPI = {
  getNotifications: (unreadOnly) => api.get('/notifications', { params: { unreadOnly } }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
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
  uploadVideo: (formData) => api.post('/files/upload/video', formData),
  uploadImage: (formData) => api.post('/files/upload/image', formData),
};

// Video API (bookingSessionId = one slot of a booking)
export const videoAPI = {
  createSession: (bookingSessionId) => api.post('/video/session/create', { bookingSessionId }),
  getSessionToken: (bookingSessionId) => api.get(`/video/session/token/${bookingSessionId}`),
  getTestToken: (channelName, uid) => api.get('/video/session/test-token', { params: { channelName, uid } }),
  endSession: (bookingSessionId) => api.post('/video/session/end', { bookingSessionId }),
  getSessionHistory: (bookingSessionId) => api.get('/video/session/history', { params: bookingSessionId ? { bookingSessionId } : {} }),
};

export default api;

