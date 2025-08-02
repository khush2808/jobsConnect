import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyApplications } from "../store/jobsSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/Card";
import {
  Briefcase,
  Clock,
  MapPin,
  DollarSign,
  Filter,
  Search,
  Eye,
  FileText,
} from "lucide-react";

function Applications() {
  const dispatch = useDispatch();
  const { myApplications, isLoading, error } = useSelector(
    (state) => state.jobs
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    dispatch(fetchMyApplications());
  }, [dispatch]);

  const filteredApplications = myApplications?.filter((application) => {
    const matchesSearch =
      application.job?.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.job?.employer?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      application.job?.employer?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || application.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...(filteredApplications || [])].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.appliedAt) - new Date(a.appliedAt);
      case "oldest":
        return new Date(a.appliedAt) - new Date(b.appliedAt);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "interview":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    const min = salary.min?.toLocaleString();
    const max = salary.max?.toLocaleString();
    const currency = salary.currency || "USD";

    if (min && max) {
      return `$${min} - $${max} ${currency}`;
    } else if (min) {
      return `$${min}+ ${currency}`;
    }
    return "Not specified";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-2">
          Track your job applications and their status
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error loading applications</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="interview">Interview</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="status">By Status</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setSortBy("recent");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {sortedApplications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No applications found</h3>
            <p className="text-muted-foreground">
              {myApplications?.length === 0
                ? "You haven't applied to any jobs yet"
                : "No applications match your current filters"}
            </p>
            {myApplications?.length === 0 && (
              <Button
                className="mt-4"
                onClick={() => (window.location.href = "/jobs")}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Jobs
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedApplications.map((application, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        {application.job?.title}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                        {application.job?.jobType}
                      </span>
                    </div>

                    <p className="text-muted-foreground mb-3">
                      {application.job?.employer?.firstName}{" "}
                      {application.job?.employer?.lastName}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {application.job?.workLocation} •{" "}
                        {application.job?.location?.city ||
                          "Location not specified"}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatSalary(application.job?.salary)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimeAgo(application.appliedAt)}
                      </div>
                    </div>

                    {application.coverLetter && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">
                          Cover Letter:
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    {application.expectedSalary && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">
                          Expected Salary:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${application.expectedSalary.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {myApplications?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Application Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{myApplications.length}</p>
                <p className="text-sm text-muted-foreground">
                  Total Applications
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    myApplications.filter((app) => app.status === "pending")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {
                    myApplications.filter((app) => app.status === "accepted")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {
                    myApplications.filter((app) => app.status === "interview")
                      .length
                  }
                </p>
                <p className="text-sm text-muted-foreground">Interviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Applications;
