// User types
export type UserRole = 'TEACHER' | 'STUDENT';

export interface User {
  _id: string;
  email: string;
  name: string;
  role?: UserRole | null;
  isActive: boolean;
  createdAt: string;
  profile?: StudentProfile | TeacherProfile;
}

export interface StudentProfile {
  _id: string;
  userId: string;
  name: string;
  rollNumber: string;
  registrationNumber: string;
  branch: string;
  semester: number;
  subjects: Subject[];
}

export interface TeacherProfile {
  _id: string;
  userId: string;
  name: string;
  employeeId: string;
  department: string;
  subjects: Subject[];
}

// Subject
export interface Subject {
  _id: string;
  name: string;
  code: string;
  teacherId: string;
  branch: string;
  semester: number;
}

// Attendance
export interface AttendanceSession {
  _id: string;
  teacherId: string | TeacherProfile;
  subjectId: string | Subject;
  status: 'ACTIVE' | 'STOPPED';
  currentToken?: string;
  startedAt: string;
  stoppedAt?: string;
}

export interface AttendanceRecord {
  _id: string;
  sessionId: string | AttendanceSession;
  studentId: string | StudentProfile;
  subjectId: string | Subject;
  teacherId: string | TeacherProfile;
  status: 'PRESENT' | 'ABSENT';
  markedAt: string;
  createdAt?: string;
  deviceInfo?: string;
}

export interface AttendanceStats {
  _id: string;
  studentId: string | StudentProfile;
  subjectId: string | Subject;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  attendancePercentage: number;
  lastUpdated: string;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  // Teacher specific
  employeeId?: string;
  department?: string;
  // Student specific
  rollNumber?: string;
  registrationNumber?: string;
  branch?: string;
  semester?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// API Response types
export interface ApiError {
  error: string;
  message: string;
  details?: any;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Analytics
export interface AnalyticsOverview {
  totalSessions: number;
  todaySessions: number;
  totalStudents: number;
  todayAttendanceMarked: number;
}

export interface SubjectAnalytics {
  subject: Subject;
  totalSessions: number;
  totalStudents: number;
  averageAttendance: number;
  totalPresent: number;
  totalAbsent: number;
  byStudent: {
    studentId: string;
    name: string;
    rollNumber: string;
    percentage: number;
    totalSessions: number;
    present: number;
    absent: number;
  }[];
}
