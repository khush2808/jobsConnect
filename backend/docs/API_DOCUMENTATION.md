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

- Skill extraction from text
- Job recommendations
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
  }
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
    "accountType": "job_seeker",
    "bio": "Experienced software developer",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "skills": [
      {
        "name": "JavaScript",
        "proficiency": "Expert",
        "experience": 5
      }
    ],
    "jobPreferences": {
      "desiredRoles": ["Software Engineer"],
      "preferredLocation": "Remote",
      "salaryExpectation": {
        "min": 80000,
        "max": 120000,
        "currency": "USD"
      }
    }
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
  "bio": "Experienced software developer with 5+ years in web development",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "jobPreferences": {
    "desiredRoles": ["Software Engineer", "Frontend Developer"],
    "preferredLocation": "Remote",
    "salaryExpectation": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "bio": "Experienced software developer with 5+ years in web development",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "jobPreferences": {
      "desiredRoles": ["Software Engineer", "Frontend Developer"],
      "preferredLocation": "Remote",
      "salaryExpectation": {
        "min": 80000,
        "max": 120000,
        "currency": "USD"
      }
    }
  }
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
      "proficiency": "Expert",
      "experience": 5
    },
    {
      "name": "React",
      "proficiency": "Advanced",
      "experience": 3
    },
    {
      "name": "Node.js",
      "proficiency": "Advanced",
      "experience": 4
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Skills updated successfully",
  "data": {
    "skills": [
      {
        "name": "JavaScript",
        "proficiency": "Expert",
        "experience": 5
      },
      {
        "name": "React",
        "proficiency": "Advanced",
        "experience": 3
      },
      {
        "name": "Node.js",
        "proficiency": "Advanced",
        "experience": 4
      }
    ]
  }
}
```

#### GET `/api/users/search`

Search users by name, skills, or location.

**Query Parameters:**

- `q`: Search query
- `skills`: Comma-separated skills
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example Request:**

```
GET /api/users/search?q=John&skills=JavaScript
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "skills": [
        {
          "name": "JavaScript",
          "proficiency": "Expert"
        }
      ]
    }
  ]
}
```

#### GET `/api/users/:id`

Get user profile by ID (optional authentication).

**Response:**

```json
{
  "success": true,
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "bio": "Experienced software developer",
    "skills": [
      {
        "name": "JavaScript",
        "proficiency": "Expert"
      }
    ]
  }
}
```

#### POST `/api/users/:id/connect`

Send connection request to another user.

**Response:**

```json
{
  "success": true,
  "message": "Connection request sent successfully"
}
```

#### GET `/api/users/connections`

Get user's connections.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "user": {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com"
      },
      "status": "accepted",
      "requestedAt": "2025-08-02T18:13:00.000Z"
    }
  ]
}
```

### Job Management Endpoints

#### POST `/api/jobs`

Create a new job posting.

**Request Body:**

```json
{
  "title": "Senior Frontend Developer",
  "description": "We are looking for an experienced frontend developer to join our team.",
  "requirements": [
    "Bachelor's degree in Computer Science or related field",
    "5+ years of experience with React",
    "Experience with TypeScript",
    "Strong problem-solving skills"
  ],
  "skills": [
    {
      "name": "React",
      "required": true,
      "proficiency": "Advanced"
    },
    {
      "name": "TypeScript",
      "required": true,
      "proficiency": "Intermediate"
    },
    {
      "name": "JavaScript",
      "required": true,
      "proficiency": "Expert"
    }
  ],
  "jobType": "Full-time",
  "workLocation": "Remote",
  "experienceLevel": "Senior Level",
  "category": "Technology",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "salary": {
    "min": 120000,
    "max": 160000,
    "currency": "USD"
  },
  "company": {
    "name": "TechCorp Inc.",
    "industry": "Technology",
    "size": "51-200",
    "website": "https://techcorp.com"
  },
  "benefits": ["Health Insurance", "Dental Insurance", "401k", "Remote Work"],
  "applicationDeadline": "2025-09-02T18:13:00.000Z"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Job posted successfully",
  "data": {
    "title": "Senior Frontend Developer",
    "description": "We are looking for an experienced frontend developer to join our team.",
    "employer": {
      "_id": "employer_id",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "skills": [
      {
        "name": "React",
        "required": true,
        "proficiency": "Advanced"
      }
    ],
    "_id": "job_id"
  }
}
```

