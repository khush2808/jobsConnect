import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchConnections, 
  fetchPendingRequests, 
  fetchSuggestedConnections,
  sendConnectionRequest,
  respondToConnectionRequest,
  removeConnection
} from "../store/connectionsSlice";
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
  Users,
  UserPlus,
  Search,
  Filter,
  MessageSquare,
  MapPin,
  Briefcase,
  Plus,
  Check,
  X,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";

function Connections() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    connections, 
    pendingRequests, 
    suggestedConnections, 
    isLoading, 
    error 
  } = useSelector((state) => state.connections);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("connections");

  useEffect(() => {
    dispatch(fetchConnections());
    dispatch(fetchPendingRequests());
    dispatch(fetchSuggestedConnections());
  }, [dispatch]);

  const handleConnect = async (userId) => {
    try {
      await dispatch(sendConnectionRequest(userId));
    } catch (error) {
      console.error("Failed to send connection request:", error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await dispatch(respondToConnectionRequest({ requestId, status: "accepted" }));
    } catch (error) {
      console.error("Failed to accept connection request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await dispatch(respondToConnectionRequest({ requestId, status: "rejected" }));
    } catch (error) {
      console.error("Failed to reject connection request:", error);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      await dispatch(removeConnection(connectionId));
    } catch (error) {
      console.error("Failed to remove connection:", error);
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

  const filteredConnections = connections.filter((connection) => {
    const matchesSearch = connection.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         connection.user.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || connection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: "connections", name: "My Connections", count: connections.length },
    { id: "pending", name: "Pending Requests", count: pendingRequests.length },
    { id: "suggested", name: "Suggested", count: suggestedConnections.length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Connections</h1>
          <p className="text-muted-foreground mt-2">
            Manage your professional network
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="text-center text-destructive">
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.name}
            <span className="ml-2 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Status</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections List */}
      {activeTab === "connections" && (
        <div className="grid gap-4">
          {filteredConnections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Connections</h3>
                <p className="text-muted-foreground">
                  Start building your network by connecting with other professionals.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConnections.map((connection) => (
              <Card key={connection._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        {connection.user.profilePicture ? (
                          <img
                            src={connection.user.profilePicture.url}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-foreground font-semibold">
                            {connection.user.firstName[0]}{connection.user.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {connection.user.firstName} {connection.user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {connection.user.bio || "No bio available"}
                        </p>
                        {connection.user.location && (
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {connection.user.location.city}, {connection.user.location.country}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveConnection(connection._id)}
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pending Requests */}
      {activeTab === "pending" && (
        <div className="grid gap-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
                <p className="text-muted-foreground">
                  You don't have any pending connection requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        {request.user.profilePicture ? (
                          <img
                            src={request.user.profilePicture.url}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-foreground font-semibold">
                            {request.user.firstName[0]}{request.user.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {request.user.firstName} {request.user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Wants to connect with you
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleAcceptRequest(request._id)}
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRejectRequest(request._id)}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Suggested Connections */}
      {activeTab === "suggested" && (
        <div className="grid gap-4">
          {suggestedConnections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Suggested Connections</h3>
                <p className="text-muted-foreground">
                  We couldn't find any suggested connections for you right now.
                </p>
              </CardContent>
            </Card>
          ) : (
            suggestedConnections.map((suggestion) => (
              <Card key={suggestion._id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        {suggestion.profilePicture ? (
                          <img
                            src={suggestion.profilePicture.url}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-foreground font-semibold">
                            {suggestion.firstName[0]}{suggestion.lastName[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {suggestion.firstName} {suggestion.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.bio || "No bio available"}
                        </p>
                        {suggestion.skills && suggestion.skills.length > 0 && (
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {suggestion.skills.slice(0, 3).map(skill => skill.name).join(", ")}
                            {suggestion.skills.length > 3 && "..."}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleConnect(suggestion._id)}
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Connections;
