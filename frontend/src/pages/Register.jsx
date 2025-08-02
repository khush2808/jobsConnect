import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { register, clearError } from "../store/authSlice";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import { Eye, EyeOff } from "lucide-react";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "job_seeker",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) dispatch(clearError());

    // Clear validation errors when user types
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      errors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      errors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!formData.accountType) {
      errors.accountType = "Please select an account type";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await dispatch(
      register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        accountType: formData.accountType,
      })
    );

    if (result.type === "auth/register/fulfilled") {
      navigate("/dashboard");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Join JobConnect to find your next opportunity or hire great talent
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
              {error}
            </div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                className={
                  validationErrors.firstName ? "border-destructive" : ""
                }
                required
              />
              {validationErrors.firstName && (
                <p className="text-sm text-destructive">
                  {validationErrors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                className={
                  validationErrors.lastName ? "border-destructive" : ""
                }
                required
              />
              {validationErrors.lastName && (
                <p className="text-sm text-destructive">
                  {validationErrors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className={validationErrors.email ? "border-destructive" : ""}
              required
            />
            {validationErrors.email && (
              <p className="text-sm text-destructive">
                {validationErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className={
                  validationErrors.password
                    ? "border-destructive pr-10"
                    : "pr-10"
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-sm text-destructive">
                {validationErrors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm Password</label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={
                  validationErrors.confirmPassword
                    ? "border-destructive pr-10"
                    : "pr-10"
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <p className="text-sm text-destructive">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Account Type</label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring ${
                validationErrors.accountType
                  ? "border-destructive"
                  : "border-input"
              }`}
              required
            >
              <option value="job_seeker">Job Seeker</option>
              <option value="employer">Employer</option>
            </select>
            {validationErrors.accountType && (
              <p className="text-sm text-destructive">
                {validationErrors.accountType}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formData.accountType === "job_seeker"
                ? "Find and apply to job opportunities"
                : "Post jobs and hire talented professionals"}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default Register;
