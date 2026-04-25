# Smart Attendance Management System

A production-ready mobile-first attendance system with dynamic QR codes, JWT authentication, and role-based access control.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   Express API   │────▶│    MongoDB      │
│  (React Native) │◀────│   (JWT Auth)    │◀────│   (Mongoose)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Features

### Security
- **JWT Authentication**: Access tokens (15min) + Refresh tokens (7 days)
- **Dynamic QR Codes**: Rotate every 2 seconds with HMAC-SHA256 signatures
- **Anti-Replay**: Token timestamps prevent replay attacks
- **RBAC**: Middleware-based route protection (TEACHER/STUDENT roles)
- **Password Hashing**: bcrypt with 12 rounds

### Anti-Cheat Measures
- QR tokens expire in 2 seconds (prevents screenshot sharing)
- HMAC signature prevents token forgery
- One attendance mark per student per session (unique compound index)
- Server-side validation of all attendance marks

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi

### Mobile
- **Framework**: React Native with Expo
- **Navigation**: expo-router
- **Camera**: expo-camera (QR scanning)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Start server
npm start
```

Server runs on `http://localhost:3000`

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Attendance
| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | /api/attendance/start | Start session | Teacher |
| POST | /api/attendance/stop | Stop session | Teacher |
| GET | /api/attendance/session/:id/qr | Get current QR | Teacher |
| POST | /api/attendance/mark | Mark attendance | Student |
| GET | /api/attendance/my | My attendance | Student |
| GET | /api/attendance/stats | My stats | Student |

### Analytics (Teacher)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/overview | Dashboard stats |
| GET | /api/analytics/subject/:id | Subject analytics |
| GET | /api/analytics/alerts | Low attendance alerts |

## Database Schema

### Collections
- **users**: Authentication (email, password, role)
- **students**: Student profiles (roll number, branch, semester)
- **teachers**: Teacher profiles (employee ID, department)
- **subjects**: Subject definitions
- **attendance_sessions**: Active/Stopped sessions with current QR token
- **attendance_records**: Individual attendance marks (unique: sessionId + studentId)
- **attendance_stats**: Precomputed stats per student-subject
- **refresh_tokens**: Token storage for revocation

## Security Flow

### QR Token Structure
```json
{
  "sessionId": "abc123",
  "timestamp": 1714050000000,
  "nonce": "a1b2c3d4",
  "signature": "HMAC-SHA256(sessionId:timestamp:nonce)"
}
```

### Validation Steps
1. Parse QR JSON data
2. Verify HMAC signature
3. Check session ID matches
4. Verify timestamp within 2.5s window
5. Check session is ACTIVE
6. Check student not already marked

## Project Structure

```
├── server/
│   ├── config/          # Environment config
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, errors
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── services/        # Business logic
│   ├── utils/           # Token generation
│   ├── app.js           # Express setup
│   └── server.js        # Entry point
│
├── mobile/
│   ├── app/             # Expo Router screens
│   ├── components/       # Reusable components
│   ├── context/         # Auth context
│   ├── hooks/           # Custom hooks
│   ├── services/       # API client
│   └── types/           # TypeScript types
│
└── SPEC.md              # Full specification
```

## RBAC Permissions

| Action | Teacher | Student |
|--------|---------|---------|
| Start/Stop Session | ✅ | ❌ |
| View All Students | ✅ | ❌ |
| View Analytics | ✅ | ❌ |
| Scan QR & Mark | ❌ | ✅ |
| View Own Attendance | ❌ | ✅ |

## Performance Optimizations

1. **Precomputed Stats**: Attendance % stored in `attendance_stats` collection
2. **Atomic Updates**: Stats updated during marking (no recalculation)
3. **Indexes**:
   - `users.email` - unique
   - `students.rollNumber` - unique
   - `attendance_records.sessionId_studentId` - unique compound
   - `attendance_stats.studentId_subjectId` - unique compound

## Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
QR_SECRET=your-qr-signing-secret
NODE_ENV=development
```

## License

ISC
