# Smart Attendance Management System - Technical Specification

## 1. System Overview

### Project Name
**Smart Attendance System (SAS)**

### Core Functionality
A mobile-first attendance management system using dynamic QR codes that rotate every 2 seconds, preventing proxy attendance and QR code reuse while providing real-time analytics for teachers.

### Target Users
- **Teachers**: Manage attendance sessions, view student analytics
- **Students**: Mark attendance via QR scan, view personal attendance history

---

## 2. Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: bcrypt (12 rounds)
- **Validation**: Joi

### Mobile (Frontend)
- **Framework**: React Native with Expo
- **Navigation**: expo-router
- **State Management**: React Context + useReducer
- **HTTP Client**: Axios
- **QR Scanner**: expo-camera

---

## 3. Architecture Design

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │────▶│   Express API   │────▶│    MongoDB      │
│  (React Native) │◀────│   (JWT Auth)    │◀────│   (Mongoose)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │              ┌─────────────────┐
        │              │  QR Token Gen   │
        │              │  (2-sec rotate) │
        │              └─────────────────┘
```

### Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│  1. User ──▶ POST /api/auth/login                               │
│  2. Server validates credentials                                 │
│  3. Server generates Access Token (15min) + Refresh Token (7d)  │
│  4. Client stores tokens securely                                 │
│  5. Client uses Access Token in Authorization header             │
│  6. On 401 → use Refresh Token to get new Access Token          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ATTENDANCE MARKING FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│  1. Teacher starts session ──▶ POST /api/attendance/start       │
│  2. Server creates session + generates QR token (2s expiry)     │
│  3. Teacher displays QR with embedded token                      │
│  4. Student scans QR ──▶ POST /api/attendance/mark              │
│  5. Server validates:                                             │
│     a. Token signature (HMAC-SHA256)                            │
│     b. Token expiry (not expired)                               │
│     c. Session active                                            │
│     d. Student not already marked                                │
│  6. Server records attendance + updates stats                    │
│  7. Teacher stops session ──▶ POST /api/attendance/stop        │
└─────────────────────────────────────────────────────────────────┘
```

### Clean Architecture Layers

```
server/
├── config/          # Environment, database config
├── controllers/     # Request handlers (thin, delegate to services)
├── middleware/      # Auth, RBAC, validation, error handling
├── models/          # Mongoose schemas
├── routes/          # Express route definitions
├── services/        # Business logic
├── utils/           # Helpers (token generation, QR encoding)
└── app.js           # Express app setup
```

---

## 4. Database Schema Design

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  role: Enum['TEACHER', 'STUDENT'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Students Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  name: String (indexed),
  rollNumber: String (unique, indexed),
  registrationNumber: String (unique),
  branch: String,
  semester: Number,
  subjects: [ObjectId] (ref: Subject),
  createdAt: Date,
  updatedAt: Date
}
```

### Teachers Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  name: String,
  employeeId: String (unique),
  department: String,
  subjects: [ObjectId] (ref: Subject),
  createdAt: Date,
  updatedAt: Date
}
```

### Subjects Collection
```javascript
{
  _id: ObjectId,
  name: String,
  code: String (unique),
  teacherId: ObjectId (ref: Teacher),
  branch: String,
  semester: Number,
  createdAt: Date
}
```

### AttendanceSessions Collection
```javascript
{
  _id: ObjectId,
  teacherId: ObjectId (ref: Teacher, indexed),
  subjectId: ObjectId (ref: Subject, indexed),
  status: Enum['ACTIVE', 'STOPPED'],
  currentToken: String,          // Current valid QR token
  currentTokenExpiry: Date,       // When current token expires
  startedAt: Date,
  stoppedAt: Date,
  createdAt: Date
}
```

### AttendanceRecords Collection
```javascript
{
  _id: ObjectId,
  sessionId: ObjectId (ref: AttendanceSession, indexed),
  studentId: ObjectId (ref: Student, indexed),
  subjectId: ObjectId (ref: Subject),
  teacherId: ObjectId (ref: Teacher),
  status: Enum['PRESENT', 'ABSENT'],
  markedAt: Date,
  deviceInfo: String,           // For audit
  createdAt: Date
}

// Compound index for preventing duplicate attendance
{ sessionId: 1, studentId: 1 } - unique
```

