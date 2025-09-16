# Full Stack Todo Application

A modern, full-stack Todo application built with Spring Boot (Java) backend and Next.js (React/TypeScript) frontend.


<img width="894" height="777" alt="To-Do App" src="https://github.com/user-attachments/assets/87aa7a0a-b295-4a90-8451-b3d39c5c4625" />


## Features

- ✅ Create, read, update (toggle completion), and delete tasks
- 📅 Automatic timestamping of tasks
- 🎨 Responsive and modern UI with dark/light mode support
- 🔌 RESTful API with proper error handling
- 🧠 In-memory database for easy setup
- 🔄 Real-time UI updates
- 📱 Mobile-friendly design

## Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.5**
- **Spring Data JPA**
- **H2 Database** (In-Memory)
- **Maven** (Build Tool)
- **Lombok** (Boilerplate Reduction)

### Frontend
- **Next.js 14**
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui Components**
- **Lucide React Icons**

## Project Structure

```
.
├── src/main/java/com/todo/        # Backend source code
│   ├── controller/                # REST endpoints
│   ├── model/                     # Data entities
│   ├── repository/                # Data access layer
│   ├── service/                   # Business logic
│   └── TodoApplication.java       # Main application class
├── frontend/                      # Frontend source code
│   ├── app/                       # Page components
│   ├── components/                # UI components
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utility functions
│   └── types/                     # TypeScript types
├── pom.xml                        # Maven configuration
└── API_DOCUMENTATION.md           # API endpoints documentation
```

## Prerequisites

- **Java 17** or higher
- **Node.js 18+** and **npm** or **yarn**
- **Maven 3.x**

## Getting Started

### Backend Setup

1. Navigate to the project root directory:
   ```bash
   cd /path/to/todo
   ```

2. Build and run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   
   Or on Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

3. The backend server will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
   Or if using yarn:
   ```bash
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
   Or with yarn:
   ```bash
   yarn dev
   ```

4. The frontend will be available at `http://localhost:3000`

## API Documentation

The backend exposes a RESTful API for task management. Full documentation is available in [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

### Base URL
```
http://localhost:8080/api
```

### Endpoints

| Method | Endpoint           | Description                  |
|--------|--------------------|------------------------------|
| GET    | `/api/tasks`       | Get all tasks                |
| POST   | `/api/tasks`       | Create a new task            |
| PATCH  | `/api/tasks/{id}/toggle` | Toggle task completion |
| DELETE | `/api/tasks/{id}`  | Delete a task                |
| GET    | `/api/tasks/stats` | Get task statistics          |

## Database

This application uses an H2 in-memory database for easy setup and development.

- **Type**: H2 In-Memory Database
- **Console**: Available at `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:tododb`
- **Username**: `sa`
- **Password**: (empty)

> Note: Data will be lost when the application restarts since it's an in-memory database.

## Development

### Backend Development

The backend follows a standard Spring Boot structure:
- Controllers handle HTTP requests
- Services contain business logic
- Repositories handle data access
- Entities represent data models

### Frontend Development

The frontend is built with Next.js:
- Pages are in the `app/` directory
- Components are in the `components/` directory
- Custom hooks are in the `hooks/` directory
- API calls are handled in `lib/api.ts`

## Building for Production

### Backend

To build the backend JAR file:
```bash
./mvnw clean package
```

To run the built JAR:
```bash
java -jar target/todo-0.0.1-SNAPSHOT.jar
```

### Frontend

To build the frontend for production:
```bash
cd frontend
npm run build
```

To start the production server:
```bash
npm start
```

## Deployment

### Backend Deployment

1. Build the application:
   ```bash
   ./mvnw clean package
   ```

2. Deploy the JAR file to your preferred hosting platform (Heroku, AWS, etc.)

### Frontend Deployment

The frontend can be deployed to any static hosting service like Vercel, Netlify, or GitHub Pages.

For Vercel deployment:
1. Push the code to a GitHub repository
2. Import the repository in Vercel
3. Set the root directory to `frontend`
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
