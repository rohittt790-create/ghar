import axios from 'axios';
import {
  User,
  Owner,
  Property,
  Task,
  Reminder,
  DashboardSummary,
  MonthlyReportData,
  TaskStatus,
  Floor,
  Room,
  Resident,
  HouseStructureOverview,
} from '../types/index.js';

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
});

// Interceptor to add Authorization header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hometrack_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle unauthenticated 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, could clear token
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<{ success: boolean; token: string; user: User }>(
      '/auth/login',
      credentials
    );
    return res.data;
  },
  register: async (userData: any) => {
    const res = await api.post<{ success: boolean; token: string; user: User }>(
      '/auth/register',
      userData
    );
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  },
  getTeam: async () => {
    const res = await api.get<{ success: boolean; users: User[] }>('/auth/team');
    return res.data;
  },
};

export const ownersApi = {
  getAll: async (params?: { search?: string; city?: string }) => {
    const res = await api.get<{ success: boolean; owners: Owner[] }>('/owners', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; owner: Owner & { averageProgress: number } }>(
      `/owners/${id}`
    );
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; owner: Owner }>('/owners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await api.put<{ success: boolean; owner: Owner }>(`/owners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/owners/${id}`);
    return res.data;
  },
};

export const propertiesApi = {
  getAll: async (params?: { search?: string; owner?: string; status?: string; propertyType?: string }) => {
    const res = await api.get<{ success: boolean; properties: Property[] }>('/properties', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; property: Property }>(`/properties/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; property: Property }>('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await api.put<{ success: boolean; property: Property }>(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/properties/${id}`);
    return res.data;
  },
};