### AttendanceStats Collection (Precomputed)
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: Student, indexed),
  subjectId: ObjectId (ref: Subject, indexed),
  totalSessions: Number,
  presentCount: Number,
  absentCount: Number,
  attendancePercentage: Number (computed),
  lastUpdated: Date
}

// Compound unique index
{ studentId: 1, subjectId: 1 } - unique
```

### RefreshTokens Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, indexed),
  token: String (unique),
  expiresAt: Date,
  createdAt: Date
}
```

---

## 5. Security Design

### Token-Based QR System

#### QR Token Structure
```javascript
{
  sessionId: String,
  timestamp: Number,        // Unix timestamp (ms)
  nonce: String,           // Random 8-char string
  signature: String         // HMAC-SHA256 of above
}
```

#### Token Generation (Teacher Side)
```javascript
// Every 2 seconds, generate new token
const token = {
  sessionId: session._id,
  timestamp: Date.now(),
  nonce: crypto.randomBytes(4).toString('hex'),
};
token.signature = HMAC_SHA256(
  `${token.sessionId}:${token.timestamp}:${token.nonce}`,
  process.env.QR_SECRET
);
const qrData = JSON.stringify(token);
```

#### Token Validation (Server Side)
```javascript
async function validateToken(qrData, sessionId) {
  const token = JSON.parse(qrData);

  // 1. Verify signature
  const expectedSig = HMAC_SHA256(
    `${token.sessionId}:${token.timestamp}:${token.nonce}`,
    process.env.QR_SECRET
  );
  if (token.signature !== expectedSig) {
    throw new Error('INVALID_SIGNATURE');
  }

  // 2. Check if token belongs to session
  if (token.sessionId !== sessionId) {
    throw new Error('SESSION_MISMATCH');
  }

  // 3. Check expiry (2 second window)
  const now = Date.now();
  if (now - token.timestamp > 2500) { // 2.5s grace period
    throw new Error('TOKEN_EXPIRED');
  }

  // 4. Check session is active
  const session = await AttendanceSession.findById(sessionId);
  if (session.status !== 'ACTIVE') {
    throw new Error('SESSION_INACTIVE');
  }

  return true;
}
```

### Anti-Replay Measures

1. **Short Token Lifespan**: 2-second window makes replay impractical
2. **Nonce**: Each token has unique nonce preventing rainbow table attacks
3. **HMAC Signature**: Server-side secret prevents client-side token forgery
4. **Session Binding**: Token explicitly bound to session ID
5. **Timestamp Validation**: Prevents using old tokens from same session

### Anti-Duplicate Attendance

```javascript
// Atomic upsert with unique compound index
await AttendanceRecord.findOneAndUpdate(
  { sessionId, studentId },
  { $set: { status: 'PRESENT', markedAt: new Date() } },
  { upsert: false } // Fail if already exists
);
```

---

## 6. Authentication Design

### JWT Token Structure

#### Access Token (15 minutes)
```javascript
{
  sub: userId,
  role: 'TEACHER' | 'STUDENT',
  type: 'ACCESS',
  iat: issuedAt,
  exp: expiresAt
}
```

#### Refresh Token (7 days)
```javascript
{
  sub: userId,
  type: 'REFRESH',
  jti: uniqueId,  // For revocation
  iat: issuedAt,
  exp: expiresAt
}
```

### Token Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login, get tokens |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Invalidate refresh token |
| GET | /api/auth/me | Get current user |

### Protected Route Middleware

```javascript
// Verify access token
async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'NO_TOKEN' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'INVALID_TOKEN' });
  }
}

// Check role
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }
    next();
  };
}
```

---

## 7. RBAC Implementation

### Role Permissions Matrix

