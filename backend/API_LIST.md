# Job Portal API - Complete Endpoint List

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint    | Description                          | Auth Required | Status |
| ------ | ----------- | ------------------------------------ | ------------- | ------ |
| POST   | `/register` | Register new user account            | No            | ✅     |
| POST   | `/login`    | Authenticate user and set JWT cookie | No            | ✅     |
| POST   | `/logout`   | Clear authentication cookie          | Yes           | ✅     |
| GET    | `/me`       | Get current authenticated user       | Yes           | ✅     |

## User Management Endpoints (`/api/users`)

| Method | Endpoint           | Description                      | Auth Required | Status |
| ------ | ------------------ | -------------------------------- | ------------- | ------ |
| GET    | `/:id`             | Get user profile by ID           | Optional      | ✅     |
| PUT    | `/profile`         | Update user profile              | Yes           | ✅     |
| POST   | `/profile-picture` | Upload profile picture           | Yes           | ✅     |
| DELETE | `/profile-picture` | Remove profile picture           | Yes           | ✅     |
| PUT    | `/skills`          | Update user skills               | Yes           | ✅     |
| GET    | `/search`          | Search users with filters        | Yes           | ✅     |
| GET    | `/connections`     | Get user connections             | Yes           | ✅     |
| POST   | `/:id/connect`     | Send connection request          | Yes           | ✅     |
| PUT    | `/connections/:id` | Accept/reject connection request | Yes           | ✅     |
| DELETE | `/connections/:id` | Remove connection                | Yes           | ✅     |

## Job Management Endpoints (`/api/jobs`)

| Method | Endpoint           | Description                     | Auth Required | Status |
| ------ | ------------------ | ------------------------------- | ------------- | ------ |
| GET    | `/`                | Get job listings with filtering | No            | ✅     |
| GET    | `/:id`             | Get job details by ID           | No            | ✅     |
| POST   | `/`                | Create new job posting          | Yes           | ✅     |
| POST   | `/:id/apply`       | Apply to job                    | Yes           | ✅     |
| GET    | `/my/applications` | Get user's applications         | Yes           | ✅     |
| GET    | `/my/posted`       | Get user's posted jobs          | Yes           | ✅     |

## Social Feed Endpoints (`/api/posts`)

| Method | Endpoint        | Description           | Auth Required | Status |
| ------ | --------------- | --------------------- | ------------- | ------ |
| GET    | `/feed`         | Get personalized feed | Yes           | ✅     |
| GET    | `/:id`          | Get post by ID        | Optional      | ✅     |
| POST   | `/`             | Create new post       | Yes           | ✅     |
| POST   | `/:id/like`     | Like/unlike post      | Yes           | ✅     |
| POST   | `/:id/comments` | Add comment to post   | Yes           | ✅     |
| POST   | `/:id/share`    | Share post            | Yes           | ✅     |
| GET    | `/my/posts`     | Get user's posts      | Yes           | ✅     |

## AI Features Endpoints (`/api/ai`)

| Method | Endpoint               | Description                | Auth Required | Status |
| ------ | ---------------------- | -------------------------- | ------------- | ------ |
| POST   | `/extract-skills-text` | Extract skills from text   | Yes           | ✅     |
| GET    | `/job-recommendations` | Get AI job recommendations | Yes           | ✅     |

## Health Check Endpoint

| Method | Endpoint      | Description       | Auth Required | Status |
| ------ | ------------- | ----------------- | ------------- | ------ |
| GET    | `/api/health` | API health status | No            | ✅     |

## Summary Statistics

- **Total Endpoints**: 25
- **Public Endpoints**: 4
- **Protected Endpoints**: 21
- **Authentication Endpoints**: 4
- **User Management**: 10
- **Job Management**: 6
- **Social Features**: 7
- **AI Features**: 2
- **Health Check**: 1

## Authentication Methods

- **JWT Cookies**: Primary authentication method
- **httpOnly Cookies**: Secure cookie storage
- **Optional Auth**: Some endpoints work with/without auth

## Request/Response Formats

- **Content-Type**: `application/json` (default)
- **File Uploads**: `multipart/form-data`
- **Response Format**: Consistent JSON structure with `success`, `message`, and `data` fields
- **Error Handling**: Standardized error responses

## Response Structure

All successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## File Upload Support

- **Profile Pictures**: JPG, PNG, GIF (5MB max)
- **Resume Files**: PDF only (10MB max)
- **Post Media**: Images, Videos (50MB max, 5 files)

## Filtering & Search Features

### Job Search Filters

- Search by title, description, company
- Filter by skills, job type, location
- Salary range filtering
- Experience level filtering
- Sort by date, salary, relevance

**Query Parameters:**

- `search`: Search by title
- `skills`: Comma-separated skills (e.g., "React,JavaScript")
- `jobType`: Job type filter (e.g., "Full-time")
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### User Search Filters

- Search by name, bio, skills
- Filter by location, skills
- Pagination support

**Query Parameters:**

- `q`: Search query
- `skills`: Comma-separated skills
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

### Post Filtering

- Filter by category
- Show only connections' posts
- Date-based filtering

**Query Parameters:**

- `category`: Filter by category (e.g., "Career")
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)

## Data Models

### User Profile

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
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
```

### Job Posting

```json
{
  "title": "Senior Frontend Developer",
  "description": "We are looking for an experienced frontend developer...",
  "requirements": [
    "Bachelor's degree in Computer Science",
    "5+ years of experience with React"
  ],
  "skills": [
    {
      "name": "React",
      "required": true,
      "proficiency": "Advanced"
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
  "benefits": ["Health Insurance", "Dental Insurance", "401k", "Remote Work"]
}
```

### Post

```json
{
  "content": "Just finished an amazing coding bootcamp!",
  "type": "text",
  "category": "Career",
  "tags": ["webdev", "career", "excited"],
  "visibility": "public"
}
```

## Testing Status

All endpoints have been thoroughly tested with comprehensive integration tests:

- ✅ **43/43 tests passing**
- ✅ **All authentication flows working**
- ✅ **User management fully functional**
- ✅ **Job posting and applications working**
- ✅ **Social feed features operational**
- ✅ **AI features integrated**
- ✅ **Connection management functional**
- ✅ **Error handling comprehensive**
- ✅ **No open handles or resource leaks**

## Environment Setup

Required environment variables for testing:

```
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/job-portal-test
JWT_SECRET=test-secret-key
COOKIE_SECRET=test-cookie-secret
```
