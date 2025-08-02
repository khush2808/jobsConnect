# Job Portal API - Complete Endpoint List

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint           | Description                          | Auth Required |
| ------ | ------------------ | ------------------------------------ | ------------- |
| POST   | `/register`        | Register new user account            | No            |
| POST   | `/login`           | Authenticate user and set JWT cookie | No            |
| POST   | `/logout`          | Clear authentication cookie          | Yes           |
| GET    | `/current-user`    | Get current authenticated user       | Yes           |
| POST   | `/refresh-token`   | Refresh JWT token                    | Yes           |
| POST   | `/change-password` | Change user password                 | Yes           |
| POST   | `/forgot-password` | Send password reset email            | No            |
| POST   | `/reset-password`  | Reset password with token            | No            |
| POST   | `/verify-email`    | Verify email address                 | Yes           |

## User Management Endpoints (`/api/users`)

| Method | Endpoint                  | Description                      | Auth Required |
| ------ | ------------------------- | -------------------------------- | ------------- |
| GET    | `/:id`                    | Get user profile by ID           | No            |
| PUT    | `/profile`                | Update user profile              | Yes           |
| POST   | `/upload-profile-picture` | Upload profile picture           | Yes           |
| DELETE | `/remove-profile-picture` | Remove profile picture           | Yes           |
| PUT    | `/skills`                 | Update user skills               | Yes           |
| GET    | `/search`                 | Search users with filters        | Yes           |
| POST   | `/:id/connect`            | Send connection request          | Yes           |
| PUT    | `/connections/:requestId` | Accept/reject connection request | Yes           |
| GET    | `/connections`            | Get user connections             | Yes           |
| DELETE | `/connections/:userId`    | Remove connection                | Yes           |

## Job Management Endpoints (`/api/jobs`)

| Method | Endpoint                              | Description                     | Auth Required   |
| ------ | ------------------------------------- | ------------------------------- | --------------- |
| GET    | `/`                                   | Get job listings with filtering | No              |
| GET    | `/:id`                                | Get job details by ID           | No              |
| POST   | `/`                                   | Create new job posting          | Yes             |
| PUT    | `/:id`                                | Update job posting              | Yes (Owner)     |
| DELETE | `/:id`                                | Delete job posting              | Yes (Owner)     |
| POST   | `/:id/apply`                          | Apply to job                    | Yes             |
| GET    | `/my/applications`                    | Get user's applications         | Yes             |
| GET    | `/my/posted`                          | Get user's posted jobs          | Yes             |
| PUT    | `/:jobId/applications/:applicationId` | Update application status       | Yes (Job Owner) |
| GET    | `/recommendations`                    | Get AI job recommendations      | Yes             |

## Social Feed Endpoints (`/api/posts`)

| Method | Endpoint                   | Description           | Auth Required |
| ------ | -------------------------- | --------------------- | ------------- |
| GET    | `/feed`                    | Get personalized feed | Yes           |
| GET    | `/:id`                     | Get post by ID        | Optional      |
| POST   | `/`                        | Create new post       | Yes           |
| PUT    | `/:id`                     | Update post           | Yes (Owner)   |
| DELETE | `/:id`                     | Delete post           | Yes (Owner)   |
| POST   | `/:id/like`                | Like/unlike post      | Yes           |
| POST   | `/:id/comments`            | Add comment to post   | Yes           |
| DELETE | `/:id/comments/:commentId` | Delete comment        | Yes (Owner)   |
| POST   | `/:id/share`               | Share post            | Yes           |
| GET    | `/my/posts`                | Get user's posts      | Yes           |

## AI Features Endpoints (`/api/ai`)

| Method | Endpoint                 | Description                          | Auth Required |
| ------ | ------------------------ | ------------------------------------ | ------------- |
| POST   | `/extract-skills-resume` | Extract skills from PDF resume       | Yes           |
| POST   | `/extract-skills-text`   | Extract skills from text             | Yes           |
| PUT    | `/update-skills`         | Update user skills with AI extracted | Yes           |
| GET    | `/job-recommendations`   | Get AI job recommendations           | Yes           |
| GET    | `/user-recommendations`  | Get user connection recommendations  | Yes           |
| POST   | `/analyze-sentiment`     | Analyze content sentiment            | Yes           |
| POST   | `/generate-tags`         | Generate tags for content            | Yes           |

## Health Check Endpoint

| Method | Endpoint      | Description       | Auth Required |
| ------ | ------------- | ----------------- | ------------- |
| GET    | `/api/health` | API health status | No            |

## Summary Statistics

- **Total Endpoints**: 37
- **Public Endpoints**: 6
- **Protected Endpoints**: 31
- **Authentication Endpoints**: 9
- **User Management**: 10
- **Job Management**: 10
- **Social Features**: 9
- **AI Features**: 7
- **Health Check**: 1

## Authentication Methods

- **JWT Cookies**: Primary authentication method
- **httpOnly Cookies**: Secure cookie storage
- **Token Refresh**: Automatic token renewal
- **Optional Auth**: Some endpoints work with/without auth

## Request/Response Formats

- **Content-Type**: `application/json` (default)
- **File Uploads**: `multipart/form-data`
- **Response Format**: Consistent JSON structure
- **Error Handling**: Standardized error responses

## Rate Limiting

- **General Endpoints**: 100 requests/15 minutes
- **Auth Endpoints**: 50 requests/15 minutes
- **Per IP Address**: Rate limiting applied

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

### User Search Filters

- Search by name, bio, skills
- Filter by location, skills
- Pagination support

### Post Filtering

- Filter by type, category, tags
- Show only connections' posts
- Date-based filtering