export const tasksApi = {
  getAll: async (params?: {
    property?: string;
    category?: string;
    status?: string;
    priority?: string;
    worker?: string;
    search?: string;
    overdueOnly?: boolean | string;
    startDate?: string;
    endDate?: string;
  }) => {
    const res = await api.get<{ success: boolean; count: number; tasks: Task[] }>('/tasks', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; task: Task }>(`/tasks/${id}`);
    return res.data;
  },
  create: async (formData: FormData) => {
    const res = await api.post<{ success: boolean; task: Task }>('/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData) => {
    const res = await api.put<{ success: boolean; task: Task }>(`/tasks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  updateStatus: async (id: string, data: { status: TaskStatus; actualCost?: number; notes?: string }) => {
    const res = await api.patch<{ success: boolean; task: Task }>(`/tasks/${id}/status`, data);
    return res.data;
  },
  uploadPhotos: async (id: string, formData: FormData) => {
    const res = await api.post<{ success: boolean; task: Task }>(`/tasks/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/tasks/${id}`);
    return res.data;
  },
};

export const remindersApi = {
  getAll: async (params?: { status?: string; property?: string; date?: string; priority?: string }) => {
    const res = await api.get<{ success: boolean; count: number; reminders: Reminder[] }>('/reminders', {
      params,
    });
    return res.data;
  },
  getActiveAlerts: async () => {
    const res = await api.get<{
      success: boolean;
      pendingReminders: Reminder[];
      overdueTasks: Task[];
      upcomingTasks: Task[];
      totalAlerts: number;
    }>('/reminders/alerts/active');
    return res.data;
  },
  create: async (data: any) => {
    const res = await api.post<{ success: boolean; reminder: Reminder }>('/reminders', data);
    return res.data;
  },
  updateStatus: async (id: string, status: 'pending' | 'sent' | 'dismissed') => {
    const res = await api.patch<{ success: boolean; reminder: Reminder }>(`/reminders/${id}/status`, {
      status,
    });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(`/reminders/${id}`);
    return res.data;
  },
};

export const reportsApi = {
  getMonthlyReport: async (params: {
    year: number;
    month: number;
    propertyId?: string;
    ownerId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const res = await api.get<MonthlyReportData>('/reports/monthly', { params });
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async (params?: { propertyId?: string; floorId?: string }) => {
    const res = await api.get<DashboardSummary>('/dashboard/summary', { params });
    return res.data;
  },
};

export const structureApi = {
  getOverview: async (propertyId: string) => {
    const res = await api.get<{ success: boolean; data: HouseStructureOverview }>(
      `/structure/properties/${propertyId}/overview`
    );
    return res.data;
  },
  getFloors: async (propertyId: string) => {
    const res = await api.get<{ success: boolean; count: number; floors: Floor[] }>(
      `/structure/properties/${propertyId}/floors`
    );
    return res.data;
  },
  createFloor: async (propertyId: string, data: any) => {
    const res = await api.post<{ success: boolean; floor: Floor }>(
      `/structure/properties/${propertyId}/floors`,
      data
    );
    return res.data;
  },
  updateFloor: async (floorId: string, data: any) => {
    const res = await api.put<{ success: boolean; floor: Floor }>(
      `/structure/floors/${floorId}`,
      data
    );
    return res.data;
  },
  deleteFloor: async (floorId: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/structure/floors/${floorId}`
    );
    return res.data;
  },
  getRooms: async (
    propertyId: string,
    params?: {
      floorId?: string;
      roomType?: string;
      constructionStatus?: string;
      occupancyStatus?: string;
      search?: string;
    }
  ) => {
    const res = await api.get<{ success: boolean; count: number; rooms: Room[] }>(
      `/structure/properties/${propertyId}/rooms`,
      { params }
    );
    return res.data;
  },
  createRoom: async (propertyId: string, data: any) => {
    const res = await api.post<{ success: boolean; room: Room }>(
      `/structure/properties/${propertyId}/rooms`,
      data
    );
    return res.data;
  },
  updateRoom: async (roomId: string, data: any) => {
    const res = await api.put<{ success: boolean; room: Room }>(
      `/structure/rooms/${roomId}`,
      data
    );
    return res.data;
  },
  deleteRoom: async (roomId: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/structure/rooms/${roomId}`
    );
    return res.data;
  },
  addDefect: async (roomId: string, data: { description: string; severity?: string; photo?: string }) => {
    const res = await api.post<{ success: boolean; room: Room }>(
      `/structure/rooms/${roomId}/defects`,
      data
    );
    return res.data;
  },
  resolveDefect: async (roomId: string, defectId: string, resolutionNotes?: string) => {
    const res = await api.put<{ success: boolean; room: Room }>(
      `/structure/rooms/${roomId}/defects/${defectId}/resolve`,
      { resolutionNotes }
    );
    return res.data;
  },
  getResidents: async (propertyId: string, params?: { status?: string; search?: string }) => {
    const res = await api.get<{ success: boolean; count: number; residents: Resident[] }>(
      `/structure/properties/${propertyId}/residents`,
      { params }
    );
    return res.data;
  },
  createResident: async (propertyId: string, data: any) => {
    const res = await api.post<{ success: boolean; resident: Resident }>(
      `/structure/properties/${propertyId}/residents`,
      data
    );
    return res.data;
  },
  updateResident: async (residentId: string, data: any) => {
    const res = await api.put<{ success: boolean; resident: Resident }>(
      `/structure/residents/${residentId}`,
      data
    );
    return res.data;
  },
  reassignResident: async (residentId: string, data: { floorId?: string; roomId?: string; reason?: string }) => {
    const res = await api.put<{ success: boolean; resident: Resident }>(
      `/structure/residents/${residentId}/reassign`,
      data
    );
    return res.data;
  },
  markResidentMoveOut: async (residentId: string, data: { moveOutDate?: string; notes?: string }) => {
    const res = await api.put<{ success: boolean; resident: Resident }>(
      `/structure/residents/${residentId}/move-out`,
      data
    );
    return res.data;
  },
  deleteResident: async (residentId: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/structure/residents/${residentId}`
    );
    return res.data;
  },
};

export default api;
