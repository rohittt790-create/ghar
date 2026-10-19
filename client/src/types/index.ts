export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PhotoStage = 'before' | 'during' | 'after';

export type TaskCategory =
  | 'Foundation'
  | 'Framing'
  | 'Roofing'
  | 'Plumbing'
  | 'Electrical'
  | 'HVAC'
  | 'Drywall'
  | 'Painting'
  | 'Flooring'
  | 'Masonry'
  | 'Carpentry'
  | 'Landscaping'
  | 'Inspection'
  | 'Exterior'
  | 'Interior Finish'
  | 'Other';

export type PropertyStatus = 'planning' | 'in_progress' | 'completed' | 'on_hold';
export type PropertyType = 'residential' | 'commercial' | 'renovation' | 'villa' | 'duplex' | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'contractor' | 'owner';
  phone?: string;
  avatar?: string;
}

export interface Owner {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profilePicture?: string;
  notes?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  propertiesCount?: number;
  properties?: Array<{
    _id: string;
    propertyId: string;
    name: string;
    status: PropertyStatus;
    progressPercentage: number;
    coverPhoto?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Property {
  _id: string;
  propertyId: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  owner: Owner | string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  status: PropertyStatus;
  propertyPhotos: string[];
  coverPhoto?: string;
  estimatedBudget: number;
  actualExpenses: number;
  squareFeet?: number;
  propertyType: PropertyType;
  notes?: string;
  progressPercentage: number;
  totalTasks?: number;
  completedTasks?: number;
  inProgressTasks?: number;
  overdueTasks?: number;
  tasks?: Task[];
  stats?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    notStartedTasks: number;
    onHoldTasks: number;
    overdueTasks: number;
    categoryBreakdown: Array<{
      category: string;
      total: number;
      completed: number;
      progress: number;
      estimatedCost: number;
      actualCost: number;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProgressPhoto {
  _id?: string;
  url: string;
  caption?: string;
  stage: PhotoStage;
  uploadedAt: string;
}

export interface TaskHistory {
  _id?: string;
  action: string;
  changedBy: string;
  timestamp: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
}

export interface Task {
  _id: string;
  property: Property | string;
  taskName: string;
  description: string;
  category: TaskCategory;
  assignedWorker: string;
  workerPhone?: string;
  startDate: string;
  dueDate: string;
  completedDate?: string;
  priority: TaskPriority;
  estimatedCost: number;
  actualCost: number;
  notes: string;
  status: TaskStatus;
  progressPhotos: ProgressPhoto[];
  history: TaskHistory[];
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  property?: Property | { _id: string; name: string; propertyId: string; coverPhoto?: string };
  task?: Task | { _id: string; taskName: string; dueDate: string; priority: TaskPriority; status: TaskStatus };
  reminderDate: string; // YYYY-MM-DD
  reminderTime: string; // HH:mm
  type: 'deadline' | 'inspection' | 'task_due' | 'payment' | 'general';
  priority: TaskPriority;
  status: 'pending' | 'sent' | 'dismissed';
  channels: ('browser' | 'in_app' | 'email' | 'whatsapp')[];
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  counts: {
    totalOwners: number;
    totalProperties: number;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    notStartedTasks: number;
    onHoldTasks: number;
    overdueTasksCount: number;
  };
  overallProgress: number;
  financials: {
    totalBudget: number;
    totalSpent: number;
    variance: number;
  };
  upcomingDeadlines: Task[];
  overdueTasks: Task[];
  recentPhotos: Array<{
    url: string;
    caption?: string;
    stage: PhotoStage;
    uploadedAt: string;
    taskName: string;
    taskId: string;
    propertyName: string;
    propertyId: string;
  }>;
  recentActivities: Array<{
    action: string;
    changedBy: string;
    timestamp: string;
    notes?: string;
    taskName: string;
    taskId: string;
    propertyName: string;
  }>;
  properties: Property[];
}

export interface MonthlyReportData {
  reportMetadata: {
    year: number;
    month: number;
    monthName: string;
    startDate: string;
    endDate: string;
    generatedAt: string;
    propertyInfo?: Property;
    ownerInfo?: Owner;
    filterCategory: string;
  };
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    notStartedTasks: number;
    onHoldTasks: number;
    overdueTasks: number;
    progressPercentage: number;
    totalEstimatedCost: number;
    totalActualCost: number;
    costVariance: number;
    budgetHealth: string;
  };
  categoryBreakdown: Array<{
    category: string;
    total: number;
    completed: number;
    inProgress: number;
    estimatedCost: number;
    actualCost: number;
    variance: number;
    progress: number;
  }>;
  dailyActivityChart: Array<{
    day: string;
    dayNumber: number;
    completed: number;
    started: number;
  }>;
  photoRecords: Array<{
    taskId: string;
    taskName: string;
    propertyName: string;
    stage: PhotoStage;
    url: string;
    caption?: string;
    uploadedAt: string;
  }>;
  tasks: Task[];
}
