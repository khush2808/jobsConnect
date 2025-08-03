# Database Seeder

This seeder populates the database with realistic sample data for testing and development purposes.

## What Gets Created

### Users (5 total)

- **John Smith** - Senior Software Engineer (job_seeker)
- **Sarah Johnson** - UX/UI Designer (job_seeker)
- **Michael Chen** - Engineering Manager at TechCorp (both - employer & job_seeker)
- **Emily Davis** - Product Manager at StartupXYZ (both - employer & job_seeker)
- **David Wilson** - Senior Data Scientist (job_seeker)

### Connections

- 4 accepted connections between users
- 2 pending connection requests
- Creates a realistic social network structure

### Posts (5 total)

- Achievement posts about career milestones
- Questions about technical topics
- Career advice and networking tips
- Article shares and professional updates

### Comments & Likes

- 1-3 comments per post from different users
- 2-5 likes per post from various users
- Realistic engagement patterns

### Jobs (3 total)

- **Senior Full Stack Developer** - Posted by Michael Chen (TechCorp)
- **UX/UI Designer** - Posted by Emily Davis (StartupXYZ)
- **Data Scientist** - Posted by Michael Chen (TechCorp)

### Job Applications

- 1-3 applications per job
- Various application statuses (pending, reviewing, shortlisted, rejected)
- Realistic cover letters and expected salaries

## How to Run

```bash
# Navigate to backend directory
cd backend

# Run the seeder
npm run seed
```

## Environment Setup

Make sure you have a `.env` file in the backend directory with:

```
MONGODB_URI=mongodb://localhost:27017/job-portal
```

Or copy from `env.example`:

```bash
cp env.example .env
```

## Data Structure

### User Types

- `job_seeker`: Users looking for jobs
- `employer`: Users posting jobs
- `both`: Users who can both post jobs and apply for them

### Connection Status

- `accepted`: Mutual connections
- `pending`: Connection requests waiting for approval
- `rejected`: Declined connection requests

### Job Application Status

- `pending`: Application submitted, waiting for review
- `reviewing`: Application under review
- `shortlisted`: Candidate selected for next round
- `rejected`: Application not selected
- `hired`: Candidate hired for the position

### Post Types

- `text`: Regular text posts
- `article`: Article shares
- `job_update`: Job-related updates
- `career_advice`: Professional advice
- `achievement`: Career milestones
- `question`: Questions for the community
- `poll`: Community polls

## Sample Login Credentials

All users have the password: `password123`

- john.smith@example.com
- sarah.johnson@example.com
- michael.chen@techcorp.com
- emily.davis@startup.com
- david.wilson@bigtech.com

## Features Demonstrated

1. **User Profiles**: Complete profiles with skills, experience, and preferences
2. **Social Networking**: Connections between users with different statuses
3. **Content Creation**: Posts with comments, likes, and engagement
4. **Job Posting**: Employers posting jobs with detailed requirements
5. **Job Applications**: Candidates applying with cover letters and status tracking
6. **Realistic Data**: All data represents realistic scenarios and interactions

## Customization

You can modify the `sampleUsers`, `samplePosts`, and `sampleJobs` arrays in `seeder.js` to add more data or change the existing data structure.

## Notes

- The seeder clears existing data before creating new data
- All passwords are hashed using bcrypt
- Timestamps are set to realistic dates
- IDs are properly linked between related entities
- The seeder handles errors gracefully and continues execution