| Action | TEACHER | STUDENT |
|--------|---------|---------|
| Start/Stop Attendance | ✅ | ❌ |
| View All Students | ✅ | ❌ |
| View Student Detail | ✅ | ❌ |
| View Analytics | ✅ | ❌ |
| Scan QR & Mark Attendance | ❌ | ✅ |
| View Own Attendance | ❌ | ✅ |
| View Own Stats | ❌ | ✅ |

### Route Protection Examples

```javascript
// Teacher-only routes
router.post('/attendance/start', authenticate, authorize('TEACHER'), controller.start);
router.post('/attendance/stop', authenticate, authorize('TEACHER'), controller.stop);
router.get('/students', authenticate, authorize('TEACHER'), controller.listStudents);
router.get('/analytics', authenticate, authorize('TEACHER'), controller.analytics);

// Student-only routes
router.post('/attendance/mark', authenticate, authorize('STUDENT'), controller.mark);
router.get('/attendance/me', authenticate, authorize('STUDENT'), controller.myAttendance);
```

---

## 8. API Endpoints

### Authentication

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | /api/auth/register | {email, password, role, name, ...} | {user, tokens} |
| POST | /api/auth/login | {email, password} | {user, accessToken, refreshToken} |
| POST | /api/auth/refresh | {refreshToken} | {accessToken} |
| POST | /api/auth/logout | {} | {message} |
| GET | /api/auth/me | - | {user} |

### Attendance (Teacher)

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | /api/attendance/start | {subjectId} | {session, qrToken} |
| POST | /api/attendance/stop | {sessionId} | {session} |
| GET | /api/attendance/session/:id | - | {session} |
| GET | /api/attendance/session/:id/qr | - | {qrData} (streaming) |

### Attendance (Student)

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | /api/attendance/mark | {sessionId, qrData} | {record} |
| GET | /api/attendance/my | ?subjectId=&date= | {records} |
| GET | /api/attendance/stats | ?subjectId= | {stats} |

### Students (Teacher)

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/students | ?subjectId=&semester= | {students} |
| GET | /api/students/:id | - | {student} |
| GET | /api/students/:id/attendance | ?subjectId= | {records} |

### Analytics (Teacher)

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/analytics/overview | - | {stats} |
| GET | /api/analytics/subject/:id | - | {stats} |
| GET | /api/analytics/student/:id | - | {stats} |

---

## 9. Performance Optimization

### Precomputed Statistics

Instead of counting records on every request, attendance stats are updated atomically during marking:

```javascript
async function markAttendance(sessionId, studentId, subjectId) {
  const session = await AttendanceSession.findById(sessionId);

  // 1. Create attendance record
  await AttendanceRecord.create({ sessionId, studentId, subjectId, ... });

  // 2. Atomic update of stats
  await AttendanceStats.findOneAndUpdate(
    { studentId, subjectId },
    {
      $inc: { presentCount: 1, totalSessions: 1 },
      $set: { lastUpdated: new Date() },
      // Recalculate percentage
      $set: { attendancePercentage: (presentCount + 1) / (totalSessions + 1) * 100 }
    },
    { upsert: true }
  );
}
```

### Indexing Strategy

```javascript
// Users - email is queried frequently
users.createIndex({ email: 1 }, { unique: true });

// Students - roll number lookups
students.createIndex({ rollNumber: 1 }, { unique: true });
students.createIndex({ userId: 1 }, { unique: true });
students.createIndex({ branch: 1, semester: 1 });

// Attendance - compound for uniqueness + queries
attendanceRecords.createIndex({ sessionId: 1, studentId: 1 }, { unique: true });
attendanceRecords.createIndex({ studentId: 1, createdAt: -1 });
attendanceRecords.createIndex({ subjectId: 1, createdAt: -1 });

// Stats - lookup by student + subject
attendanceStats.createIndex({ studentId: 1, subjectId: 1 }, { unique: true });
```

---

## 10. Folder Structure

### Backend (server/)

