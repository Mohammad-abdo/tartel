# Setup Instructions

## Step-by-Step Setup Guide

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables
Copy the example env file and set the API URL to the **new NestJS backend**:
```bash
cp .env.example .env
```
Edit `.env` if needed (default points to `http://localhost:8002/api`):
```env
VITE_API_URL=http://localhost:8002/api
```

### 3. Start Backend Server (NestJS – new backend)
Run the backend from the project root so the dashboard can connect to it:
```bash
cd backend
npm install
npm run start:dev
```
The API will be at `http://localhost:8002` with global prefix `/api` (e.g. `http://localhost:8002/api/auth/login`).

### 4. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

The admin dashboard will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Login Credentials

Use your admin credentials from the backend to log in. The login endpoint is:
- **POST** `/api/auth/login`
- Body: `{ "email": "admin@example.com", "password": "yourpassword" }`

## Features Implemented

✅ **Authentication**
- Login page with email/password
- JWT token management
- Protected routes
- Auto-logout on token expiration

✅ **Dashboard**
- Statistics cards (Users, Teachers, Bookings, Revenue)
- Recent activity feed
- Quick stats overview

✅ **User Management**
- View all users with pagination
- Filter by role and status
- Search functionality
- Ban/Activate users
- Edit user details

✅ **Teacher Management**
- View all teachers
- Filter by approval status
- View teacher details

✅ **Booking Management**
- View all bookings
- Filter by status
- Force confirm/cancel bookings
- View booking details

✅ **Payment Management**
- View all payments
- Payment statistics
- Filter by status
- View transaction details

✅ **Reports**
- Report selection interface
- Ready for report data integration

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable components
│   ├── context/          # React Context (Auth)
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── utils/           # Utility functions
```

## API Endpoints Used

All endpoints are prefixed with `/api`:

- `POST /auth/login` - User login
- `GET /admin/dashboard` - Dashboard statistics
- `GET /admin/users` - Get all users
- `GET /admin/teachers` - Get all teachers
- `GET /admin/bookings` - Get all bookings
- `GET /admin/payments` - Get all payments
- `GET /admin/payments/stats` - Payment statistics
- And many more...

See `src/services/api.js` for the complete list of available endpoints.

## Next Steps

1. Test the login functionality
2. Verify API connectivity
3. Customize the dashboard based on your needs
4. Add more features as required

## Troubleshooting

**Issue**: API calls failing
- Check if backend is running on port 3001
- Verify `.env` file has correct API URL
- Check browser console for CORS errors

**Issue**: Login not working
- Verify backend authentication endpoint
- Check token storage in browser localStorage
- Verify user has ADMIN role

**Issue**: Styling not working
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` content paths
- Restart dev server after config changes




