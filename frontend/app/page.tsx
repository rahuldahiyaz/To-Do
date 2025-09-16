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
