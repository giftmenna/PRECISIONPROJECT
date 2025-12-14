"use client";



import { useState, useEffect, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, Trash2, User, Mail, Calendar, Shield, Sparkles, GraduationCap, AlertTriangle, XCircle, UserPlus, Copy, MessageSquare, Phone, Video } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import AvatarSelector from "@/components/AvatarSelector";
import ProfileUpdateForm from "@/components/ProfileUpdateForm";

function ProfilePageContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  
  // State for viewing other users' profiles
  const userId = searchParams.get('userId');
  const isViewingOtherUser = !!userId && userId !== session?.user?.id;
  const [displayUser, setDisplayUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Fetch other user's profile if viewing someone else
  useEffect(() => {
    if (isViewingOtherUser && userId) {
      setLoadingUser(true);
      fetch(`/api/user/profile?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            toast({
              title: "Error",
              description: data.error,
              variant: "destructive",
            });
            router.push("/dashboard");
          } else {
            setDisplayUser(data);
          }
        })
        .catch(error => {
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive",
          });
          router.push("/dashboard");
        })
        .finally(() => setLoadingUser(false));
    } else if (session?.user) {
      // Viewing own profile
      setDisplayUser(session.user);
    }
  }, [isViewingOtherUser, userId, session, router, toast]);

  const handleDirectMessage = () => {
    if (!userId) return;
    // Navigate to direct messages page
    router.push(`/messages?userId=${userId}`);
    toast({
      title: "Direct Message",
      description: `Opening chat with ${displayUser?.name || 'user'}`,
    });
  };

  const handleCall = (type: 'voice' | 'video') => {
    if (!userId) return;
    // Navigate to call page with this user
    router.push(`/call?userId=${userId}&type=${type}`);
    toast({
      title: type === 'voice' ? 'Voice Call' : 'Video Call',
      description: `Starting ${type} call with ${displayUser?.name || 'user'}`,
    });
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 3) {
      return `${username[0]}***@${domain}`;
    }
    return `${username.substring(0, 3)}***@${domain}`;
  };

  if (status === "loading" || loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  const handleAvatarUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: "Avatar uploaded successfully!",
        });
        
        // Update session to reflect new avatar
        await update();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to upload avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setRemoving(true);
    
    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Avatar removed successfully!",
        });
        
        // Update session to reflect avatar removal
        await update();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to remove avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove avatar",
        variant: "destructive",
      });
    } finally {
      setRemoving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type 'DELETE' to confirm account deletion",
        variant: "destructive",
      });
      return;
    }

    setDeletingAccount(true);
    
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmation: deleteConfirmation
        })
      });

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted. Signing you out...",
        });
        
        // Sign out and redirect after a short delay
        setTimeout(async () => {
          await signOut({ redirect: false });
          router.push("/");
        }, 2000);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to delete account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
      setShowDeleteAccountModal(false);
      setDeleteConfirmation("");
    }
  };

  const handleAvatarSelect = async (avatarId: string) => {
    try {
      const response = await fetch("/api/user/avatar/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarId }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Avatar selected successfully!",
        });
        
        // Update session to reflect new avatar
        await update();
        setShowAvatarSelector(false);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to select avatar",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select avatar",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Extract avatar ID from current avatar URL (for base64 data, we can't easily determine the ID)
  const getCurrentAvatarId = () => {
    if (!session.user?.image) return null;
    const avatarUrl = session.user.image;
    // For base64 data, we can't easily determine which predefined avatar was selected
    // This will be handled differently - we'll show the custom avatar as selected
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href={isViewingOtherUser ? "/group-chat" : "/dashboard"} className="inline-flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {isViewingOtherUser ? 'Back to Members' : 'Back to Dashboard'}
          </Link>
          {isViewingOtherUser && (
            <h2 className="text-xl font-semibold">{displayUser?.name}'s Profile</h2>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Avatar
                    src={displayUser?.image || null}
                    name={displayUser?.name || null}
                    size="xl"
                    editable={!isViewingOtherUser}
                    showUploadButton={!isViewingOtherUser}
                    onUpload={!isViewingOtherUser ? handleAvatarUpload : undefined}
                    className="border-4 border-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-3">
                  {isViewingOtherUser ? (
                    // Action buttons for viewing other users
                    <>
                      <Button
                        onClick={handleDirectMessage}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Direct Message
                      </Button>
                      <Button
                        onClick={() => handleCall('voice')}
                        variant="outline"
                        className="w-full"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Voice Call
                      </Button>
                      <Button
                        onClick={() => handleCall('video')}
                        variant="outline"
                        className="w-full"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                    </>
                  ) : (
                    // Edit buttons for own profile
                    <>
                      <Button
                        onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Choose Avatar
                        </div>
                      </Button>

                      <Button
                        onClick={() => document.getElementById("avatar-upload")?.click()}
                        disabled={uploading}
                        variant="outline"
                        className="w-full"
                      >
                        {uploading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            Uploading...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Custom Photo
                          </div>
                        )}
                      </Button>

                      {session.user?.image && (
                        <Button
                          onClick={handleRemoveAvatar}
                          disabled={removing}
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                      {removing ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          Removing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Remove Photo
                        </div>
                      )}
                      
                    </Button>
                  )}
                  </>
                  )}
                </div>
            
                

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                  }}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Update Form - Only show for own profile */}
            {!isViewingOtherUser && <ProfileUpdateForm />}
            
            {/* Basic Info Card - Show for other users */}
            {isViewingOtherUser && displayUser && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                      <div className="text-base text-gray-900 dark:text-white">{displayUser.name || 'N/A'}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                      <div className="text-base text-gray-900 dark:text-white">{displayUser.email ? maskEmail(displayUser.email) : 'N/A'}</div>
                    </div>
                    {displayUser.gender && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
                        <div className="text-base text-gray-900 dark:text-white capitalize">{displayUser.gender}</div>
                      </div>
                    )}
                    {displayUser.country && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                        <div className="text-base text-gray-900 dark:text-white capitalize">{displayUser.country.replace(/_/g, ' ')}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Account Status Card - Only show for own profile */}
            {!isViewingOtherUser && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Role
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.user?.role === "admin" ? "default" : "secondary"}>
                          {session.user?.role === "admin" ? "Administrator" : "Student"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Member Since
                      </label>
                      <Input
                        value={formatDate(new Date())}
                        disabled
                        className="bg-gray-50 dark:bg-gray-700"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Email Verified
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Referral Code Card - Only show for own profile */}
            {!isViewingOtherUser && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                  Your Referral Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Share this code with friends to earn gems!
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value="PRAW2893"
                      disabled
                      className="bg-gray-50 dark:bg-gray-700 font-mono text-lg"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText("PRAW2893");
                        toast({
                          title: "Copied!",
                          description: "Referral code copied to clipboard",
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-3">
                    <p className="text-xs text-gray-500">
                      <strong>How to earn gems:</strong>
                    </p>
                    <ol className="text-xs text-gray-500 space-y-1 ml-4">
                      <li>1. Share your code with friends</li>
                      <li>2. They sign up using your code</li>
                      <li>3. When they complete their first activity, you earn gems!</li>
                    </ol>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      💡 Share your code: <span className="font-mono">https://yourapp.com/auth/signup?ref=PRAW2893</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">0</div>
                    <div className="text-sm text-gray-500">Total Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">0</div>
                    <div className="text-sm text-gray-500">Gems Earned</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link href="/referrals">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Manage Referrals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Account Deletion Card - Only show for own profile */}
            {!isViewingOtherUser && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-red-800 dark:text-red-200">
                        Delete Account
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </p>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• All your practice attempts will be deleted</li>
                        <li>• Your competition entries will be removed</li>
                        <li>• Your gem balance will be lost</li>
                        <li>• Your profile and settings will be erased</li>
                        <li>• This action is irreversible</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowDeleteAccountModal(true)}
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
            )}
          </div>
        </div>

        {/* Avatar Selector */}
        {showAvatarSelector && (
          <div className="mt-8">
            <AvatarSelector
              onSelect={handleAvatarSelect}
              selectedAvatar={getCurrentAvatarId()}
              loading={uploading}
            />
          </div>
        )}

        {/* Account Deletion Modal */}
        {showDeleteAccountModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Delete Account
                  </h2>
                  <button
                    onClick={() => {
                      setShowDeleteAccountModal(false);
                      setDeleteConfirmation("");
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                          Final Warning
                        </h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          This action will permanently delete your account and all associated data. This cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type "DELETE" to confirm
                    </label>
                    <Input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="border-red-300 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteAccountModal(false);
                        setDeleteConfirmation("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "DELETE" || deletingAccount}
                      variant="destructive"
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      {deletingAccount ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Deleting...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfilePageContent />
    </Suspense>
  );
} 