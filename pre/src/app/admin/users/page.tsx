"use client";

// Extend session type for this component
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      emailVerified?: boolean;
    };
  }
}

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Users, 
  Shield, 
  Clock, 
  Mail, 
  Globe, 
  Crown, 
  Calendar, 
  Activity, 
  CheckCircle, 
  XCircle, 
  User, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Award,
  Database,
  Network,
  Smartphone,
  Monitor,
  Gem
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  ipAddress?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  totalPracticeAttempts: number;
  totalCompetitionAttempts: number;
  totalGemsEarned: number;
  currentGemsBalance: number;
  isHardcoded?: boolean;
  wallet?: {
    id: string;
    gemsBalance: number;
  };
}

interface UserDetails {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    ipAddress?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
    wallet?: {
      id: string;
      gemsBalance: number;
    };
    practiceAttempts: any[];
    attempts: any[];
    competitionEntries: any[];
  };
  stats: {
    totalPracticeAttempts: number;
    totalCompetitionAttempts: number;
    totalGemsEarned: number;
    averageScore: number;
  };
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    emailVerified: false,
    role: "user"
  });



  // Handle redirect when not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session && ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      return;
    }

    fetchUsers();
  }, [session, status, currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUserDetails = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user details");

      const data = await response.json();
      setSelectedUser(data);
      setShowUserDetails(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditForm({
      name: user.name || "",
      email: user.email,
      emailVerified: user.emailVerified,
      role: user.role
    });
    setSelectedUser(null); // Reset selectedUser since we're using User type for edit
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser?.user.id,
          ...editForm
        })
      });

      if (!response.ok) throw new Error("Failed to update user");

      setShowEditModal(false);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Failed to delete user");

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleToggleEmailVerification = async (user: User) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          emailVerified: !user.emailVerified
        })
      });

      if (!response.ok) throw new Error("Failed to update user");

      // Update the user in the local state
      setUsers(users.map(u =>
        u.id === user.id
          ? { ...u, emailVerified: !u.emailVerified }
          : u
      ));

      // If this user is currently selected in details modal, update it too
      if (selectedUser && selectedUser.user.id === user.id) {
        setSelectedUser({
          ...selectedUser,
          user: {
            ...selectedUser.user,
            emailVerified: !selectedUser.user.emailVerified
          }
        });
      }
    } catch (error) {
      console.error("Error toggling email verification:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || (status === "authenticated" && (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")))) {
    return null;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-13">
          Manage all registered users and their accounts
        </p>
      </div>

      {/* Stats Cards - 2x2 Grid Layout */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-8">
        {/* Total Users - Top Left */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Users</CardTitle>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Registered accounts</p>
          </CardContent>
        </Card>

        {/* Verified Users - Top Right */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Verified Users</CardTitle>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {users.filter(user => user.emailVerified).length}
            </div>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Email verified</p>
          </CardContent>
        </Card>

        {/* Active Users - Bottom Left */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Users</CardTitle>
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {users.filter(user => {
                const lastActivity = new Date(user.updatedAt);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return lastActivity > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">This week</p>
          </CardContent>
        </Card>

        {/* Total Gems - Bottom Right */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Gems</CardTitle>
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Gem className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {users.reduce((sum, user) => sum + user.currentGemsBalance, 0).toFixed(3)}
            </div>
            <p className="text-xs text-orange-600/70 dark:text-orange-400/70">All users combined</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Users</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        Name
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        Email
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        Status
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        IP Address
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-gray-500" />
                        Role
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Gem className="h-4 w-4 text-gray-500" />
                        Gems
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        Joined
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-gray-500" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={`border-b border-gray-100 dark:border-gray-800 ${user.id === "admin" ? "bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10" : ""}`}>
                      <td className="py-3 px-4">
                        <div className="font-medium flex items-center gap-2">
                          {user.name || "N/A"}
                          {user.id === "admin" && (
                            <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                              System Admin
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {user.emailVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={user.emailVerified ? "default" : "secondary"}>
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                          {user.id !== "admin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleEmailVerification(user)}
                              className="text-xs"
                              title={user.emailVerified ? "Unverify Email" : "Verify Email"}
                            >
                              {user.emailVerified ? "Unverify" : "Verify"}
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Network className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-500">{user.ipAddress || "N/A"}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {(user.role === "admin" || user.role === "ADMIN") ? (
                            <Crown className="h-4 w-4 text-orange-500" />
                          ) : (
                            <User className="h-4 w-4 text-blue-500" />
                          )}
                          <Badge variant={(user.role === "admin" || user.role === "ADMIN") ? "destructive" : "outline"}>
                            {user.role}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Gem className="h-4 w-4 text-orange-500" />
                          <div className="text-sm font-medium text-orange-600">
                            {user.currentGemsBalance.toFixed(3)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div className="text-sm text-gray-500">
                            {user.id === "admin" ? "System" : new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUserDetails(user)}
                            className="text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            title="View User Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.id !== "admin" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                title="Edit User"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {user.id === "admin" && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              Read Only
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold">User Details</h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowUserDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              {selectedUser.user.id === "admin" && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-800 dark:text-orange-200">System Administrator</span>
                  </div>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This is a hardcoded system administrator account. It cannot be modified or deleted.
                  </p>
                </div>
              )}
              <div>
                <label className="font-medium">Name:</label>
                <p>{selectedUser.user.name || "N/A"}</p>
              </div>
              <div>
                <label className="font-medium">Email:</label>
                <p>{selectedUser.user.email}</p>
              </div>
              <div>
                <label className="font-medium">IP Address:</label>
                <p>{selectedUser.user.ipAddress || "N/A"}</p>
              </div>
              <div>
                <label className="font-medium">Role:</label>
                <p className="flex items-center gap-2">
                  {selectedUser.user.role}
                  {selectedUser.user.id === "admin" && (
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                      System
                    </Badge>
                  )}
                </p>
              </div>
              <div>
                <label className="font-medium">Status:</label>
                <p>{selectedUser.user.emailVerified ? "Verified" : "Unverified"}</p>
              </div>
              <div>
                <label className="font-medium">Joined:</label>
                <p>{selectedUser.user.id === "admin" ? "System Account" : new Date(selectedUser.user.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="font-medium">Last Updated:</label>
                <p>{selectedUser.user.id === "admin" ? "System Account" : new Date(selectedUser.user.updatedAt).toLocaleString()}</p>
              </div>
              {selectedUser.user.id !== "admin" && (
                <>
                  <div>
                    <label className="font-medium">Practice Attempts:</label>
                    <p>{selectedUser.stats.totalPracticeAttempts}</p>
                  </div>
                  <div>
                    <label className="font-medium">Competition Attempts:</label>
                    <p>{selectedUser.stats.totalCompetitionAttempts}</p>
                  </div>
                  <div>
                    <label className="font-medium">Total Gems Earned:</label>
                    <p>{selectedUser.stats.totalGemsEarned.toFixed(3)}</p>
                  </div>
                  <div>
                    <label className="font-medium">Current Gems Balance:</label>
                    <p>{selectedUser.user.wallet?.gemsBalance.toFixed(3) || "0.000"}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Edit className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-xl font-bold">Edit User</h2>
              </div>
              <Button
                variant="ghost"
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailVerified"
                  checked={editForm.emailVerified}
                  onChange={(e) => setEditForm({ ...editForm, emailVerified: e.target.checked })}
                />
                <label htmlFor="emailVerified" className="text-sm font-medium">
                  Email Verified
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 