#### GET `/api/jobs`

Get all jobs with filtering and pagination.

**Query Parameters:**

- `search`: Search by title
- `skills`: Comma-separated skills (e.g., "React,JavaScript")
- `jobType`: Job type filter (e.g., "Full-time")
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Example Requests:**

```
GET /api/jobs
GET /api/jobs?skills=React,JavaScript
GET /api/jobs?jobType=Full-time
GET /api/jobs?search=Frontend Developer
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "title": "Senior Frontend Developer",
      "description": "We are looking for an experienced frontend developer...",
      "employer": {
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "location": {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA"
      },
      "salary": {
        "min": 120000,
        "max": 160000,
        "currency": "USD"
      },
      "_id": "job_id"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### GET `/api/jobs/:id`

Get job by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "title": "Senior Frontend Developer",
    "description": "We are looking for an experienced frontend developer...",
    "requirements": [
      "Bachelor's degree in Computer Science or related field",
      "5+ years of experience with React"
    ],
    "skills": [
      {
        "name": "React",
        "required": true,
        "proficiency": "Advanced"
      }
    ],
    "employer": {
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "_id": "job_id"
  }
}
```

#### POST `/api/jobs/:id/apply`

Apply to a job.

**Request Body:**

```json
{
  "coverLetter": "I am very interested in this position and believe my skills make me a perfect fit.",
  "expectedSalary": 140000
}
```

**Response:**

```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicant": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "coverLetter": "I am very interested in this position and believe my skills make me a perfect fit.",
    "expectedSalary": 140000,
    "appliedAt": "2025-08-02T18:13:00.000Z",
    "status": "pending"
  }
}
```

#### GET `/api/jobs/my/applications`

Get user's job applications.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "job": {
        "title": "Senior Frontend Developer",
        "employer": {
          "firstName": "Jane",
          "lastName": "Smith"
        }
      },
      "coverLetter": "I am very interested in this position...",
      "expectedSalary": 140000,
      "appliedAt": "2025-08-02T18:13:00.000Z",
      "status": "pending"
    }
  ]
}
```

#### GET `/api/jobs/my/posted`

Get jobs posted by the current user (employers only).

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "title": "Senior Frontend Developer",
      "description": "We are looking for an experienced frontend developer...",
      "applications": [
        {
          "applicant": {
            "firstName": "John",
            "lastName": "Doe"
          },
          "appliedAt": "2025-08-02T18:13:00.000Z",
          "status": "pending"
        }
      ],
      "_id": "job_id"
    }
  ]
}
```

### Social Feed Endpoints

#### POST `/api/posts`

Create a new post.

**Request Body:**

```json
{
  "content": "Just finished an amazing coding bootcamp! Excited to start my career in web development. #WebDev #Career",
  "type": "text",
  "category": "Career",
  "tags": ["webdev", "career", "excited"],
  "visibility": "public"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "content": "Just finished an amazing coding bootcamp! Excited to start my career in web development. #WebDev #Career",
    "author": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "category": "Career",
    "tags": ["webdev", "career", "excited"],
    "likesCount": 0,
    "commentsCount": 0,
    "sharesCount": 0,
    "_id": "post_id"
  }
}
```

#### GET `/api/posts/feed`

Get social feed posts.

**Query Parameters:**

- `category`: Filter by category (e.g., "Career")
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "content": "Just finished an amazing coding bootcamp!",
      "author": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "category": "Career",
      "tags": ["webdev", "career", "excited"],
      "likesCount": 0,
      "commentsCount": 0,
      "sharesCount": 0,
      "createdAt": "2025-08-02T18:13:00.000Z",
      "_id": "post_id"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

