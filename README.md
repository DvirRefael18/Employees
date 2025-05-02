# Employee Management System

A full-stack application built with Express (TypeScript) backend and React (TypeScript) frontend.

## Project Structure

- `/server` - Express TypeScript backend
- `/client` - React TypeScript frontend

## Features

- Employee CRUD operations
- TypeScript integration for improved type safety
- RESTful API architecture
- Responsive frontend design

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

# Server: http://localhost:5123
# Client: http://localhost:3000
```

## API Endpoints

- `GET /api/employees` - Retrieve all employees
- `GET /api/employees/:id` - Retrieve a specific employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

## Technologies

### Backend
- Express.js
- TypeScript
- Node.js

### Frontend
- React
- TypeScript
- Modern CSS 