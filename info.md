# Todo Application: Frontend-Backend Interaction

mvn spring-boot:run

This document explains how the frontend (Next.js/React) interacts with the Spring Boot backend in the Todo application, covering the complete data flow and code explanations.

## Project Overview

The Todo application is a full-stack web application that allows users to manage tasks. It consists of:

1. **Frontend**: Next.js/React application that provides the user interface
2. **Backend**: Spring Boot REST API that handles data storage and business logic
3. **Database**: H2 in-memory database for storing tasks

## Architecture Overview

```
┌─────────────────┐         HTTP Requests         ┌──────────────────┐
│   Frontend      │ ────────────────────────────→ │     Backend      │
│  (Next.js/React)│ ◄──────────────────────────── │  (Spring Boot)   │
└─────────────────┘    JSON Responses             └──────────────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │   H2 Database    │
                      │ (In-Memory)      │
                      └──────────────────┘
```

## Data Flow Explanation

### 1. Frontend Initialization
When the Todo application loads:
1. The [useTasks](file:///Users/rahuldahiya/Desktop/todo/frontend/hooks/useTasks.ts#L12-L145) hook is initialized
2. [loadTasks](file:///Users/rahuldahiya/Desktop/todo/frontend/hooks/useTasks.ts#L22-L34) function is called via useEffect
3. This triggers an API call to `GET /api/tasks`

### 2. Backend Processing
When the backend receives a request:
1. The request is routed to the appropriate controller method based on URL and HTTP method
2. The controller calls the service layer for business logic
3. The service layer interacts with the repository for data access
4. Data is returned back through the layers as a response

### 3. Frontend Update
When the frontend receives a response:
1. Component state is updated with the new data
2. UI re-renders to reflect the changes

## Code Explanations

### Backend Code

#### 1. Main Application Class
```java
// src/main/java/com/todo/TodoApplication.java
package com.todo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TodoApplication {
    // Entry point of the Spring Boot application
    public static void main(String[] args) {
        SpringApplication.run(TodoApplication.class, args);
    }
}
```

#### 2. Task Model
```java
// src/main/java/com/todo/model/Task.java
package com.todo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data                    // Lombok annotation: generates getters, setters, toString, etc.
@NoArgsConstructor       // Lombok annotation: generates no-argument constructor
@AllArgsConstructor      // Lombok annotation: generates all-argument constructor
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;     // Unique identifier for each task

    @NotBlank(message = "Task text cannot be empty")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String text; // The task description

    @Column(nullable = false)
    private Boolean completed = false; // Completion status (default: false)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;   // Timestamp when task was created

    // Constructor for creating a new task with just text
    public Task(String text) {
        this.text = text;
        this.completed = false;
    }
}
```

#### 3. Task Repository
```java
// src/main/java/com/todo/repository/TaskRepository.java
package com.todo.repository;

import com.todo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // JpaRepository provides basic CRUD operations automatically
    // Custom method to get all tasks ordered by creation date (newest first)
    List<Task> findAllByOrderByCreatedAtDesc();
}
```

#### 4. Task Service
```java
// src/main/java/com/todo/service/TaskService.java
package com.todo.service;

import com.todo.model.Task;
import com.todo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service           // Marks this as a Spring service component
@RequiredArgsConstructor  // Lombok: generates constructor for final fields
@Transactional     // Ensures database operations are wrapped in transactions
public class TaskService {
    // Dependency injection of the repository
    private final TaskRepository taskRepository;

    /**
     * Get all tasks ordered by creation date (newest first)
     */
    public List<Task> getAllTasks() {
        return taskRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Create a new task
     */
    public Task createTask(String text) {
        // Validation: ensure text is not empty
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Task text cannot be empty");
        }
        // Create new task and save to database
        Task task = new Task(text.trim());
        return taskRepository.save(task);
    }

    /**
     * Toggle task completion status
     */
    public Task toggleTaskCompletion(Long id) {
        // Find task by ID or throw exception if not found
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        // Toggle the completion status
        task.setCompleted(!task.getCompleted());
        return taskRepository.save(task); // Save updated task
    }

    /**
     * Delete a task
     */
    public void deleteTask(Long id) {
        // Check if task exists
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        // Delete the task
        taskRepository.deleteById(id);
    }
}
```

#### 5. Task Controller
```java
// src/main/java/com/todo/controller/TaskController.java
package com.todo.controller;

import com.todo.model.Task;
import com.todo.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController           // Marks this as a REST controller
@RequestMapping("/api/tasks")  // Base URL for all endpoints in this controller
@RequiredArgsConstructor       // Lombok: constructor for final fields
public class TaskController {
    // Dependency injection of the service layer
    private final TaskService taskService;

    /**
     * Get all tasks
     * HTTP Method: GET
     * URL: /api/tasks
     */
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);  // Returns 200 OK with task list
    }

    /**
     * Create a new task
     * HTTP Method: POST
     * URL: /api/tasks
     */
    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody CreateTaskRequest request) {
        try {
            Task task = taskService.createTask(request.text());
            return ResponseEntity.status(HttpStatus.CREATED).body(task);  // Returns 201 Created
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();  // Returns 400 Bad Request
        }
    }

    /**
     * Toggle task completion status
     * HTTP Method: PATCH
     * URL: /api/tasks/{id}/toggle
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTaskCompletion(@PathVariable Long id) {
        try {
            Task task = taskService.toggleTaskCompletion(id);
            return ResponseEntity.ok(task);  // Returns 200 OK with updated task
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();  // Returns 404 Not Found
        }
    }

    /**
     * Delete a task
     * HTTP Method: DELETE
     * URL: /api/tasks/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ResponseEntity.noContent().build();  // Returns 204 No Content
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();   // Returns 404 Not Found
        }
    }

    // Request DTO (Data Transfer Object) for creating tasks
    public record CreateTaskRequest(String text) {}
}
```

#### 6. CORS Configuration
```java
// src/main/java/com/todo/config/CorsConfig.java
package com.todo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration  // Marks this as a Spring configuration class
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Configure CORS to allow frontend requests
        registry.addMapping("/api/**")  // Apply to all /api endpoints
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")  // Allow frontend origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // Allow HTTP methods
                .allowedHeaders("*")     // Allow all headers
                .allowCredentials(true)  // Allow credentials
                .maxAge(3600);           // Cache preflight requests for 1 hour
    }
}
```

#### 7. Exception Handler
```java
// src/main/java/com/todo/exception/GlobalExceptionHandler.java
package com.todo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice  // Global exception handler for REST controllers
public class GlobalExceptionHandler {

    // Handle RuntimeException (e.g., task not found)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),    // 404 status
                ex.getMessage(),                 // Error message
                LocalDateTime.now()              // Timestamp
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    // Handle IllegalArgumentException (e.g., invalid input)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(),  // 400 status
                ex.getMessage(),                 // Error message
                LocalDateTime.now()              // Timestamp
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handle validation exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        // Extract field-specific validation errors
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),  // 400 status
                "Validation failed",             // General message
                LocalDateTime.now(),             // Timestamp
                errors                           // Field-specific errors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    // Handle any other unexpected exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),  // 500 status
                "An unexpected error occurred",            // Generic message
                LocalDateTime.now()                        // Timestamp
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // Error response DTOs
    public record ErrorResponse(int status, String message, LocalDateTime timestamp) {}
    
    public record ValidationErrorResponse(
            int status, 
            String message, 
            LocalDateTime timestamp, 
            Map<String, String> errors
    ) {}
}
```

### Frontend Code

#### 1. API Service
```typescript
// frontend/lib/api.ts
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
```

#### 2. Custom Hook for Task Management
```typescript
// frontend/hooks/useTasks.ts
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
```

#### 3. Main Page Component
```typescript
// frontend/app/page.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Plus, CheckCircle2, AlertCircle, Wifi, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTasks } from "@/hooks/useTasks"
import { Task } from "@/types/task"
import { ErrorAlert, LoadingSpinner, LoadingState } from "@/components/ui/loading"

export default function TodoApp() {
  const [newTask, setNewTask] = useState("")
  const {
    tasks,
    loadingState,
    createTask,
    toggleTask,
    deleteTask,
    loadTasks,
    clearError,
  } = useTasks()

  const handleAddTask = async () => {
    if (newTask.trim() !== "") {
      const success = await createTask(newTask)
      if (success) {
        setNewTask("")
      }
    }
  }

  const handleToggleTask = async (id: number) => {
    await toggleTask(id)
  }

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loadingState.isCreating) {
      handleAddTask()
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const totalCount = tasks.length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 text-balance">{"My Tasks"}</h1>
          <p className="text-muted-foreground text-lg">{"Stay organized and productive"}</p>
          {totalCount > 0 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} tasks completed
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {loadingState.error && (
          <ErrorAlert
            error={loadingState.error}
            onRetry={loadTasks}
            onDismiss={clearError}
            className="mb-6"
          />
        )}

        {/* Add Task Section */}
        <Card className="mb-8 shadow-sm">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-base"
                disabled={loadingState.isCreating}
              />
              <Button 
                onClick={handleAddTask} 
                className="px-6" 
                disabled={!newTask.trim() || loadingState.isCreating}
              >
                {loadingState.isCreating ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {loadingState.isCreating ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <LoadingState
          isLoading={loadingState.isLoading}
          error={null} // We handle errors separately above
          loadingMessage="Loading your tasks..."
        >
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">{"No tasks yet"}</p>
                    <p className="text-sm">{"Add your first task above to get started!"}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => {
                const isToggling = loadingState.isToggling === task.id
                const isDeleting = loadingState.isDeleting === task.id
                
                return (
                  <Card
                    key={task.id}
                    className={cn(
                      "shadow-sm transition-all duration-200 hover:shadow-md", 
                      task.completed && "opacity-75",
                      (isToggling || isDeleting) && "opacity-50"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleToggleTask(task.id)}
                            className="h-5 w-5 border-2 border-black data-[state=checked]:border-black" 
                            disabled={isToggling || isDeleting}
                          />
                          {isToggling && (
                            <LoadingSpinner size="sm" className="absolute inset-0" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "flex-1 text-base leading-relaxed",
                            task.completed && "line-through text-muted-foreground",
                          )}
                        >
                          {task.text}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-muted-foreground hover:text-black"
                          disabled={isToggling || isDeleting}
                        >
                          {isDeleting ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </LoadingState>

        {/* Progress Summary */}
        {totalCount > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground">
              <span>
                {completedCount === totalCount
                  ? "🎉 All tasks completed!"
                  : `${totalCount - completedCount} tasks remaining`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

## Detailed Data Flow

### 1. Loading Tasks (GET Request)
```
Frontend:                        Backend:
---------                        --------
1. useTasks hook initializes
2. useEffect calls loadTasks()
3. taskApi.getAllTasks() 
   makes HTTP GET request to 
   http://localhost:8080/api/tasks
                                      4. Request received at 
                                         TaskController.getAllTasks()
                                      5. Calls taskService.getAllTasks()
                                      6. Service calls 
                                         taskRepository.findAllByOrderByCreatedAtDesc()
                                      7. Database query executed
                                      8. Results returned to service
                                      9. Service returns to controller
                                      10. Controller sends JSON response
11. Frontend receives response
12. setTasks() updates state
13. Component re-renders with tasks
```

### 2. Creating a Task (POST Request)
```
Frontend:                        Backend:
---------                        --------
1. User types task and clicks "Add"
2. handleAddTask() called
3. createTask() in useTasks hook
4. taskApi.createTask() makes 
   HTTP POST request to 
   http://localhost:8080/api/tasks
                                      5. Request received at 
                                         TaskController.createTask()
                                      6. Calls taskService.createTask()
                                      7. Service validates and creates task
                                      8. Service saves to database
                                      9. Returns new task object
                                      10. Controller sends JSON response
11. Frontend receives response
12. New task added to state
13. Component re-renders with new task
```

### 3. Toggling Task Completion (PATCH Request)
```
Frontend:                        Backend:
---------                        --------
1. User clicks checkbox
2. handleToggleTask() called
3. toggleTask() in useTasks hook
4. taskApi.toggleTask() makes 
   HTTP PATCH request to 
   http://localhost:8080/api/tasks/{id}/toggle
                                      5. Request received at 
                                         TaskController.toggleTaskCompletion()
                                      6. Calls taskService.toggleTaskCompletion()
                                      7. Service finds task by ID
                                      8. Toggles completion status
                                      9. Saves updated task
                                      10. Returns updated task object
                                      11. Controller sends JSON response
12. Frontend receives response
13. Task updated in state
14. Component re-renders with updated task
```

### 4. Deleting a Task (DELETE Request)
```
Frontend:                        Backend:
---------                        --------
1. User clicks trash icon
2. handleDeleteTask() called
3. deleteTask() in useTasks hook
4. taskApi.deleteTask() makes 
   HTTP DELETE request to 
   http://localhost:8080/api/tasks/{id}
                                      5. Request received at 
                                         TaskController.deleteTask()
                                      6. Calls taskService.deleteTask()
                                      7. Service finds and deletes task
                                      8. Returns 204 No Content
                                      9. Controller sends response
10. Frontend receives response
11. Task removed from state
12. Component re-renders without deleted task
```

## Key Technologies Used

### Backend (Spring Boot)
- **Spring Boot**: Framework for building Java applications
- **Spring Web**: For creating RESTful web services
- **Spring Data JPA**: For database operations
- **H2 Database**: In-memory database for development
- **Lombok**: Reduces boilerplate code
- **Jakarta Validation**: For input validation

### Frontend (Next.js/React)
- **Next.js**: React framework for production apps
- **TypeScript**: Typed JavaScript for better code quality
- **React Hooks**: For state management and side effects
- **Fetch API**: For making HTTP requests
- **Tailwind CSS**: For styling

## Configuration Files

### Application Properties
```properties
# src/main/resources/application.properties
# Application Configuration
spring.application.name=todo
server.port=8080

# H2 Database Configuration
spring.datasource.url=jdbc:h2:mem:tododb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# H2 Console (for development)
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=false

# Logging Configuration
logging.level.com.todo=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Maven Dependencies (pom.xml)
```xml
<!-- Key dependencies -->
<dependencies>
  <!-- Spring Boot Web for REST APIs -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  
  <!-- Spring Data JPA for database operations -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  
  <!-- H2 Database for development -->
  <dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
  </dependency>
  
  <!-- Validation for request validation -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
  </dependency>

  <!-- Lombok for reducing boilerplate code -->
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
</dependencies>
```

## Running the Application

### Backend
```bash
# Run the Spring Boot application
mvn spring-boot:run
# or
mvn clean package
java -jar target/todo-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

## Conclusion

This Todo application demonstrates a clean separation of concerns between frontend and backend, with the frontend handling presentation logic and the backend managing data persistence and business logic. The RESTful API design allows for easy communication between the two layers, and the use of modern frameworks (Spring Boot and Next.js) ensures a robust and maintainable codebase.