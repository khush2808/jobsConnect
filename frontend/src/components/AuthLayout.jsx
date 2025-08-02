import React from "react";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">JobConnect</h1>
          <p className="text-muted-foreground mt-2">
            Your AI-powered career companion
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
