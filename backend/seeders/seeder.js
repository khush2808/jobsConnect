const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const User = require("../models/User");
const Post = require("../models/Post");
const Job = require("../models/Job");

// Sample users data
const sampleUsers = [
  {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    password: "password123",
    bio: "Senior Software Engineer with 8+ years of experience in full-stack development.",
    linkedinUrl: "https://linkedin.com/in/johnsmith",
    skills: [
      { name: "JavaScript", proficiency: "Expert", isAIExtracted: false },
      { name: "React", proficiency: "Expert", isAIExtracted: false },
      { name: "Node.js", proficiency: "Advanced", isAIExtracted: false },
    ],
    location: {
      city: "San Francisco",
      state: "CA",
      country: "USA",
    },
    jobPreferences: {
      roles: ["Senior Software Engineer", "Full Stack Developer"],
      jobTypes: ["Full-time", "Contract"],
      remoteWork: "Hybrid",
      salaryRange: { min: 120000, max: 180000, currency: "USD" },
    },
    accountType: "job_seeker",
    isEmailVerified: true,
    profileCompleteness: 95,
  },
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@example.com",
    password: "password123",
    bio: "UX/UI Designer with a passion for creating intuitive user experiences.",
    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
    skills: [
      { name: "Figma", proficiency: "Expert", isAIExtracted: false },
      {
        name: "Adobe Creative Suite",
        proficiency: "Advanced",
        isAIExtracted: false,
      },
      { name: "User Research", proficiency: "Advanced", isAIExtracted: false },
    ],
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
    },
    jobPreferences: {
      roles: ["UX Designer", "UI Designer", "Product Designer"],
      jobTypes: ["Full-time", "Freelance"],
      remoteWork: "Remote",
      salaryRange: { min: 80000, max: 130000, currency: "USD" },
    },
    accountType: "job_seeker",
    isEmailVerified: true,
    profileCompleteness: 88,
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@techcorp.com",
    password: "password123",
    bio: "Engineering Manager at TechCorp. Leading teams of 15+ developers.",
    linkedinUrl: "https://linkedin.com/in/michaelchen",
    skills: [
      { name: "Team Leadership", proficiency: "Expert", isAIExtracted: false },
      { name: "Python", proficiency: "Advanced", isAIExtracted: false },
      { name: "AWS", proficiency: "Intermediate", isAIExtracted: false },
    ],
    location: {
      city: "Seattle",
      state: "WA",
      country: "USA",
    },
    jobPreferences: {
      roles: ["Engineering Manager", "Technical Lead"],
      jobTypes: ["Full-time"],
      remoteWork: "Hybrid",
      salaryRange: { min: 150000, max: 220000, currency: "USD" },
    },
    accountType: "both",
    companyInfo: {
      name: "TechCorp",
      website: "https://techcorp.com",
      size: "501-1000",
      industry: "Technology",
      description: "Leading technology company focused on innovative solutions",
    },
    isEmailVerified: true,
    profileCompleteness: 92,
  },
  {
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@startup.com",
    password: "password123",
    bio: "Product Manager with experience in B2B SaaS.",
    linkedinUrl: "https://linkedin.com/in/emilydavis",
    skills: [
      {
        name: "Product Strategy",
        proficiency: "Advanced",
        isAIExtracted: false,
      },
      {
        name: "Data Analysis",
        proficiency: "Intermediate",
        isAIExtracted: false,
      },
      { name: "A/B Testing", proficiency: "Advanced", isAIExtracted: false },
    ],
    location: {
      city: "Austin",
      state: "TX",
      country: "USA",
    },
    jobPreferences: {
      roles: ["Product Manager", "Senior Product Manager"],
      jobTypes: ["Full-time", "Contract"],
      remoteWork: "Remote",
      salaryRange: { min: 100000, max: 160000, currency: "USD" },
    },
    accountType: "both",
    companyInfo: {
      name: "StartupXYZ",
      website: "https://startupxyz.com",
      size: "11-50",
      industry: "SaaS",
      description: "Innovative startup building the future of work",
    },
    isEmailVerified: true,
    profileCompleteness: 85,
  },
  {
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@bigtech.com",
    password: "password123",
    bio: "Senior Data Scientist specializing in machine learning and AI.",
    linkedinUrl: "https://linkedin.com/in/davidwilson",
    skills: [
      { name: "Python", proficiency: "Expert", isAIExtracted: false },
      { name: "Machine Learning", proficiency: "Expert", isAIExtracted: false },
      { name: "TensorFlow", proficiency: "Advanced", isAIExtracted: false },
    ],
    location: {
      city: "Boston",
      state: "MA",
      country: "USA",
    },
    jobPreferences: {
      roles: ["Data Scientist", "ML Engineer"],
      jobTypes: ["Full-time"],
      remoteWork: "Hybrid",
      salaryRange: { min: 130000, max: 190000, currency: "USD" },
    },
    accountType: "job_seeker",
    isEmailVerified: true,
    profileCompleteness: 90,
  },
];

