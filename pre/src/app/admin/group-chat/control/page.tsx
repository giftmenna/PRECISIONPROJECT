"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  Search,
  Users,
  MessageSquare,
  Plus,
  ArrowLeft,
  Ban,
  UserX,
  UserCheck,
  Edit,
  Calendar,
  LogIn
} from "lucide-react";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  is_banned?: boolean;
  is_active?: boolean;
  banned_at?: string;
  ban_reason?: string;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  members: Member[];
  memberCount: number;
  lastMessage?: any;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  users: {
    name: string;
    email: string;
  };
  is_deleted: boolean;
}

export default function AdminGroupChatControl() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [showBanConfirm, setShowBanConfirm] = useState(false);
  const [showUnbanConfirm, setShowUnbanConfirm] = useState(false);
  const [showDeleteMessageConfirm, setShowDeleteMessageConfirm] = useState(false);
  
  const [actionTarget, setActionTarget] = useState<{id: string, name: string} | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [editingGroupName, setEditingGroupName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [banReason, setBanReason] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    } else if (status === "authenticated" && session && 
               ((session.user as any).role !== "admin" && (session.user as any).role !== "ADMIN")) {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  // Load groups
  useEffect(() => {
    if (status === "authenticated") {
      loadGroups();
    }
  }, [status]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/group-chat');
      if (!response.ok) throw new Error('Failed to load groups');
      const data = await response.json();
      setGroups(data.groups || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error",
        description: "Failed to load groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async (group: Group) => {
    setSelectedGroup(group);
    try {
      const response = await fetch(`/api/group-chat/${group.id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/group-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim()
        })
      });

      if (!response.ok) throw new Error('Failed to create group');

      toast({
        title: "Success",
        description: "Group created successfully",
      });

      setShowCreateGroup(false);
      setNewGroupName("");
      setNewGroupDescription("");
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const updateGroupName = async () => {
    if (!selectedGroup || !editingGroupName.trim()) return;

    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingGroupName.trim() })
      });

      if (!response.ok) throw new Error('Failed to update group name');

      toast({
        title: "Success",
        description: "Group name updated successfully",
      });

      setIsEditingName(false);
      loadGroups();
      if (selectedGroup) {
        setSelectedGroup({ ...selectedGroup, name: editingGroupName.trim() });
      }
    } catch (error) {
      console.error('Error updating group name:', error);
      toast({
        title: "Error",
        description: "Failed to update group name",
        variant: "destructive",
      });
    }
  };

  const initiateDeleteGroup = (groupId: string, groupName: string) => {
    setActionTarget({ id: groupId, name: groupName });
    setShowDeleteGroupConfirm(true);
  };

  const confirmDeleteGroup = async () => {
    if (!actionTarget) return;

    try {
      const response = await fetch(`/api/group-chat?groupId=${actionTarget.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete group');

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message || "Group deleted successfully",
      });

      loadGroups();
      if (selectedGroup?.id === actionTarget.id) {
        setSelectedGroup(null);
        setMessages([]);
      }
      setShowDeleteGroupConfirm(false);
      setActionTarget(null);
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
      setShowDeleteGroupConfirm(false);
    }
  };

  const initiateBanUser = (userId: string, userName: string) => {
    setActionTarget({ id: userId, name: userName });
    setBanReason("");
    setShowBanConfirm(true);
  };

  const confirmBanUser = async () => {
    if (!selectedGroup || !actionTarget) return;

    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: actionTarget.id,
          reason: banReason.trim() || 'No reason provided'
        })
      });

      if (!response.ok) throw new Error('Failed to ban user');

      toast({
        title: "Success",
        description: `${actionTarget.name} has been banned from the group`,
      });

      setShowBanConfirm(false);
      setActionTarget(null);
      setBanReason("");
      loadGroups();
      if (selectedGroup) {
        loadGroupDetails(selectedGroup);
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      });
    }
  };

  const initiateUnbanUser = (userId: string, userName: string) => {
    setActionTarget({ id: userId, name: userName });
    setShowUnbanConfirm(true);
  };

  const confirmUnbanUser = async () => {
    if (!selectedGroup || !actionTarget) return;

    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/unban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: actionTarget.id })
      });

      if (!response.ok) throw new Error('Failed to unban user');

      toast({
        title: "Success",
        description: `${actionTarget.name} has been unbanned`,
      });

      setShowUnbanConfirm(false);
      setActionTarget(null);
      loadGroups();
      if (selectedGroup) {
        loadGroupDetails(selectedGroup);
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      });
    }
  };

  const initiateDeleteMessage = (messageId: string, messageContent: string) => {
    setActionTarget({ id: messageId, name: messageContent });
    setShowDeleteMessageConfirm(true);
  };

  const confirmDeleteMessage = async () => {
    if (!selectedGroup || !actionTarget) return;

    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/messages/${actionTarget.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete message');

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });

      setShowDeleteMessageConfirm(false);
      setActionTarget(null);
      loadGroupDetails(selectedGroup);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleAdminJoinGroup = async () => {
    if (!selectedGroup) return;

    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "You have joined the group as admin",
        });
        loadGroups();
        if (selectedGroup) {
          loadGroupDetails(selectedGroup);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to join group',
        variant: "destructive",
      });
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-blue-500" />
              Group Chat Control
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage community discussion groups, members, and messages
            </p>
          </div>
          <Button onClick={() => setShowCreateGroup(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Groups ({filteredGroups.length})
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-y-auto">
            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGroup?.id === group.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                  onClick={() => loadGroupDetails(group)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{group.name}</h3>
                      <p className="text-xs text-gray-500">{group.memberCount} members</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        initiateDeleteGroup(group.id, group.name);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Group Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedGroup ? (
            <>
              {/* Group Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingGroupName}
                          onChange={(e) => setEditingGroupName(e.target.value)}
                          className="max-w-md"
                        />
                        <Button onClick={updateGroupName} size="sm">Save</Button>
                        <Button onClick={() => setIsEditingName(false)} variant="outline" size="sm">Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <CardTitle className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          {selectedGroup.name}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingGroupName(selectedGroup.name);
                            setIsEditingName(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {selectedGroup.members && !selectedGroup.members.some(m => m.id === session?.user?.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAdminJoinGroup}
                            className="ml-2"
                          >
                            <LogIn className="h-4 w-4 mr-1" />
                            Join Group
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedGroup.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedGroup.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Members ({selectedGroup.members.filter(m => !m.is_banned).length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selectedGroup.members.filter(m => !m.is_banned).map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => initiateBanUser(member.id, member.name)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Banned Members */}
              {selectedGroup.members.filter(m => m.is_banned).length > 0 && (
                <Card className="border-red-200">
                  <CardHeader className="bg-red-50 dark:bg-red-950/30">
                    <CardTitle className="flex items-center gap-2 text-red-700">
                      <UserX className="h-5 w-5" />
                      Banned Members ({selectedGroup.members.filter(m => m.is_banned).length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      {selectedGroup.members.filter(m => m.is_banned).map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 border border-red-200 rounded bg-red-50/50">
                          <div>
                            <p className="font-medium text-sm">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                            {member.ban_reason && (
                              <p className="text-xs text-red-600 mt-1">Reason: {member.ban_reason}</p>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => initiateUnbanUser(member.id, member.name)}
                            className="text-green-600 border-green-600"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Unban
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Messages ({messages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No messages</p>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {messages.map((message) => (
                        <div key={message.id} className="p-3 border rounded">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{message.users.name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(message.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => initiateDeleteMessage(message.id, message.content)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Group Selected</h3>
                <p className="text-gray-600">Select a group from the list to view details and manage it</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (Optional)</label>
              <Textarea
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                Cancel
              </Button>
              <Button onClick={createGroup}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Group Confirmation Modal */}
      <Dialog open={showDeleteGroupConfirm} onOpenChange={setShowDeleteGroupConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🗑️ Confirm Delete Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to permanently delete the group <span className="font-semibold text-red-600">"{actionTarget?.name}"</span>?
            </p>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4 list-disc">
                <li>All group messages will be permanently deleted</li>
                <li>All members will be removed from the group</li>
                <li>Group history and data will be lost forever</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowDeleteGroupConfirm(false);
                setActionTarget(null);
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteGroup}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Group
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban User Confirmation Modal */}
      <Dialog open={showBanConfirm} onOpenChange={setShowBanConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Confirm Ban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to ban <span className="font-semibold text-red-600">{actionTarget?.name}</span> from this group?
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Ban Reason (Optional)</label>
              <Textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter reason for ban"
              />
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ This user will be removed from the group and cannot rejoin unless unbanned.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowBanConfirm(false);
                setActionTarget(null);
                setBanReason("");
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmBanUser}>
                <Ban className="h-4 w-4 mr-2" />
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unban User Confirmation Modal */}
      <Dialog open={showUnbanConfirm} onOpenChange={setShowUnbanConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Unban User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to unban <span className="font-semibold text-green-600">{actionTarget?.name}</span>?
            </p>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ This user will be able to rejoin the group.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowUnbanConfirm(false);
                setActionTarget(null);
              }}>
                Cancel
              </Button>
              <Button onClick={confirmUnbanUser} className="bg-green-600 hover:bg-green-700">
                <UserCheck className="h-4 w-4 mr-2" />
                Unban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Message Confirmation Modal */}
      <Dialog open={showDeleteMessageConfirm} onOpenChange={setShowDeleteMessageConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>⚠️ Confirm Delete Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to delete this message?
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border">
              <p className="text-sm italic">"{actionTarget?.name}"</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowDeleteMessageConfirm(false);
                setActionTarget(null);
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteMessage}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
