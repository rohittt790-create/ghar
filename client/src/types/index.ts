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
  structure?: {
    totalFloors: number;
    totalRooms: number;
    totalBedrooms: number;
    totalBathrooms: number;
    totalActiveResidents: number;
    occupiedBedrooms: number;
    vacantBedrooms: number;
    roomsUnderMaintenance: number;
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

export type FloorStatus = 'not_started' | 'in_progress' | 'completed';

export type RoomType =
  | 'bedroom'
  | 'master_bedroom'
  | 'living_room'
  | 'hall'
  | 'kitchen'
  | 'bathroom'
  | 'dining_room'
  | 'study_room'
  | 'store_room'
  | 'utility_room'
  | 'balcony'
  | 'pooja_room'
  | 'other';

export type RoomConstructionStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_repair';
export type RoomInteriorStatus = 'not_started' | 'in_progress' | 'completed';
export type RoomOccupancyStatus = 'occupied' | 'vacant' | 'under_maintenance';
export type TradeStatus = 'not_started' | 'in_progress' | 'completed' | 'not_applicable';

export interface RoomChecklist {
  electrical: TradeStatus;
  plumbing: TradeStatus;
  flooring: TradeStatus;
  painting: TradeStatus;
  doors: TradeStatus;
  windows: TradeStatus;
}

export interface RoomDefect {
  _id?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNotes?: string;
  photo?: string;
}

export interface FloorStats {
  roomsCount: number;
  bathroomsCount: number;
  bedroomsCount: number;
  balconiesCount: number;
  kitchensCount: number;
  livingHallsCount: number;
  otherSpacesCount: number;
  totalAreaSqFt: number;
}

export interface Floor {
  _id: string;
  property: string | Property;
  floorNumber: number;
  name: string;
  floorPlanImage?: string;
  floorPhotos: string[];
  status: FloorStatus;
  progressPercentage: number;
  notes?: string;
  stats?: FloorStats;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  _id: string;
  property: string | Property;
  floor: Floor | string;
  roomId: string;
  name: string;
  roomType: RoomType;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  areaSqFt: number;
  photos: string[];
  floorPlanLocation?: {
    x?: number;
    y?: number;
    label?: string;
  };
  constructionStatus: RoomConstructionStatus;
  interiorStatus: RoomInteriorStatus;
  checklist: RoomChecklist;
  occupancyStatus: RoomOccupancyStatus;
  defects: RoomDefect[];
  notes?: string;
  activeOccupants?: Array<{
    _id: string;
    name: string;
    relationship: string;
    profilePhoto?: string;
    phone?: string;
    moveInDate?: string;
  }>;
  occupantsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type ResidentRelationship =
  | 'owner'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'relative'
  | 'tenant'
  | 'other';

export type ResidentStatus = 'currently_living' | 'temporarily_away' | 'moved_out';

export interface ResidentAssignmentHistory {
  _id?: string;
  floor?: Floor | string;
  floorName?: string;
  room?: Room | string;
  roomName?: string;
  roomId?: string;
  assignedAt: string;
  vacatedAt?: string;
  reason?: string;
}

export interface Resident {
  _id: string;
  property: string | Property;
  name: string;
  profilePhoto?: string;
  relationship: ResidentRelationship;
  dob?: string;
  age?: number;
  phone?: string;
  email?: string;
  currentFloor?: Floor | string;
  currentRoom?: Room | string;
  moveInDate?: string;
  moveOutDate?: string;
  status: ResidentStatus;
  notes?: string;
  assignmentHistory: ResidentAssignmentHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface HouseStructureOverview {
  property: Property;
  floorsCount: number;
  roomsCount: number;
  bathroomsCount: number;
  bedroomsCount: number;
  balconiesCount: number;
  kitchensCount: number;
  livingRoomsCount: number;
  otherSpacesCount: number;
  totalAreaSqFt: number;
  activeResidentsCount: number;
  occupiedBedroomsCount: number;
  vacantBedroomsCount: number;
  roomsUnderMaintenanceCount: number;
  constructionProgressPercentage: number;
  floors: Floor[];
  rooms: Room[];
  residents: Resident[];
}