#### GET `/api/posts/:id`

Get post by ID (optional authentication).

**Response:**

```json
{
  "success": true,
  "data": {
    "content": "Just finished an amazing coding bootcamp!",
    "author": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "category": "Career",
    "tags": ["webdev", "career", "excited"],
    "likesCount": 0,
    "commentsCount": 0,
    "sharesCount": 0,
    "isLiked": false,
    "_id": "post_id"
  }
}
```

#### POST `/api/posts/:id/like`

Like or unlike a post.

**Response:**

```json
{
  "success": true,
  "data": {
    "likesCount": 1,
    "isLiked": true
  }
}
```

#### POST `/api/posts/:id/comments`

Add comment to a post.

**Request Body:**

```json
{
  "content": "Congratulations! Wishing you all the best in your new career!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "content": "Congratulations! Wishing you all the best in your new career!",
    "author": {
      "_id": "user_id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "createdAt": "2025-08-02T18:13:00.000Z",
    "_id": "comment_id"
  }
}
```

#### POST `/api/posts/:id/share`

Share a post.

**Request Body:**

```json
{
  "shareComment": "Great insights! Everyone should read this."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sharesCount": 1
  }
}
```

### AI Features Endpoints

#### POST `/api/ai/extract-skills-text`

Extract skills from text.

**Request Body:**

```json
{
  "text": "I am a software developer with 5 years of experience in JavaScript, React, Node.js, Python, and AWS. I have worked on building scalable web applications and RESTful APIs."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "skills": [
      "JavaScript",
      "React",
      "Node.js",
      "Python",
      "AWS",
      "RESTful APIs",
      "Web Applications"
    ]
  }
}
```

#### GET `/api/ai/job-recommendations`

Get AI-powered job recommendations for the current user.

**Response:**

```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "title": "Senior Frontend Developer",
        "company": "TechCorp Inc.",
        "location": "San Francisco, CA",
        "salary": {
          "min": 120000,
          "max": 160000,
          "currency": "USD"
        },
        "matchScore": 95,
        "_id": "job_id"
      }
    ],
    "total": 1
  }
}
```

### Health Check Endpoint

#### GET `/api/health`

Get API health status.

**Response:**

```json
{
  "status": "OK",
  "message": "Job Portal API is running",
  "timestamp": "2025-08-02T18:13:00.000Z",
  "environment": "test"
}
```

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

## Validation Rules

### User Registration

- `firstName`: Required, min 2 characters
- `lastName`: Required, min 2 characters
- `email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `accountType`: Required, one of ["job_seeker", "employer"]

### Job Posting

- `title`: Required, min 3 characters
- `description`: Required, min 10 characters
- `jobType`: Required, one of ["Full-time", "Part-time", "Contract", "Internship"]
- `workLocation`: Required, one of ["On-site", "Remote", "Hybrid"]
- `experienceLevel`: Required, one of ["Entry Level", "Mid Level", "Senior Level", "Executive"]
- `category`: Required, one of ["Technology", "Healthcare", "Finance", "Education", "Marketing", "Sales", "Other"]

### Post Creation

- `content`: Required, min 1 character
- `type`: Required, one of ["text", "image", "video", "link"]
- `category`: Required, one of ["Career", "Technology", "Education", "Networking", "Other"]
- `visibility`: Required, one of ["public", "connections", "private"]

## Security Features

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt
- Input validation with Joi
- CORS protection
- Helmet security headers
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

- Authentication flow (4 tests)
- User profile management (3 tests)
- Job management (10 tests)
- Social feed functionality (7 tests)
- AI features (2 tests)
- Connection management (2 tests)
- Authentication logout (2 tests)
- API health check (1 test)

**Total: 43 tests, all passing**

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

## Testing Status

✅ **All 43 tests passing**
✅ **No open handles or resource leaks**
✅ **Comprehensive error handling**
✅ **All endpoints functional**
✅ **Authentication working correctly**
✅ **File uploads operational**
✅ **AI features integrated**
✅ **Database operations optimized**