// Sample posts data
const samplePosts = [
  {
    content:
      "Just wrapped up an amazing project using React and Node.js! The team collaboration was incredible and we delivered ahead of schedule. Key learnings: always prioritize user experience and never underestimate the power of good documentation. #webdevelopment #react #nodejs #teamwork",
    type: "achievement",
    category: "Technology",
    tags: ["webdevelopment", "react", "nodejs", "teamwork"],
    visibility: "public",
  },
  {
    content:
      "Looking for advice from fellow developers: What's your experience with microservices architecture? We're considering migrating our monolithic app and would love to hear about challenges and best practices you've encountered. #microservices #architecture #tech",
    type: "question",
    category: "Technology",
    tags: ["microservices", "architecture", "tech"],
    visibility: "public",
  },
  {
    content:
      "Excited to share that I've been promoted to Senior Software Engineer! 🎉 This journey has been incredible, and I'm grateful for all the mentors who guided me along the way. Remember: continuous learning and helping others grow is what makes this field so rewarding. #career #promotion #softwareengineering",
    type: "achievement",
    category: "Success Stories",
    tags: ["career", "promotion", "softwareengineering"],
    visibility: "public",
  },
  {
    content:
      "Just published a new article on Medium about optimizing React performance! Check it out if you're interested in learning about code splitting, lazy loading, and other techniques to make your React apps faster. Link in comments! #react #performance #webdevelopment",
    type: "article",
    category: "Technology",
    tags: ["react", "performance", "webdevelopment"],
    visibility: "public",
  },
  {
    content:
      "Networking tip: Don't just collect business cards, build genuine relationships. I've found that the best opportunities come from people who know you as a person, not just a professional contact. Take time to understand their challenges and offer help when you can. #networking #careeradvice",
    type: "career_advice",
    category: "Networking",
    tags: ["networking", "careeradvice"],
    visibility: "public",
  },
];

// Sample jobs data
const sampleJobs = [
  {
    title: "Senior Full Stack Developer",
    description:
      "We're looking for a Senior Full Stack Developer to join our growing team. You'll be responsible for building and maintaining scalable web applications using modern technologies. The ideal candidate will have strong experience with React, Node.js, and cloud platforms.",
    jobType: "Full-time",
    workLocation: "Hybrid",
    location: {
      city: "San Francisco",
      state: "CA",
      country: "USA",
    },
    skills: [
      { name: "React", level: "Advanced", isRequired: true },
      { name: "Node.js", level: "Advanced", isRequired: true },
      { name: "TypeScript", level: "Intermediate", isRequired: false },
      { name: "AWS", level: "Intermediate", isRequired: false },
    ],
    experienceLevel: "Senior Level",
    minimumExperience: 5,
    education: {
      level: "Bachelor's",
      field: "Computer Science",
    },
    salary: {
      min: 140000,
      max: 180000,
      currency: "USD",
      period: "yearly",
    },
    benefits: [
      "Health Insurance",
      "401k",
      "Paid Time Off",
      "Remote Work",
      "Professional Development",
    ],
    category: "Technology",
    tags: ["react", "nodejs", "fullstack", "senior"],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    title: "UX/UI Designer",
    description:
      "Join our design team to create beautiful and intuitive user experiences. You'll work closely with product managers and developers to design user interfaces that delight our customers. Experience with Figma and user research is essential.",
    jobType: "Full-time",
    workLocation: "Remote",
    location: {
      city: "New York",
      state: "NY",
      country: "USA",
    },
    skills: [
      { name: "Figma", level: "Advanced", isRequired: true },
      { name: "User Research", level: "Intermediate", isRequired: true },
      { name: "Prototyping", level: "Advanced", isRequired: false },
      { name: "Design Systems", level: "Intermediate", isRequired: false },
    ],
    experienceLevel: "Mid Level",
    minimumExperience: 3,
    education: {
      level: "Bachelor's",
      field: "Design",
    },
    salary: {
      min: 80000,
      max: 120000,
      currency: "USD",
      period: "yearly",
    },
    benefits: [
      "Health Insurance",
      "Paid Time Off",
      "Remote Work",
      "Professional Development",
    ],
    category: "Design",
    tags: ["ux", "ui", "design", "figma"],
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    status: "active",
  },
  {
    title: "Data Scientist",
    description:
      "We're seeking a Data Scientist to help us extract insights from large datasets and build machine learning models. You'll work with our engineering team to implement data-driven solutions that improve our products and services.",
    jobType: "Full-time",
    workLocation: "On-site",
    location: {
      city: "Boston",
      state: "MA",
      country: "USA",
    },
    skills: [
      { name: "Python", level: "Advanced", isRequired: true },
      { name: "Machine Learning", level: "Advanced", isRequired: true },
      { name: "SQL", level: "Intermediate", isRequired: true },
      { name: "TensorFlow", level: "Intermediate", isRequired: false },
    ],
    experienceLevel: "Mid Level",
    minimumExperience: 3,
    education: {
      level: "Master's",
      field: "Data Science",
    },
    salary: {
      min: 100000,
      max: 150000,
      currency: "USD",
      period: "yearly",
    },
    benefits: [
      "Health Insurance",
      "401k",
      "Paid Time Off",
      "Professional Development",
      "Stock Options",
    ],
    category: "Technology",
    tags: ["datascience", "machinelearning", "python", "analytics"],
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: "active",
  },
];

