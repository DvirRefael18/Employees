# Employee Management System

A full-stack application built with Express (TypeScript) backend and React (TypeScript) frontend.

## Project Structure

- `/server` - Express TypeScript backend
- `/client` - React TypeScript frontend

## Features

- Employee CRUD operations
- Time tracking with clock in/out functionality
- Manager approval workflow
- TypeScript integration for improved type safety
- RESTful API architecture

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm

### Installation

```bash
# Install dependencies for server and client
npm run install-all
```

### Running the Application

```bash
# Run both server and client concurrently
npm start

# Server: http://localhost:5100
# Client: http://localhost:3000
```

### Running Tests

```bash
# Run tests for the server
cd server
npm test
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `POST /api/auth/logout` - Logout a user
- `GET /api/auth/me` - Get current user data
- `POST /api/auth/refreshToken` - Refresh JWT token

### Employee Management

- `GET /api/employees/managers` - Get list of managers (public)
- `POST /api/employees/clock-in` - Clock in an employee
- `POST /api/employees/clock-out` - Clock out an employee
- `GET /api/employees/status` - Check clock status for current user
- `GET /api/employees/records` - Get time records for current user
- `GET /api/employees/team-records` - Get time records for manager's team
- `PUT /api/employees/records/:id/approve` - Approve a time record
- `PUT /api/employees/records/:id/reject` - Reject a time record

## Technologies Used

### Frontend
- React
- TypeScript
- Material-UI
- Axios

### Backend
- Node.js
- Express
- TypeScript
- JWT Authentication

## Project Structure

### Client
- `/src/api` - API client with axios instance
- `/src/components` - Reusable UI components
- `/src/pages` - Page components 
- `/src/routes` - React router setup
- `/src/types` - TypeScript type definitions

### Server
- `/src/controllers` - API endpoint handlers
- `/src/middleware` - Express middleware
- `/src/models` - Data models
- `/src/routes` - Express routes

### Notes

- The First employee that is going to be created as a manager will be another prototype manager.
- Thus, to login into admin: username - admin_prototype@employee.com, password - admin123