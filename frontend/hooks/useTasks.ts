import { useState, useEffect, useCallback } from 'react'
import { Task, TaskStats, CreateTaskRequest, TaskLoadingState } from '@/types/task'
import { taskApi, ApiError } from '@/lib/api'

// Custom hook for managing tasks with API integration
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loadingState, setLoadingState] = useState<TaskLoadingState>({
    isLoading: true,
    error: null,
    isCreating: false,
    isToggling: null,
    isDeleting: null,
  })

  // Load all tasks from backend
  const loadTasks = useCallback(async () => {
    try {
      setLoadingState(prev => ({ ...prev, isLoading: true, error: null }))
      const fetchedTasks = await taskApi.getAllTasks()
      setTasks(fetchedTasks)
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load tasks'
      setLoadingState(prev => ({ ...prev, error: errorMessage }))
    } finally {
      setLoadingState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Create a new task
  const createTask = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) return false

    try {
      setLoadingState(prev => ({ ...prev, isCreating: true, error: null }))
      const request: CreateTaskRequest = { text: text.trim() }
      const newTask = await taskApi.createTask(request)
      
      // Add new task to the beginning of the list (matches backend ordering)
      setTasks(prev => [newTask, ...prev])
      return true
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to create task'
      setLoadingState(prev => ({ ...prev, error: errorMessage }))
      return false
    } finally {
      setLoadingState(prev => ({ ...prev, isCreating: false }))
    }
  }, [])

  // Toggle task completion status
  const toggleTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoadingState(prev => ({ ...prev, isToggling: id, error: null }))
      const updatedTask = await taskApi.toggleTask(id)
      
      // Update the specific task in the list
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))
      return true
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to update task'
      setLoadingState(prev => ({ ...prev, error: errorMessage }))
      return false
    } finally {
      setLoadingState(prev => ({ ...prev, isToggling: null }))
    }
  }, [])

  // Delete a task
  const deleteTask = useCallback(async (id: number): Promise<boolean> => {
    try {
      setLoadingState(prev => ({ ...prev, isDeleting: id, error: null }))
      await taskApi.deleteTask(id)
      
      // Remove task from the list
      setTasks(prev => prev.filter(task => task.id !== id))
      return true
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to delete task'
      setLoadingState(prev => ({ ...prev, error: errorMessage }))
      return false
    } finally {
      setLoadingState(prev => ({ ...prev, isDeleting: null }))
    }
  }, [])

  // Clear error state
  const clearError = useCallback(() => {
    setLoadingState(prev => ({ ...prev, error: null }))
  }, [])

  // Load tasks on component mount
  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  return {
    tasks,
    loadingState,
    createTask,
    toggleTask,
    deleteTask,
    loadTasks,
    clearError,
  }
}

// Custom hook for task statistics
export function useTaskStats() {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const taskStats = await taskApi.getTaskStats()
      setStats(taskStats)
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load statistics'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    stats,
    isLoading,
    error,
    loadStats,
  }
}