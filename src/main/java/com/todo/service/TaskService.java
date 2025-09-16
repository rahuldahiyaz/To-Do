package com.todo.service;

import com.todo.model.Task;
import com.todo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

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
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Task text cannot be empty");
        }
        Task task = new Task(text.trim());
        return taskRepository.save(task);
    }

    /**
     * Toggle task completion status
     */
    public Task toggleTaskCompletion(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
        
        task.setCompleted(!task.getCompleted());
        return taskRepository.save(task);
    }

    /**
     * Delete a task
     */
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new RuntimeException("Task not found with id: " + id);
        }
        taskRepository.deleteById(id);
    }

}