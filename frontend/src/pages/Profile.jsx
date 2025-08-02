import React from "react";
import { useSelector } from "react-redux";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Edit, MapPin, Mail, Calendar, Upload } from "lucide-react";

function Profile() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground mt-1">Software Developer</p>

              <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  San Francisco, CA
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {user?.email}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined March 2024
                </div>
              </div>

              <p className="mt-4 text-sm">
                Passionate software developer with 5+ years of experience in
                building scalable web applications. Experienced in React,
                Node.js, and cloud technologies. Always eager to learn new
                technologies and collaborate with amazing teams.
              </p>
            </div>

            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "JavaScript",
              "React",
              "Node.js",
              "Python",
              "AWS",
              "MongoDB",
              "TypeScript",
              "GraphQL",
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            + Add Skills
          </Button>
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <CardTitle>Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <span className="font-bold text-secondary-foreground">TC</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Senior Software Engineer</h4>
                <p className="text-primary">TechCorp Inc.</p>
                <p className="text-sm text-muted-foreground">
                  Jan 2022 - Present • 2 years
                </p>
                <p className="text-sm mt-2">
                  Leading development of microservices architecture and
                  mentoring junior developers. Built scalable APIs serving 1M+
                  daily users.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                <span className="font-bold text-secondary-foreground">ST</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Software Engineer</h4>
                <p className="text-primary">StartupTech</p>
                <p className="text-sm text-muted-foreground">
                  Jun 2020 - Dec 2021 • 1.5 years
                </p>
                <p className="text-sm mt-2">
                  Developed full-stack web applications using React and Node.js.
                  Collaborated with design team to implement responsive user
                  interfaces.
                </p>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            + Add Experience
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default Profile;
