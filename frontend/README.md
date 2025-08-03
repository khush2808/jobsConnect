# Frontend

This is the frontend application for the job portal.

## Features

### Profile Management

- **Profile Picture Management**: Upload, download, and remove profile pictures
- **Resume Management**: Upload, download, view, and remove resumes (PDF format)
- **Download Functionality**: Users can download their uploaded profile pictures and resumes
- **View Functionality**: Users can view their resumes in a new tab
- **Smart Resume Detection**: The system checks for resume URL/filename and only shows download/view options when resume is actually uploaded
- **Loading States**: Proper loading indicators during file operations
- **Error Handling**: Comprehensive error handling for file operations

### File Operations

- **Profile Picture**: Supports JPG, JPEG, PNG, and WebP formats
- **Resume**: Supports PDF format only
- **Download**: Direct download with original filename preservation
- **View**: Opens resume in new tab for viewing
- **Remove**: Safely removes files with confirmation

### User Experience

- **Conditional Display**: Resume download/view buttons only appear when resume is uploaded
- **Status Messages**: Clear feedback for all file operations
- **Loading Indicators**: Visual feedback during file processing
- **Error Messages**: User-friendly error messages for failed operations

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## File Upload Guidelines

### Profile Pictures

- Supported formats: JPG, JPEG, PNG, WebP
- Maximum size: 5MB
- Will be automatically cropped to square format

### Resumes

- Supported format: PDF only
- Maximum size: 10MB
- Will be parsed for text extraction and skill analysis

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### File Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── store/         # Redux store and slices
├── services/      # API services
├── lib/           # Utility functions
└── contexts/      # React contexts
```

## API Integration

The frontend integrates with the backend API for:

- User authentication and profile management
- File upload and management
- Job posting and application
- Social features (connections, posts)

All API calls are handled through the Redux store with proper error handling and loading states.
