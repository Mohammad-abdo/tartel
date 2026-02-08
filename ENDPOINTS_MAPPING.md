# Backend Endpoints to Frontend Pages Mapping

## Complete Endpoint Coverage

### ✅ Implemented Pages

| Backend Controller | Frontend Page | Status | Endpoints Covered |
|-------------------|---------------|--------|-------------------|
| `/admin` | Dashboard, Users, Teachers, Bookings, Payments, Wallets, Reports, Notifications | ✅ | All admin endpoints |
| `/auth` | Login | ✅ | Login, Profile |
| `/users` | Users (via admin) | ✅ | User management |
| `/teachers` | Teachers | ✅ | Teacher management |
| `/bookings` | Bookings | ✅ | Booking management |
| `/payments` | Payments | ✅ | Payment tracking |
| `/subscriptions` | Subscriptions | ✅ | Subscription packages |
| `/student-subscriptions` | Student Subscriptions | ✅ | Student packages |
| `/courses` | Courses | ✅ | Course management |
| `/exams` | Exams | ✅ | Exam management |
| `/content` | Content | ✅ | Content moderation |
| `/certificates` | Certificates | ✅ | Certificate management |
| `/reviews` | Reviews | ✅ | Review management |
| `/sessions` | Sessions | ✅ | Session management |
| `/finance` | Finance | ✅ | Payout management |
| `/rbac` | RBAC | ✅ | Roles & Permissions |
| `/reports` | Reports | ✅ | All report types |

## API Endpoints Summary

### Admin Endpoints (`/api/admin`)
- ✅ Dashboard stats
- ✅ Users CRUD + filters
- ✅ Teachers CRUD + filters
- ✅ Bookings CRUD + force actions
- ✅ Payments + stats
- ✅ Wallets (Teacher & Student)
- ✅ Reports (Principal, Teacher, Student, Profit, Daily, Monthly, Trends)
- ✅ Notifications (Global & User-specific)

### Subscription Endpoints
- ✅ `/api/subscriptions` - Teacher subscriptions
- ✅ `/api/student-subscriptions` - Student subscriptions

### Course & Exam Endpoints
- ✅ `/api/courses` - Course management
- ✅ `/api/exams` - Exam management

### Content & Media
- ✅ `/api/content` - Content moderation
- ✅ `/api/certificates` - Certificate management
- ✅ `/api/reviews` - Review management
- ✅ `/api/sessions` - Session management

### Finance
- ✅ `/api/finance` - Payouts & statistics

### RBAC
- ✅ `/api/rbac` - Roles & Permissions

## Data Fetching Verification

All pages are configured to:
1. ✅ Fetch data on component mount
2. ✅ Handle loading states
3. ✅ Handle errors gracefully
4. ✅ Support pagination where applicable
5. ✅ Support filtering/search
6. ✅ Update data after mutations

## Missing Features (Optional Enhancements)

These endpoints exist but don't need dedicated pages:
- `/api/video` - Video session management (handled in Sessions page)
- `/api/files` - File upload (can be added to forms as needed)
- `/api/notification` - User notifications (can be added to header)

## Notes

- All API calls use axios interceptors for authentication
- Token is automatically added to requests
- 401 errors redirect to login
- Error handling is consistent across all pages




