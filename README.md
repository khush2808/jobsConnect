# Job & Networking Portal

A comprehensive full-stack web application inspired by LinkedIn, Upwork, and AngelList, enhanced with AI-powered features for skill extraction and smart recommendations.

## 🌟 Features

### Core Features

- **User Authentication**: Secure JWT-based authentication with httpOnly cookies
- **Profile Management**: Complete user profiles with bio, skills, location, and preferences
- **Job Posting & Search**: Post jobs, search with advanced filters, and apply to positions
- **Social Feed**: Share posts, engage with content, and build professional networks
- **Networking**: Connect with other professionals and build your network

### AI-Powered Features

- **Resume Skill Extraction**: Upload PDF resumes and automatically extract skills using Gemini AI
- **Smart Job Recommendations**: AI-powered job matching based on skills and preferences
- **User Recommendations**: Find potential connections based on skills and location
- **Content Analysis**: Sentiment analysis and tag generation for posts

### Advanced Features

- **File Upload**: Profile pictures and resume uploads via Cloudinary
- **Real-time Search**: Advanced search and filtering for jobs and users
- **Connection Management**: Send, accept, and manage professional connections
- **Responsive Design**: Mobile-first design with Tailwind CSS and shadcn/ui

## 🚀 Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication with httpOnly cookies
- **Cloudinary** - File storage and image optimization
- **Gemini AI** - Google's AI for skill extraction and recommendations
- **Multer** - File upload handling
- **Joi** - Input validation
- **bcryptjs** - Password hashing

### Frontend (Coming Soon)

- **React.js** - Frontend framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **React Router** - Client-side routing
- **Zustand** - State management

### Security & Performance

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **Compression** - Response compression
- **Input Validation** - Comprehensive validation middleware
- **Error Handling** - Global error handling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account
- Google Gemini API key

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd job-networking-portal
```

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/job-portal
# or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/job-portal

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
COOKIE_SECRET=your-cookie-secret-key-change-this

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Start the application

#### Development mode (backend + frontend)

```bash
npm run dev
```

#### Backend only

```bash
npm run dev:backend
```

#### Frontend only

```bash
npm run dev:frontend
```

## 📁 Project Structure

```
job-networking-portal/
├── backend/                 # Backend API
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   └── server.js          # Express server entry point
├── frontend/               # React frontend (coming soon)
├── shared/                 # Shared utilities and types
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Root package.json
└── README.md             # This file
```

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint                          | Description              |
| ------ | --------------------------------- | ------------------------ |
| POST   | `/api/auth/register`              | Register a new user      |
| POST   | `/api/auth/login`                 | Login user               |
| POST   | `/api/auth/logout`                | Logout user              |
| GET    | `/api/auth/me`                    | Get current user profile |
| POST   | `/api/auth/refresh`               | Refresh JWT token        |
| PUT    | `/api/auth/change-password`       | Change password          |
| POST   | `/api/auth/forgot-password`       | Request password reset   |
| POST   | `/api/auth/reset-password/:token` | Reset password           |

### User Management

| Method | Endpoint                     | Description            |
| ------ | ---------------------------- | ---------------------- |
| GET    | `/api/users/:id`             | Get user profile by ID |
| PUT    | `/api/users/profile`         | Update user profile    |
| POST   | `/api/users/profile-picture` | Upload profile picture |
| DELETE | `/api/users/profile-picture` | Remove profile picture |
| PUT    | `/api/users/skills`          | Update user skills     |
| GET    | `/api/users/search`          | Search users           |

### Connections

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | `/api/users/:id/connect`     | Send connection request  |
| GET    | `/api/users/connections`     | Get user connections     |
| PUT    | `/api/users/connections/:id` | Accept/reject connection |
| DELETE | `/api/users/connections/:id` | Remove connection        |

### AI Features

| Method | Endpoint                        | Description                         |
| ------ | ------------------------------- | ----------------------------------- |
| POST   | `/api/ai/extract-skills-resume` | Extract skills from PDF resume      |
| POST   | `/api/ai/extract-skills-text`   | Extract skills from text            |
| POST   | `/api/ai/update-user-skills`    | Update user skills with AI data     |
| GET    | `/api/ai/job-recommendations`   | Get AI job recommendations          |
| GET    | `/api/ai/user-recommendations`  | Get user connection recommendations |
| POST   | `/api/ai/analyze-sentiment`     | Analyze content sentiment           |
| POST   | `/api/ai/generate-tags`         | Generate content tags               |

## 📊 Database Models

### User Model

- Personal information (name, email, bio)
- Skills with proficiency levels
- Location and job preferences
- Profile picture and LinkedIn URL
- Connections and networking data
- Account type (job_seeker, employer, both)

### Job Model

- Job details (title, description, requirements)
- Company information
- Skills and experience requirements
- Salary and benefits
- Application tracking
- AI matching capabilities

### Post Model

- Social feed content
- Media attachments
- Engagement metrics (likes, comments, shares)
- AI sentiment analysis
- Tags and categorization

## 🔧 Configuration

### MongoDB Setup

1. Install MongoDB locally or create a MongoDB Atlas account
2. Update the `MONGODB_URI` in your `.env` file
3. The application will automatically create necessary indexes

### Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret
3. Update the Cloudinary variables in your `.env` file

### Gemini AI Setup

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Update the `GEMINI_API_KEY` in your `.env` file
3. AI features will be disabled if the API key is not provided

## 🚀 Deployment

### Backend Deployment

#### Using Railway/Render/Heroku

1. Create a new project on your chosen platform
2. Connect your GitHub repository
3. Set environment variables in the platform's dashboard
4. Deploy the application

#### Using Docker

```bash
# Build the image
docker build -t job-portal-backend ./backend

# Run the container
docker run -p 5000:5000 --env-file .env job-portal-backend
```

### Frontend Deployment

#### Using Vercel/Netlify

1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Set environment variables for API endpoints

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test
```

### API Testing

Use the provided API endpoints with tools like:

- Postman
- Insomnia
- Thunder Client (VS Code extension)

Example request:

```javascript
// Register a new user
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123",
  "accountType": "job_seeker"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) section
2. Review the API documentation above
3. Ensure all environment variables are set correctly
4. Verify MongoDB and external services are running

## 🔗 Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ for the RizeOS Core Team Internship Assignment**
