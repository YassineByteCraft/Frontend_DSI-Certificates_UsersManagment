
# Frontend DSI-Certificates Users Management

## Overview
Frontend_DSI-Certificates Users Management is a React-based application for managing digital certificates and user accounts. It provides a modern, responsive interface integrated with a Spring Boot backend through RESTful APIs.

## Features

### Core Features
- **Certificate Management**
  - Create, read, update, and delete certificates
  - Advanced filtering and sorting capabilities
  - Certificate status tracking

- **User Management**
  - Role-based access control (RBAC)
  - User profile management 
  - Create, read, update, and delete user
  - Password reset
  - Session management

- **Security**
  - JWT-based authentication
  - Role-based UI rendering
  - Secure password handling

### Developer Features
- Modular component architecture
- Comprehensive error handling
- Toast notifications system

## Technical Stack

### Core Dependencies
- React v19.0.0
- React DOM v19.0.0
- React Router DOM v7.3.0
- Axios v1.8.2
- Tailwind CSS v3.4.17
- Prime React v10.9.5
- Material UI v6.4.7
- Formik v2.4.6
- Yup v1.6.1

### Development Tools
- Vite v6.3.1
- ESLint v9.22.0
- PostCSS v8.5.3
- Node.js (v16+)
- npm (v7+)

### UI Components
- @headlessui/react v2.2.2
- @material-tailwind/react v2.1.10
- @mui/material v6.4.7
- @radix-ui components

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm (v7 or later)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Frontend_DSI-cert-device-marches
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   Create a `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_APP_ENV=development
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Structure
```
src/ ├── assets/ # Static assets 
     ├── common/ # Shared utilities 
     ├── features/ # Feature modules 
     │ ├── auth/ # Authentication 
     │ ├── certificates/ 
     │ └── users/ 
     └── routes/ # Application routing
``` 

### State Management
- Authentication: AuthContext
- Forms: Formik + Yup
- API State: Custom hooks
- UI State: React useState/useReducer

```
