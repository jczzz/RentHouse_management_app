# RentHouse Management System

A modern rental property management system built with Next.js and Node.js, featuring user authentication, property management, and role-based access control.

### Live Demo
https://master.d1v7y1ucx8awkf.amplifyapp.com/

## Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- AWS Amplify (Authentication)
- AWS Cognito (User Management)

### Backend
- Node.js
- TypeScript
- Prisma (ORM)
- AWS Services

## Features

- User Authentication & Authorization
  - Login/Register functionality
  - Role-based access (Tenant/Manager)
  - Default test account available
- Property Management
  - Property listing
  - Property details
  - Search and filtering
- Responsive Design
- Modern UI Components

## Default Test Account

For quick testing, you can use the following credentials:
- Email: jczhang1618@gmail.com
- Password: Re123456!

## Local Development Setup

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- AWS Account (for Cognito setup)

### Environment Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd real-estate-pro
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Set up environment variables:
Create `.env` files in both client and server directories with the following variables:

Client (.env):
```
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your_pool_id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your_client_id
```

Server (.env):
```
DATABASE_URL=your_database_url
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

4. Start the development servers:

```bash
# Start frontend (from client directory)
npm run dev

# Start backend (from server directory)
npm run dev
```





## License

This project is licensed under the MIT License. 