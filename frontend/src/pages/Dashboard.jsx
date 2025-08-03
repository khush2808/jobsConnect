import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../store/jobsSlice";
import { fetchFeed } from "../store/postsSlice";
import { fetchConnections } from "../store/connectionsSlice";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import {
  Briefcase,
  Users,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  Plus,
  Search,
  Filter,
} from "lucide-react";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { jobs } = useSelector((state) => state.jobs);
  const { feed } = useSelector((state) => state.posts);
  const { connections } = useSelector((state) => state.connections);

  const [recentJobs, setRecentJobs] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalConnections: 0,
    totalPosts: 0,
    profileCompletion: 0,
  });

  useEffect(() => {
    // Fetch data for dashboard
    dispatch(fetchJobs({ limit: 5 }));
    dispatch(fetchFeed({ limit: 3 }));
    dispatch(fetchConnections());
  }, [dispatch]);

  useEffect(() => {
    // Calculate stats
    if (user) {
      const profileFields = [
        user.firstName,
        user.lastName,
        user.bio,
        user.location?.city,
        user.skills?.length > 0,
        user.resume,
      ];
      const completedFields = profileFields.filter(Boolean).length;
      const profileCompletion = Math.round(
        (completedFields / profileFields.length) * 100
      );

      setStats({
        totalJobs: jobs.length,
        totalConnections: connections.length,
        totalPosts: feed.length,
        profileCompletion,
      });
    }
  }, [user, jobs, connections, feed]);

  useEffect(() => {
    // Filter and set recent jobs
    const recent = jobs.slice(0, 5);
    setRecentJobs(recent);

    // Generate recommended jobs based on user skills
    if (user?.skills && jobs.length > 0) {
      const userSkills = (user.skills || []).map((skill) =>
        skill.name.toLowerCase()
      );
      const recommended = jobs
        .filter((job) =>
          job.skills?.some((skill) =>
            userSkills.includes(skill.name.toLowerCase())
          )
        )
        .slice(0, 3);
      setRecommendedJobs(recommended);
    }
  }, [jobs, user]);

  useEffect(() => {
    // Set recent posts
    setRecentPosts(feed.slice(0, 3));
  }, [feed]);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getProfileCompletionColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's what's happening in your professional network
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate("/jobs/post")}>
            <Plus className="h-4 w-4 mr-2" />
            Post a Job
          </Button>
          <Button variant="outline" onClick={() => navigate("/feed")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Available Jobs
                </p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Connections
                </p>
                <p className="text-2xl font-bold">{stats.totalConnections}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Recent Posts
                </p>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Profile Completion
                </p>
                <p
                  className={`text-2xl font-bold ${getProfileCompletionColor(
                    stats.profileCompletion
                  )}`}
                >
                  {stats.profileCompletion}%
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {stats.profileCompletion}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Jobs</CardTitle>
            <CardDescription>
              Jobs matching your skills and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recommendedJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">
                  No recommendations yet
                </h3>
                <p className="text-muted-foreground">
                  Add more skills to your profile to get personalized job
                  recommendations
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => navigate("/profile")}
                >
                  Update Profile
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {job.company?.name || "Company"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {job.salary?.min && job.salary?.max
                              ? `${job.salary.min}-${job.salary.max}`
                              : "Salary not specified"}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {job.jobType}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/jobs")}
                >
                  View All Jobs
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest posts from your network</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No recent activity</h3>
                <p className="text-muted-foreground">
                  Connect with more professionals to see their updates
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => navigate("/connections")}
                >
                  Find Connections
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post._id} className="p-4 border rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        {post.author?.profilePicture ? (
                          <img
                            src={post.author.profilePicture.url}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-foreground font-semibold text-sm">
                            {post.author?.firstName?.[0]}
                            {post.author?.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {post.author?.firstName} {post.author?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{post.content}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {post.likesCount || 0}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {post.commentsCount || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/feed")}
                >
                  View All Posts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate("/jobs")}
            >
              <Search className="h-6 w-6 mb-2" />
              <span className="text-sm">Search Jobs</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate("/connections")}
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">My Network</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate("/profile")}
            >
              <Briefcase className="h-6 w-6 mb-2" />
              <span className="text-sm">Update Profile</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col"
              onClick={() => navigate("/applications")}
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">My Applications</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
