import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "lucide-react";

function Connections() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConnections();
    fetchPendingRequests();
    fetchSuggestedConnections();
  }, []);

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to fetch connections
      // const response = await api.get('/users/connections');
      // setConnections(response.data.data);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      // TODO: Implement API call to fetch pending requests
      // const response = await api.get('/users/connections/pending');
      // setPendingRequests(response.data.data);
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    }
  };

  const fetchSuggestedConnections = async () => {
    try {
      // TODO: Implement API call to fetch suggested connections
      // const response = await api.get('/users/suggested-connections');
      // setSuggestedConnections(response.data.data);
    } catch (error) {
      console.error("Failed to fetch suggested connections:", error);
    }
  };

  const handleConnect = async (userId) => {
    try {
      // TODO: Implement API call to send connection request
      // await api.post(`/users/${userId}/connect`);
      // Refresh suggested connections
      fetchSuggestedConnections();
    } catch (error) {
      console.error("Failed to send connection request:", error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      // TODO: Implement API call to accept connection request
      // await api.put(`/users/connections/${requestId}`, { status: 'accepted' });
      // Refresh connections and pending requests
      fetchConnections();
      fetchPendingRequests();
    } catch (error) {
      console.error("Failed to accept connection request:", error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      // TODO: Implement API call to reject connection request
      // await api.put(`/users/connections/${requestId}`, { status: 'rejected' });
      // Refresh pending requests
      fetchPendingRequests();
    } catch (error) {
      console.error("Failed to reject connection request:", error);
    }
  };

  const filteredConnections = connections.filter((connection) => {
    const matchesSearch =
      connection.user?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      connection.user?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      connection.user?.bio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || connection.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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
        <h1 className="text-3xl font-bold">Connections</h1>
        <p className="text-muted-foreground mt-2">
          Build your professional network
        </p>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Connection Requests</CardTitle>
            <CardDescription>
              Review and respond to connection requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {request.user?.firstName?.charAt(0)}
                        {request.user?.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {request.user?.firstName} {request.user?.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {request.user?.jobTitle || "Professional"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Requested {formatTimeAgo(request.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptRequest(request._id)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request._id)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All Connections</option>
              <option value="accepted">Accepted</option>
              <option value="pending">Pending</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connections List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Connections */}
        <Card>
          <CardHeader>
            <CardTitle>My Connections ({filteredConnections.length})</CardTitle>
            <CardDescription>Your professional network</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredConnections.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No connections yet</h3>
                <p className="text-muted-foreground">
                  Start building your network by connecting with other
                  professionals
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredConnections.map((connection, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">
                          {connection.user?.firstName?.charAt(0)}
                          {connection.user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {connection.user?.firstName}{" "}
                          {connection.user?.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {connection.user?.jobTitle || "Professional"}
                        </p>
                        {connection.user?.location?.city && (
                          <p className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {connection.user.location.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Connections */}
        <Card>
          <CardHeader>
            <CardTitle>Suggested Connections</CardTitle>
            <CardDescription>
              People you might want to connect with
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestedConnections.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No suggestions</h3>
                <p className="text-muted-foreground">
                  We'll suggest connections based on your profile and interests
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestedConnections.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-secondary-foreground font-medium">
                          {suggestion.firstName?.charAt(0)}
                          {suggestion.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {suggestion.firstName} {suggestion.lastName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {suggestion.jobTitle || "Professional"}
                        </p>
                        {suggestion.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {suggestion.skills
                              .slice(0, 2)
                              .map((skill, skillIndex) => (
                                <span
                                  key={skillIndex}
                                  className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                                >
                                  {skill.name}
                                </span>
                              ))}
                            {suggestion.skills.length > 2 && (
                              <span className="px-2 py-1 text-xs text-muted-foreground">
                                +{suggestion.skills.length - 2} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleConnect(suggestion._id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Network Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{connections.length}</p>
              <p className="text-sm text-muted-foreground">Total Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {pendingRequests.length}
              </p>
              <p className="text-sm text-muted-foreground">Pending Requests</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {suggestedConnections.length}
              </p>
              <p className="text-sm text-muted-foreground">Suggested</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {
                  connections.filter((conn) => conn.status === "accepted")
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Connections;
