import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyApplications, fetchMyJobs } from "../store/jobsSlice";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  Briefcase,
  Users,
  MessageSquare,
  TrendingUp,
  Plus,
  FileText,
  Clock,
} from "lucide-react";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { myApplications, myJobs } = useSelector((state) => state.jobs);

  const [stats, setStats] = useState({
    appliedJobs: 0,
    connections: 0,
    messages: 0,
    profileViews: 0,
  });

  useEffect(() => {
    // Fetch user's applications and posted jobs
    if (isAuthenticated && user) {
      dispatch(fetchMyApplications());
      if (user.accountType === "employer") {
        dispatch(fetchMyJobs());
      }
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Calculate stats from real data
    setStats({
      appliedJobs: myApplications?.length || 0,
      connections: user?.connections?.length || 0,
      messages: 0, // TODO: Implement messages feature
      profileViews: user?.profileViews || 0,
    });
  }, [myApplications, user]);

  const getRecentActivity = () => {
    const activities = [];

    // Add recent applications
    if (myApplications?.length > 0) {
      const recentApplications = myApplications.slice(0, 3);
      recentApplications.forEach((application) => {
        activities.push({
          type: "application",
          title: `Applied to ${application.job?.title || "a job"}`,
          time: application.appliedAt,
          status: application.status,
        });
      });
    }

    // Add recent job postings (for employers)
    if (user?.accountType === "employer" && myJobs?.length > 0) {
      const recentJobs = myJobs.slice(0, 2);
      recentJobs.forEach((job) => {
        activities.push({
          type: "job_posted",
          title: `Posted job: ${job.title}`,
          time: job.createdAt,
          applications: job.applications?.length || 0,
        });
      });
    }

    // Sort by time and return most recent
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening in your professional world today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-md">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Applied Jobs
                </p>
                <p className="text-2xl font-bold">{stats.appliedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-md">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Connections
                </p>
                <p className="text-2xl font-bold">{stats.connections}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-md">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Messages
                </p>
                <p className="text-2xl font-bold">{stats.messages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary/10 rounded-md">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Profile Views
                </p>
                <p className="text-2xl font-bold">{stats.profileViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start"
              onClick={() => navigate("/jobs")}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Browse Jobs
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/connections")}
            >
              <Users className="mr-2 h-4 w-4" />
              Find Connections
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/feed")}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Create Post
            </Button>
            {user?.accountType === "employer" && (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/jobs/post")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Post a Job
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest interactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecentActivity().length > 0 ? (
                getRecentActivity().map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.time)}
                        {activity.status && ` • ${activity.status}`}
                        {activity.applications &&
                          ` • ${activity.applications} applications`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    No recent activity
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Start by browsing jobs or creating a post
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications (for job seekers) */}
      {user?.accountType === "job_seeker" && myApplications?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Track your recent job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myApplications.slice(0, 3).map((application, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{application.job?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {application.job?.employer?.firstName}{" "}
                      {application.job?.employer?.lastName}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        application.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : application.status === "accepted"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {application.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(application.appliedAt)}
                    </span>
                  </div>
                </div>
              ))}
              {myApplications.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/jobs/applications")}
                >
                  View All Applications
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Job Postings (for employers) */}
      {user?.accountType === "employer" && myJobs?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>Manage your posted jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myJobs.slice(0, 3).map((job, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {job.applications?.length || 0} applications
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(job.createdAt)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {myJobs.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/jobs/my/posted")}
                >
                  View All Jobs
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Dashboard;
