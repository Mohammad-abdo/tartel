import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import Login from './pages/Login';
const Dashboard = lazy(() => import('./pages/Dashboard'));
import Users from './pages/Users';
import Teachers from './pages/Teachers';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Wallets from './pages/Wallets';
import WalletDetail from './pages/WalletDetail';
import Subscriptions from './pages/Subscriptions';
import Courses from './pages/Courses';
import Content from './pages/Content';
import Notifications from './pages/Notifications';
import RBAC from './pages/RBAC';
import Reports from './pages/Reports';
import Reviews from './pages/Reviews';
import Sessions from './pages/Sessions';
import StudentSubscriptions from './pages/StudentSubscriptions';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
const ActivityPage = lazy(() => import('./pages/Activity'));
import Profile from './pages/Profile';
import UserDetail from './pages/UserDetail';
import TeacherDetail from './pages/TeacherDetail';
import BookingDetail from './pages/BookingDetail';
import SessionEdit from './pages/SessionEdit';
import PaymentDetail from './pages/PaymentDetail';
import FawryTestPage from './pages/FawryTestPage';
import SubscriptionCallback from './pages/SubscriptionCallback';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentPending from './pages/PaymentPending';
import AgoraTestHost from './pages/AgoraTestHost';
import AgoraTestJoin from './pages/AgoraTestJoin';
import Unauthorized from './pages/Unauthorized';
import CourseDetail from './pages/CourseDetail';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import AddTeacher from './pages/AddTeacher';
import EditTeacher from './pages/EditTeacher';
import AddCourse from './pages/AddCourse';
import EditCourse from './pages/EditCourse';
import ManageLessons from './pages/ManageLessons';
import './App.css';

function ThemedToastContainer() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  );
}
//newhdgfdjs
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      {/* صفحات مستقلة لحالات الدفع — بدون داشبورد */}
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/failed"
        element={
          <ProtectedRoute>
            <PaymentFailed />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/pending"
        element={
          <ProtectedRoute>
            <PaymentPending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={null}>
                <Dashboard />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Users />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/add"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddUser />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EditUser />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Teachers />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/add"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddTeacher />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EditTeacher />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TeacherDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Bookings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BookingDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions/:sessionId/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SessionEdit />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Payments />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PaymentDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fawry-test"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FawryTestPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallets"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Wallets />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallets/teacher/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WalletDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/wallets/student/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WalletDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Subscriptions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Courses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <CourseDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/add"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddCourse />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EditCourse />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/courses/:id/lessons"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ManageLessons />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/content"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Content />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/rbac"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <RBAC />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Sessions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Finance />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student-subscriptions"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <StudentSubscriptions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* إعادة توجيه المسار القديم لصفحات الدفع المستقلة (بدون داشبورد) */}
      <Route
        path="/student/subscriptions/callback"
        element={
          <ProtectedRoute>
            <SubscriptionCallback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reviews />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/certificates" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={null}>
                <ActivityPage />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agora-test-host"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AgoraTestHost />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agora-test-join"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AgoraTestJoin />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/unauthorized" element={<Unauthorized />} />
      {/* Standalone payment result pages — no auth/layout since users arrive from Fawry redirect */}
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/failed" element={<PaymentFailed />} />
      <Route path="/payment/pending" element={<PaymentPending />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <ThemeProvider>
          <CurrencyProvider>
            <AuthProvider>
              <AppRoutes />
              <ThemedToastContainer />
            </AuthProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;

//
//اتق  الله   fdsfdsf