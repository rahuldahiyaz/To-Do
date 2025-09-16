// Task interface that matches the backend model
export interface Task {
  id: number
  text: string
  completed: boolean
  createdAt: string // ISO string format from backend
}

// Request interface for creating a new task
export interface CreateTaskRequest {
  text: string
}

// Task statistics from backend
export interface TaskStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}

// API response wrapper for error handling
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Loading states for UI
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

// Extended loading state for specific operations
export interface TaskLoadingState extends LoadingState {
  isCreating: boolean
  isToggling: number | null // ID of task being toggled
  isDeleting: number | null // ID of task being deleted
}