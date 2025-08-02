import React from "react";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { MessageSquare, Heart, Share, Plus } from "lucide-react";

function Feed() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feed</h1>
          <p className="text-muted-foreground mt-2">
            Stay updated with your professional network
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Create Post Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-medium">U</span>
            </div>
            <div className="flex-1">
              <button className="w-full text-left px-4 py-3 bg-secondary rounded-full text-muted-foreground hover:bg-secondary/80 transition-colors">
                What's on your mind?
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Posts */}
      {[1, 2, 3].map((post) => (
        <Card key={post}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-medium">J</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">John Doe</h4>
                  <span className="text-muted-foreground text-sm">• 2h</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Software Engineer at TechCorp
                </p>

                <div className="mt-3">
                  <p>
                    Just completed an amazing project using React and Node.js!
                    The team's collaboration was outstanding, and I learned so
                    much about scalable architecture. Grateful for the
                    opportunity to work with such talented individuals. 🚀
                  </p>
                </div>

                <div className="flex items-center space-x-6 mt-4 pt-3 border-t">
                  <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">12</span>
                  </button>
                  <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">5</span>
                  </button>
                  <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                    <Share className="h-4 w-4" />
                    <span className="text-sm">2</span>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default Feed;
