import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchJobById, applyToJob } from "../store/jobsSlice";
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
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  Building,
  Calendar,
  Users,
  ArrowLeft,
  Send,
} from "lucide-react";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentJob, isLoading, error } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [showApplication, setShowApplication] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    expectedSalary: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchJobById(id));
    }
  }, [dispatch, id]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applicationData.coverLetter.trim()) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        applyToJob({
          jobId: id,
          applicationData: {
            coverLetter: applicationData.coverLetter,
            expectedSalary: applicationData.expectedSalary
              ? parseInt(applicationData.expectedSalary)
              : undefined,
          },
        })
      );
      setShowApplication(false);
      setApplicationData({ coverLetter: "", expectedSalary: "" });
      // Show success message
      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Failed to apply:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error loading job details</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentJob) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="font-medium">Job not found</p>
              <p className="text-sm text-muted-foreground">
                The job you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" onClick={() => navigate("/jobs")}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{currentJob.title}</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {currentJob.company?.name ||
                      `${currentJob.employer?.firstName} ${currentJob.employer?.lastName}`}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {currentJob.jobType}
                  </span>
                  <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {currentJob.experienceLevel}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Job Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentJob.workLocation} •{" "}
                    {currentJob.location?.city || "Location not specified"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formatSalary(currentJob.salary)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentJob.experienceLevel}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{currentJob.category}</span>
                </div>
              </div>

              {/* Company Info */}
              {currentJob.company && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">About the Company</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Industry:</span>
                      <p>{currentJob.company.industry}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                      <p>{currentJob.company.size}</p>
                    </div>
                    {currentJob.company.website && (
                      <div>
                        <span className="text-muted-foreground">Website:</span>
                        <a
                          href={currentJob.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Visit website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{currentJob.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {currentJob.requirements && currentJob.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {currentJob.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {currentJob.skills && currentJob.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentJob.skills.map((skill, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${
                        skill.required
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {skill.name}
                      {skill.proficiency && ` (${skill.proficiency})`}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {currentJob.benefits && currentJob.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {currentJob.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Apply Card */}
          <Card>
            <CardHeader>
              <CardTitle>Apply for this position</CardTitle>
              <CardDescription>
                Submit your application for this job
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showApplication ? (
                <Button
                  className="w-full"
                  onClick={() => setShowApplication(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              ) : (
                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Cover Letter</label>
                    <textarea
                      value={applicationData.coverLetter}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          coverLetter: e.target.value,
                        })
                      }
                      placeholder="Tell us why you're a great fit for this position..."
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Expected Salary (optional)
                    </label>
                    <Input
                      type="number"
                      value={applicationData.expectedSalary}
                      onChange={(e) =>
                        setApplicationData({
                          ...applicationData,
                          expectedSalary: e.target.value,
                        })
                      }
                      placeholder="Enter your expected salary"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={
                        !applicationData.coverLetter.trim() || isSubmitting
                      }
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowApplication(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Job Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Posted</span>
                <span className="text-sm">
                  {new Date(currentJob.createdAt).toLocaleDateString()}
                </span>
              </div>
              {currentJob.applicationDeadline && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Application Deadline
                  </span>
                  <span className="text-sm">
                    {new Date(
                      currentJob.applicationDeadline
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Applications
                </span>
                <span className="text-sm">
                  {currentJob.applications?.length || 0} applied
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
