# Job Portal API Documentation

## Overview

This is a comprehensive REST API for a Job & Networking Portal with AI-powered features. The API provides endpoints for user authentication, profile management, job posting/searching, social networking features, and AI-powered recommendations.

## Base URL

```
http://localhost:5000/api
```

## Authentication

The API uses JWT (JSON Web Tokens) stored in httpOnly cookies for authentication. Most endpoints require authentication.

### Authentication Headers

No headers required - authentication is handled via httpOnly cookies automatically.

## Core Features

### 1. **Authentication System**

- JWT-based authentication with httpOnly cookies
- User registration and login
- Password hashing with bcrypt
- Account types: job_seeker, employer, both

### 2. **User Profile Management**

- Complete user profiles with skills, experience, preferences
- File upload for profile pictures
- Skills management and updates
- User search and networking

### 3. **Job Management**

- Job posting and management
- Advanced job search and filtering
- Job applications and tracking
- AI-powered job recommendations

### 4. **Social Feed**

- Post creation and sharing
- Like, comment, and share functionality
- Feed filtering and pagination
- AI-powered content analysis

### 5. **AI Features**

- Resume skill extraction
- Job recommendations
- User connection suggestions
- Content sentiment analysis

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`

Register a new user.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123",
  "accountType": "job_seeker"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "accountType": "job_seeker",
    "_id": "user_id"
  },
  "token": "jwt_token"
}
```

#### POST `/api/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "Password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "accountType": "job_seeker"
  }
}
```

#### GET `/api/auth/me`

Get current authenticated user.

**Response:**

```json
{
  "success": true,
  "user": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "accountType": "job_seeker"
  }
}
```

#### POST `/api/auth/logout`

Logout current user.

**Response:**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### User Management Endpoints

#### PUT `/api/users/profile`

Update user profile.

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Experienced software developer",
  "location": "New York, NY",
  "phone": "+1234567890"
}
```

#### PUT `/api/users/skills`

Update user skills.

**Request Body:**

```json
{
  "skills": [
    {
      "name": "JavaScript",
      "proficiency": "Advanced"
    },
    {
      "name": "React",
      "proficiency": "Intermediate"
    }
  ]
}
```

#### GET `/api/users/search`

Search users by name, skills, or location.

**Query Parameters:**

- `q`: Search query
- `skills`: Comma-separated skills
- `location`: Location filter
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

#### POST `/api/users/:id/connect`

Send connection request to another user.

#### GET `/api/users/connections`

Get user's connections.

### Job Management Endpoints

#### POST `/api/jobs`

Create a new job posting.

**Request Body:**

```json
{
  "title": "Frontend Developer",
  "description": "We are looking for a skilled frontend developer...",
  "company": {
    "name": "Tech Corp",
    "logo": "company_logo_url"
  },
  "location": "New York, NY",
  "jobType": "Full-time",
  "salaryRange": {
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "skills": ["JavaScript", "React", "TypeScript"],
  "experienceLevel": "Mid-level"
}
```

#### GET `/api/jobs`

Get all jobs with filtering and pagination.

**Query Parameters:**

- `search`: Search by title or description
- `skills`: Comma-separated skills
- `jobType`: Job type filter
- `location`: Location filter
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

#### GET `/api/jobs/:id`

Get job by ID.

#### POST `/api/jobs/:id/apply`

Apply to a job.

**Request Body:**

```json
{
  "coverLetter": "I am interested in this position...",
  "resume": "resume_file_id"
}
```

#### GET `/api/jobs/my/applications`

Get user's job applications.

#### GET `/api/jobs/my/posted`

Get jobs posted by the current user (employers only).

### Social Feed Endpoints

#### POST `/api/posts`

Create a new post.

**Request Body:**

```json
{
  "content": "Just completed an amazing project!",
  "category": "Career",
  "tags": ["#coding", "#success"],
  "media": ["media_url_1", "media_url_2"]
}
```

#### GET `/api/posts/feed`

Get social feed posts.

**Query Parameters:**

- `category`: Filter by category
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

#### POST `/api/posts/:id/like`

Like or unlike a post.

#### POST `/api/posts/:id/comments`

Add comment to a post.

**Request Body:**

```json
{
  "content": "Great post! Congratulations!"
}
```

#### POST `/api/posts/:id/share`

Share a post.

### AI Features Endpoints

#### POST `/api/ai/extract-skills-resume`

Extract skills from uploaded resume (PDF).

#### POST `/api/ai/extract-skills-text`

Extract skills from text.

**Request Body:**

```json
{
  "text": "I have 5 years of experience in JavaScript, React, and Node.js..."
}
```

#### GET `/api/ai/job-recommendations`

Get AI-powered job recommendations for the current user.

#### GET `/api/ai/user-recommendations`

Get AI-powered user connection recommendations.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

Common HTTP Status Codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

The API implements rate limiting:

- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses

## Security Features

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- Input validation with Joi
- CORS protection
- Helmet security headers
- Rate limiting
- Request size limits

## Environment Variables

Required environment variables:

```
MONGODB_URI=mongodb://localhost:27017/job-portal
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
GEMINI_API_KEY=your_gemini_api_key (optional)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=development
PORT=5000
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite covers:

- Authentication flow
- User profile management
- Job management
- Social feed functionality
- AI features
- Connection management
- Error handling

## Database Schema

### User Model

- Personal information (name, email, phone)
- Profile data (bio, location, experience)
- Skills array with proficiency levels
- Job preferences and settings
- Connection management
- Account type and verification status

### Job Model

- Job details (title, description, requirements)
- Company information
- Location and job type
- Salary range and benefits
- Skills and experience requirements
- Application tracking
- AI matching data

### Post Model

- Content and media
- Author and engagement metrics
- Categories and tags
- AI analysis results
- Visibility settings

## Performance

- MongoDB indexing for fast queries
- Pagination for large datasets
- Compression middleware
- Efficient file upload handling
- Caching strategies for AI responses

## Monitoring

- Request logging with Morgan
- Error tracking and reporting
- Performance monitoring
- Health check endpoint
- Graceful shutdown handling
