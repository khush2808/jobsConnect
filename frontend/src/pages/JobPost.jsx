import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createJob } from "../store/jobsSlice";
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
  MapPin,
  DollarSign,
  Building,
  Plus,
  X,
  Upload,
  ArrowLeft,
} from "lucide-react";

function JobPost() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.jobs);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: [""],
    skills: [],
    jobType: "Full-time",
    workLocation: "Remote",
    experienceLevel: "Mid Level",
    category: "Technology",
    location: {
      city: "",
      state: "",
      country: "",
    },
    salary: {
      min: "",
      max: "",
      currency: "USD",
    },
    company: {
      name: "",
      industry: "",
      size: "",
      website: "",
    },
    benefits: [""],
    applicationDeadline: "",
  });

  const [newSkill, setNewSkill] = useState({
    name: "",
    required: true,
    proficiency: "Intermediate",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: null });
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: { ...formData[parent], [field]: value },
    });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;

    setFormData({
      ...formData,
      skills: [...formData.skills, { ...newSkill }],
    });
    setNewSkill({ name: "", required: true, proficiency: "Intermediate" });
  };

  const handleRemoveSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Job title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Job description is required";
    }

    if (!formData.company.name.trim()) {
      errors.companyName = "Company name is required";
    }

    if (!formData.location.city.trim()) {
      errors.city = "City is required";
    }

    if (!formData.salary.min || !formData.salary.max) {
      errors.salary = "Salary range is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Clean up empty array items
      const cleanFormData = {
        ...formData,
        requirements: formData.requirements.filter((req) => req.trim()),
        benefits: formData.benefits.filter((benefit) => benefit.trim()),
      };

      await dispatch(createJob(cleanFormData));
      navigate("/jobs/my/posted");
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Jobs
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Post a Job</h1>
          <p className="text-muted-foreground mt-2">
            Create a new job posting to attract talented candidates
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error creating job</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Job Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Essential details about the position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Job Title *</label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="e.g., Senior Frontend Developer"
                    className={
                      validationErrors.title ? "border-destructive" : ""
                    }
                    required
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Job Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Describe the role, responsibilities, and what makes this position exciting..."
                    className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none ${
                      validationErrors.description ? "border-destructive" : ""
                    }`}
                    rows={6}
                    required
                  />
                  {validationErrors.description && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Job Type</label>
                    <select
                      value={formData.jobType}
                      onChange={(e) => handleChange("jobType", e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Work Location</label>
                    <select
                      value={formData.workLocation}
                      onChange={(e) =>
                        handleChange("workLocation", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Remote">Remote</option>
                      <option value="On-site">On-site</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Experience Level
                    </label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) =>
                        handleChange("experienceLevel", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
                <CardDescription>
                  List the key requirements for this position
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      type="text"
                      value={requirement}
                      onChange={(e) =>
                        handleArrayChange("requirements", index, e.target.value)
                      }
                      placeholder="e.g., Bachelor's degree in Computer Science"
                      className="flex-1"
                    />
                    {formData.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("requirements", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem("requirements")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
                <CardDescription>
                  Specify the technical and soft skills needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      value={newSkill.name}
                      onChange={(e) =>
                        setNewSkill({ ...newSkill, name: e.target.value })
                      }
                      placeholder="Skill name"
                    />
                  </div>
                  <div>
                    <select
                      value={newSkill.proficiency}
                      onChange={(e) =>
                        setNewSkill({
                          ...newSkill,
                          proficiency: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                  </div>
                  <div>
                    <Button onClick={handleAddSkill} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Skill
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 px-3 py-1 bg-secondary text-secondary-foreground rounded-full"
                    >
                      <span className="text-sm font-medium">{skill.name}</span>
                      <span className="text-xs">({skill.proficiency})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Benefits & Perks</CardTitle>
                <CardDescription>
                  List the benefits and perks offered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      type="text"
                      value={benefit}
                      onChange={(e) =>
                        handleArrayChange("benefits", index, e.target.value)
                      }
                      placeholder="e.g., Health Insurance, 401k, Remote Work"
                      className="flex-1"
                    />
                    {formData.benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("benefits", index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem("benefits")}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Company Name *</label>
                  <Input
                    type="text"
                    value={formData.company.name}
                    onChange={(e) =>
                      handleNestedChange("company", "name", e.target.value)
                    }
                    placeholder="Your company name"
                    className={
                      validationErrors.companyName ? "border-destructive" : ""
                    }
                    required
                  />
                  {validationErrors.companyName && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.companyName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">Industry</label>
                  <Input
                    type="text"
                    value={formData.company.industry}
                    onChange={(e) =>
                      handleNestedChange("company", "industry", e.target.value)
                    }
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Company Size</label>
                  <select
                    value={formData.company.size}
                    onChange={(e) =>
                      handleNestedChange("company", "size", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    type="url"
                    value={formData.company.website}
                    onChange={(e) =>
                      handleNestedChange("company", "website", e.target.value)
                    }
                    placeholder="https://company.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">City *</label>
                  <Input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) =>
                      handleNestedChange("location", "city", e.target.value)
                    }
                    placeholder="e.g., San Francisco"
                    className={
                      validationErrors.city ? "border-destructive" : ""
                    }
                    required
                  />
                  {validationErrors.city && (
                    <p className="text-sm text-destructive mt-1">
                      {validationErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">State</label>
                  <Input
                    type="text"
                    value={formData.location.state}
                    onChange={(e) =>
                      handleNestedChange("location", "state", e.target.value)
                    }
                    placeholder="e.g., CA"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Country</label>
                  <Input
                    type="text"
                    value={formData.location.country}
                    onChange={(e) =>
                      handleNestedChange("location", "country", e.target.value)
                    }
                    placeholder="e.g., USA"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Range</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Minimum</label>
                    <Input
                      type="number"
                      value={formData.salary.min}
                      onChange={(e) =>
                        handleNestedChange("salary", "min", e.target.value)
                      }
                      placeholder="80000"
                      className={
                        validationErrors.salary ? "border-destructive" : ""
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Maximum</label>
                    <Input
                      type="number"
                      value={formData.salary.max}
                      onChange={(e) =>
                        handleNestedChange("salary", "max", e.target.value)
                      }
                      placeholder="120000"
                      className={
                        validationErrors.salary ? "border-destructive" : ""
                      }
                      required
                    />
                  </div>
                </div>
                {validationErrors.salary && (
                  <p className="text-sm text-destructive">
                    {validationErrors.salary}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Application Deadline */}
            <Card>
              <CardHeader>
                <CardTitle>Application Deadline</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) =>
                    handleChange("applicationDeadline", e.target.value)
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card>
              <CardContent className="p-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Job..." : "Post Job"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

export default JobPost;
