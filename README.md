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

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refreshToken` - Refresh JWT token
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/managers` - Get all managers

### Time Records

- `POST /api/time-records/clock-in` - Clock in
- `POST /api/time-records/clock-out` - Clock out
- `GET /api/time-records/status` - Check clock status
- `GET /api/time-records/user` - Get time records for current user
- `GET /api/time-records/employees` - Get time records for employees (manager only)
- `PUT /api/time-records/:id/approve` - Approve time record (manager only)
- `PUT /api/time-records/:id/reject` - Reject time record (manager only)

## Technologies

### Backend
- Express.js
- TypeScript
- Node.js
- Jest (testing)

### Frontend
- React
- TypeScript
- Material UI
- React Router
- Axios
- Modern CSS 