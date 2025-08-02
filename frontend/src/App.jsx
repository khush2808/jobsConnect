import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store";
import { initAuth } from "./store/authSlice";

// Layout Components
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";

// Page Components
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

// App Content Component
function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("🚀 App: useEffect triggered, dispatching initAuth");
    dispatch(initAuth());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dispatch from dependency array as it's stable

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <AuthLayout>
                <Login />
              </AuthLayout>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <AuthLayout>
                <Register />
              </AuthLayout>
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:id" element={<JobDetail />} />
          <Route path="feed" element={<Feed />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Main App Component with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
