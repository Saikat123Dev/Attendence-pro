import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, RegisterRequest } from '../types';

// Use your actual server URL here
const API_BASE_URL = 'https://attendence-pro-qzxc.onrender.com/api';

// Storage keys
const ACCESS_TOKEN_KEY = '@attendance_access_token';
const REFRESH_TOKEN_KEY = '@attendance_refresh_token';

type CompleteProfileData = {
  role: 'TEACHER' | 'STUDENT';
  employeeId?: string;
  department?: string;
  rollNumber?: string;
  registrationNumber?: string;
  branch?: string;
  semester?: number;
};

class ApiService {
  private api: ReturnType<typeof axios.create>;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: { response?: { status: number; data?: { error?: string } }; config?: any }) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
          const errorCode = error.response?.data?.error;

          // Token expired - try to refresh
          if (errorCode === 'TOKEN_EXPIRED' && !this.isRefreshing) {
            this.isRefreshing = true;

            try {
              const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

              if (!refreshToken) {
                throw new Error('No refresh token');
              }

              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data as { accessToken: string; refreshToken: string };

              await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
              await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

              // Retry all queued requests
              this.refreshSubscribers.forEach((cb) => cb(accessToken));
              this.refreshSubscribers = [];

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            } catch (refreshError) {
              // Refresh failed - clear tokens and redirect to login
              await this.clearTokens();
              this.refreshSubscribers = [];
              throw refreshError;
            } finally {
              this.isRefreshing = false;
            }
          }

          // Queue requests while refreshing
          return new Promise((resolve) => {
            this.refreshSubscribers.push((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(this.api(originalRequest));
            });
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  async setTokens(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  async hasValidToken(): Promise<boolean> {
    const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    return !!token;
  }

  // ============ Auth Endpoints ============

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: Record<string, unknown>) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      await this.api.post('/auth/logout', { refreshToken });
    } finally {
      await this.clearTokens();
    }
  }

  async getMe() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async completeProfile(data: CompleteProfileData) {
    const response = await this.api.post('/auth/complete-profile', data);
    const { user, accessToken, refreshToken } = response as { user?: any; accessToken?: string; refreshToken?: string };
    if (accessToken && refreshToken) {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    return { user };
  }

  // ============ Attendance Endpoints ============

  async startSession(subjectId: string) {
    const response = await this.api.post('/attendance/start', { subjectId });
    return response.data;
  }

  async stopSession(sessionId: string) {
    const response = await this.api.post('/attendance/stop', { sessionId });
    return response.data;
  }

  async getSessionQR(sessionId: string) {
    const response = await this.api.get(`/attendance/session/${sessionId}/qr`);
    return response.data;
  }

  async getSession(sessionId: string) {
    const response = await this.api.get(`/attendance/session/${sessionId}`);
    return response.data;
  }

  async getActiveSessions() {
    const response = await this.api.get('/attendance/active');
    return response.data;
  }

  async getSessionHistory(params?: { subjectId?: string; page?: number; limit?: number }) {
    const response = await this.api.get('/attendance/history', { params });
    return response.data;
  }

  async getSessionDetails(sessionId: string) {
    const response = await this.api.get(`/attendance/session/${sessionId}/details`);
    return response.data;
  }

  async markAttendance(sessionId: string, qrData: string, deviceInfo?: string) {
    const response = await this.api.post('/attendance/mark', {
      sessionId,
      qrData,
      deviceInfo,
    });
    return response.data;
  }

  async getMyAttendance(params?: { subjectId?: string; startDate?: string; endDate?: string }) {
    const response = await this.api.get('/attendance/my', { params });
    return response.data;
  }

  async getMyStats(subjectId?: string) {
    const response = await this.api.get('/attendance/stats', { params: { subjectId } });
    return response.data;
  }

  // ============ Subject Endpoints ============

  async getMySubjects() {
    const response = await this.api.get('/subjects');
    return response.data;
  }

  // Get student's enrolled subjects (for STUDENT role)
  async getStudentSubjects() {
    const response = await this.api.get('/subjects/student');
    return response.data;
  }

  async getSubject(id: string) {
    const response = await this.api.get(`/subjects/${id}`);
    return response.data;
  }

  async createSubject(data: { name: string; code: string; branch: string; semester: number }) {
    const response = await this.api.post('/subjects', data);
    return response.data;
  }

  async updateSubject(id: string, data: { name: string; code: string; branch: string; semester: number }) {
    const response = await this.api.put(`/subjects/${id}`, data);
    return response.data;
  }

  async deleteSubject(id: string) {
    const response = await this.api.delete(`/subjects/${id}`);
    return response.data;
  }

  async enrollStudents(subjectId: string, studentIds: string[]) {
    const response = await this.api.post(`/subjects/${subjectId}/enroll`, { studentIds });
    return response.data;
  }

  async unenrollStudents(subjectId: string, studentIds: string[]) {
    const response = await this.api.post(`/subjects/${subjectId}/unenroll`, { studentIds });
    return response.data;
  }

  async getAvailableStudents(subjectId: string) {
    const response = await this.api.get(`/subjects/${subjectId}/available`);
    return response.data;
  }

  // ============ Student Endpoints (Teacher) ============

  async getStudents(params?: { subjectId?: string; branch?: string; semester?: number }) {
    const response = await this.api.get('/students', { params });
    return response.data;
  }

  async getStudent(id: string) {
    const response = await this.api.get(`/students/${id}`);
    return response.data;
  }

  async getStudentAttendance(id: string, params?: { subjectId?: string }) {
    const response = await this.api.get(`/students/${id}/attendance`, { params });
    return response.data;
  }

  async getStudentStats(id: string, subjectId?: string) {
    const response = await this.api.get(`/students/${id}/stats`, { params: { subjectId } });
    return response.data;
  }

  // ============ Analytics Endpoints (Teacher) ============

  async getAnalyticsOverview() {
    const response = await this.api.get('/analytics/overview');
    return response.data;
  }

  async getSubjectAnalytics(subjectId: string) {
    const response = await this.api.get(`/analytics/subject/${subjectId}`);
    return response.data;
  }

  async getAlerts(threshold?: number) {
    const response = await this.api.get('/analytics/alerts', { params: { threshold } });
    return response.data;
  }
}

export const apiService = new ApiService();
export { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