// Function to create users
async function createUsers() {
  console.log("Creating users...");
  const createdUsers = [];

  for (const userData of sampleUsers) {
    try {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.firstName} ${user.lastName}`);
    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error.message);
    }
  }

  return createdUsers;
}

// Function to create connections between users
async function createConnections(users) {
  console.log("Creating connections...");

  const connections = [
    { from: 0, to: 1, status: "accepted" },
    { from: 0, to: 2, status: "accepted" },
    { from: 1, to: 3, status: "accepted" },
    { from: 2, to: 4, status: "accepted" },
    { from: 0, to: 3, status: "pending" },
    { from: 1, to: 4, status: "pending" },
  ];

  for (const connection of connections) {
    try {
      const fromUser = users[connection.from];
      const toUser = users[connection.to];

      if (fromUser && toUser) {
        // Add connection to fromUser
        fromUser.connections.push({
          user: toUser._id,
          status: connection.status,
          connectedAt: new Date(),
        });
        await fromUser.save();

        // Add connection to toUser (if accepted)
        if (connection.status === "accepted") {
          toUser.connections.push({
            user: fromUser._id,
            status: "accepted",
            connectedAt: new Date(),
          });
          await toUser.save();
        }

        console.log(
          `Created ${connection.status} connection: ${fromUser.firstName} -> ${toUser.firstName}`
        );
      }
    } catch (error) {
      console.error("Error creating connection:", error.message);
    }
  }
}

// Function to create posts
async function createPosts(users) {
  console.log("Creating posts...");
  const createdPosts = [];

  for (let i = 0; i < samplePosts.length; i++) {
    try {
      const postData = {
        ...samplePosts[i],
        author: users[i % users.length]._id,
      };

      const post = new Post(postData);
      await post.save();
      createdPosts.push(post);
      console.log(`Created post by ${users[i % users.length].firstName}`);
    } catch (error) {
      console.error("Error creating post:", error.message);
    }
  }

  return createdPosts;
}

// Function to create comments on posts
async function createComments(posts, users) {
  console.log("Creating comments...");

  const sampleComments = [
    "Great work! The documentation tip is spot on.",
    "I've been using microservices for 2 years now. The main challenge is managing distributed data consistency.",
    "Congratulations! Hard work pays off.",
    "This is exactly what I needed! Thanks for sharing.",
    "I use the Pomodoro technique - 25 minutes focused work, then 5-minute breaks.",
  ];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments per post

    for (let j = 0; j < numComments; j++) {
      try {
        const commentUser = users[Math.floor(Math.random() * users.length)];
        const commentContent =
          sampleComments[Math.floor(Math.random() * sampleComments.length)];

        post.comments.push({
          author: commentUser._id,
          content: commentContent,
          createdAt: new Date(),
        });

        await post.save();
        console.log(
          `Added comment to post ${i + 1} by ${commentUser.firstName}`
        );
      } catch (error) {
        console.error("Error creating comment:", error.message);
      }
    }
  }
}

// Function to add likes to posts
async function addPostLikes(posts, users) {
  console.log("Adding likes to posts...");

  for (const post of posts) {
    const numLikes = Math.floor(Math.random() * 4) + 2; // 2-5 likes per post

    for (let i = 0; i < numLikes; i++) {
      try {
        const likeUser = users[Math.floor(Math.random() * users.length)];

        // Check if user already liked the post
        const alreadyLiked = post.likes.some(
          (like) => like.user.toString() === likeUser._id.toString()
        );

        if (!alreadyLiked) {
          post.likes.push({
            user: likeUser._id,
            likedAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Error adding like:", error.message);
      }
    }

    try {
      await post.save();
      console.log(`Added ${post.likes.length} likes to post by ${post.author}`);
    } catch (error) {
      console.error("Error saving post likes:", error.message);
    }
  }
}

// Function to create jobs
async function createJobs(users) {
  console.log("Creating jobs...");
  const createdJobs = [];

  // Get employer users
  const employers = users.filter((user) => user.accountType === "both");

  for (let i = 0; i < sampleJobs.length; i++) {
    try {
      const jobData = {
        ...sampleJobs[i],
        employer: employers[i % employers.length]._id,
        company: {
          name:
            employers[i % employers.length].companyInfo?.name || "Tech Company",
          website:
            employers[i % employers.length].companyInfo?.website ||
            "https://example.com",
          size: employers[i % employers.length].companyInfo?.size || "51-200",
          industry:
            employers[i % employers.length].companyInfo?.industry ||
            "Technology",
        },
      };

      const job = new Job(jobData);
      await job.save();
      createdJobs.push(job);
      console.log(
        `Created job: ${job.title} by ${
          employers[i % employers.length].firstName
        }`
      );
    } catch (error) {
      console.error("Error creating job:", error.message);
    }
  }

  return createdJobs;
}

// Function to create job applications
async function createJobApplications(jobs, users) {
  console.log("Creating job applications...");

  // Get job seeker users
  const jobSeekers = users.filter(
    (user) => user.accountType === "job_seeker" || user.accountType === "both"
  );

  for (const job of jobs) {
    const numApplications = Math.floor(Math.random() * 3) + 1; // 1-3 applications per job

    for (let i = 0; i < numApplications; i++) {
      try {
        const applicant =
          jobSeekers[Math.floor(Math.random() * jobSeekers.length)];

        // Check if user already applied
        const alreadyApplied = job.applications.some(
          (app) => app.applicant.toString() === applicant._id.toString()
        );

        if (!alreadyApplied) {
          const applicationStatuses = [
            "pending",
            "reviewing",
            "shortlisted",
            "rejected",
          ];
          const randomStatus =
            applicationStatuses[
              Math.floor(Math.random() * applicationStatuses.length)
            ];

          job.applications.push({
            applicant: applicant._id,
            appliedAt: new Date(),
            status: randomStatus,
            coverLetter: `I'm excited to apply for the ${job.title} position. I believe my skills and experience align perfectly with your requirements.`,
            expectedSalary:
              Math.floor(Math.random() * (job.salary.max - job.salary.min)) +
              job.salary.min,
          });

          await job.save();
          console.log(
            `Created application for ${job.title} by ${applicant.firstName} (${randomStatus})`
          );
        }
      } catch (error) {
        console.error("Error creating job application:", error.message);
      }
    }
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Job.deleteMany({});
    console.log("Cleared existing data");

    // Create users
    const users = await createUsers();

    // Create connections between users
    await createConnections(users);

    // Create posts
    const posts = await createPosts(users);

    // Create comments on posts
    await createComments(posts, users);

    // Add likes to posts
    await addPostLikes(posts, users);

    // Create jobs
    const jobs = await createJobs(users);

    // Create job applications
    await createJobApplications(jobs, users);

    console.log("\n✅ Database seeding completed successfully!");
    console.log(`📊 Created ${users.length} users`);
    console.log(`📝 Created ${posts.length} posts`);
    console.log(`💼 Created ${jobs.length} jobs`);
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
