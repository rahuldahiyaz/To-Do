import { Task, TaskStats, CreateTaskRequest } from '@/types/task'

const API_BASE_URL = 'http://localhost:8080/api'

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic API request function with error handling
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status,
        response.statusText
      )
    }

    // Handle empty responses (like DELETE requests)
    if (response.status === 204) {
      return null as T
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error: Unable to connect to server. Please check if the backend is running.',
        0,
        'Network Error'
      )
    }
    
    throw new ApiError(
      'An unexpected error occurred',
      500,
      'Internal Error'
    )
  }
}

// API service functions for all endpoints
export const taskApi = {
  // GET /api/tasks - Get all tasks
  getAllTasks: async (): Promise<Task[]> => {
    return apiRequest<Task[]>('/tasks')
  },

  // POST /api/tasks - Create a new task
  createTask: async (request: CreateTaskRequest): Promise<Task> => {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  // PATCH /api/tasks/{id}/toggle - Toggle task completion
  toggleTask: async (id: number): Promise<Task> => {
    return apiRequest<Task>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    })
  },

  // DELETE /api/tasks/{id} - Delete a task
  deleteTask: async (id: number): Promise<void> => {
    return apiRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    })
  },

  // GET /api/tasks/stats - Get task statistics
  getTaskStats: async (): Promise<TaskStats> => {
    return apiRequest<TaskStats>('/tasks/stats')
  },
}

export default taskApi