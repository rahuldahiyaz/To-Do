# Todo Backend API Documentation (Refactored)

## Overview

## Base URL
```
http://localhost:8080/api
```

## Available Endpoints

### 1. Get All Tasks
```http
GET /api/tasks
```
**Description**: Retrieve all tasks ordered by creation date (newest first)
**Frontend Usage**: Used to display the task list

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "text": "Complete the todo backend",
    "completed": true,
    "createdAt": "2025-09-16T18:45:50.049738"
  }
]
```

### 2. Create New Task
```http
POST /api/tasks
Content-Type: application/json
```
**Description**: Create a new task
**Frontend Usage**: Used by the [addTask](file:///Users/rahuldahiya/Desktop/todo/frontend/app/page.tsx#L23-L23) function

**Request Body**:
```json
{
  "text": "Task description"
}
```
**Response**: `201 Created`
```json
{
  "id": 1,
  "text": "Task description",
  "completed": false,
  "createdAt": "2025-09-16T18:45:50.049738"
}
```

### 3. Toggle Task Completion
```http
PATCH /api/tasks/{id}/toggle
```
**Description**: Toggle the completion status of a task
**Frontend Usage**: Used by the [toggleTask](file:///Users/rahuldahiya/Desktop/todo/frontend/app/page.tsx#L35-L35) function when checkbox is clicked

**Response**: `200 OK` | `404 Not Found`
```json
{
  "id": 1,
  "text": "Task description",
  "completed": true,
  "createdAt": "2025-09-16T18:45:50.049738"
}
```

### 4. Delete Task
```http
DELETE /api/tasks/{id}
```
**Description**: Delete a task permanently
**Frontend Usage**: Used by the [deleteTask](file:///Users/rahuldahiya/Desktop/todo/frontend/app/page.tsx#L39-L39) function when trash button is clicked

**Response**: `204 No Content` | `404 Not Found`

### 5. Get Task Statistics
```http
GET /api/tasks/stats
```
**Description**: Get summary statistics about tasks
**Frontend Usage**: Used for calculating [completedCount](file:///Users/rahuldahiya/Desktop/todo/frontend/app/page.tsx#L47-L47) and [totalCount](file:///Users/rahuldahiya/Desktop/todo/frontend/app/page.tsx#L48-L48) display

**Response**: `200 OK`
```json
{
  "totalTasks": 2,
  "completedTasks": 1,
  "pendingTasks": 1
}
```

## CORS Configuration
The API is configured to allow requests from:
- `http://localhost:3000` (Next.js frontend)

## Database
- **Type**: H2 In-Memory Database
- **Console**: Available at `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:tododb`
- **Username**: `sa`
- **Password**: (empty)

## Error Handling
The API includes global exception handling for:
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected errors

## Example Usage

### Creating a Task
```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn Spring Boot"}'
```

### Toggling Task Completion
```bash
curl -X PATCH http://localhost:8080/api/tasks/1/toggle
```

### Getting All Tasks
```bash
curl -X GET http://localhost:8080/api/tasks
```

### Deleting a Task
```bash
curl -X DELETE http://localhost:8080/api/tasks/1
```

## Running the Backend

1. **Build and Run**:
   ```bash
   
   ```

2. **Alternative Build**:
   ```bash
   mvn clean package
   java -jar target/todo-0.0.1-SNAPSHOT.jar
   ```

The application will start on `http://localhost:8080`

## Project Structure
```
src/main/java/com/todo/
├── TodoApplication.java          # Main application class
├── config/
│   └── CorsConfig.java          # CORS configuration
├── controller/
│   └── TaskController.java      # 5 essential REST endpoints only
├── exception/
│   └── GlobalExceptionHandler.java  # Error handling
├── model/
│   └── Task.java               # Task entity
├── repository/
│   └── TaskRepository.java     # Minimal data access methods
└── service/
    └── TaskService.java        # Core business logic only
```