```
server/
├── config/
│   └── index.js              # Environment config, DB connection
├── controllers/
│   ├── authController.js     # Login, register, refresh, logout
│   ├── attendanceController.js # Start/stop/mark attendance
│   ├── studentController.js  # Student CRUD, details
│   └── analyticsController.js # Stats, overview
├── middleware/
│   ├── authenticate.js       # JWT verification
│   ├── authorize.js          # Role checking
│   ├── validate.js           # Request validation
│   └── errorHandler.js       # Global error handler
├── models/
│   ├── User.js
│   ├── Student.js
│   ├── Teacher.js
│   ├── Subject.js
│   ├── AttendanceSession.js
│   ├── AttendanceRecord.js
│   ├── AttendanceStats.js
│   └── RefreshToken.js
├── routes/
│   ├── index.js              # Route aggregator
│   ├── authRoutes.js
│   ├── attendanceRoutes.js
│   ├── studentRoutes.js
│   └── analyticsRoutes.js
├── services/
│   ├── authService.js        # Auth business logic
│   ├── attendanceService.js  # QR generation, validation
│   └── statsService.js       # Stats calculation
├── utils/
│   ├── tokenGenerator.js     # QR token creation
│   └── crypto.js             # HMAC, hashing helpers
├── app.js                    # Express app setup
└── server.js                 # Server entry point
```

### Frontend (mobile/)

```
mobile/
├── app/
│   ├── _layout.tsx           # Root layout with auth provider
│   ├── (auth)/               # Auth screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/               # Tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx         # Home/Dashboard
│   │   ├── scan.tsx          # QR Scanner
│   │   ├── attendance.tsx    # Attendance history
│   │   └── profile.tsx       # User profile
│   └── +html.tsx
├── components/
│   ├── auth/                 # Auth-related components
│   ├── attendance/           # Attendance components
│   └── ui/                   # Shared UI components
├── context/
│   ├── AuthContext.tsx        # Auth state management
│   └── AttendanceContext.tsx  # Attendance state
├── hooks/
│   ├── useAuth.ts
│   └── useAttendance.ts
├── services/
│   ├── api.ts                # Axios instance
│   ├── authService.ts
│   └── attendanceService.ts
├── types/
│   └── index.ts              # TypeScript interfaces
└── utils/
    └── helpers.ts
```

---

## 11. Error Handling

### Standard Error Response

```javascript
{
  error: 'ERROR_CODE',
  message: 'Human readable message',
  details: {} // Optional additional info
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Invalid request data |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| TOKEN_EXPIRED | 401 | Access token expired |
| INVALID_TOKEN | 401 | Malformed token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| DUPLICATE_ENTRY | 409 | Already exists |
| SESSION_INACTIVE | 400 | Attendance session not active |
| ALREADY_MARKED | 409 | Attendance already marked |
| TOKEN_EXPIRED | 400 | QR token expired |

---

## 12. Implementation Phases

### Phase 1: Backend Foundation
1. Project setup (Express + MongoDB connection)
2. User model + authentication
3. JWT middleware implementation
4. Basic auth routes (login, register, refresh)

### Phase 2: Core Attendance
1. Student/Teacher/Subject models
2. Attendance session model
3. QR token generation service
4. Start/stop attendance endpoints
5. Mark attendance endpoint

### Phase 3: Statistics & Analytics
1. Attendance stats model
2. Precomputation during marking
3. Teacher analytics endpoints
4. Student stats endpoints

### Phase 4: Mobile Integration
1. Auth screens (login, register)
2. Token management (Context + storage)
3. Teacher dashboard
4. QR Scanner screen
5. Attendance history screen
6. Profile screen

---

## 13. Security Checklist

- [x] Password hashing with bcrypt (12 rounds)
- [x] JWT with short-lived access tokens (15 min)
- [x] Refresh tokens with expiration (7 days)
- [x] Refresh token stored in DB for revocation
- [x] HMAC-SHA256 signed QR tokens
- [x] 2-second QR token rotation
- [x] Compound unique index prevents duplicate attendance
- [x] Role-based middleware on all routes
- [x] Input validation with Joi
- [x] Rate limiting on auth endpoints
- [x] No sensitive data in tokens (password, etc.)
