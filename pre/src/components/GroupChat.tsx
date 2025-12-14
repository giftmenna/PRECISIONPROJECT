'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Avatar from '@/components/Avatar';
import { MessageCircle, Send, Users, Plus, Mic, Check, CheckCheck, CheckCircle, Smile, LogIn, LogOut, RefreshCw, ArrowLeft, X, MoreVertical, Phone, Video, StopCircle, Play, Pause, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { GroupMembers } from './GroupMembers';

interface Reaction {
  emoji: string;
  userIds: string[];
}

interface ReplyInfo {
  id: string;
  content: string;
  user: {
    name: string;
  };
}

interface GroupChatMessage {
  id: string;
  content: string;
  messageType: 'text' | 'image' | 'voice' | 'sticker' | 'reply';
  mediaUrl?: string;
  mediaDuration?: number;
  createdAt: string;
  status?: 'pending' | 'failed' | 'sent';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  reactions?: Reaction[];
  replyTo?: {
    messageId: string;
    content: string;
    user: {
      id: string;
      name: string;
    };
  };
}

interface GroupChatMember {
  id: string;
  role: 'member' | 'moderator' | 'admin';
  users: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface GroupChatComponentProps {
  onJoin?: () => void;
  onShowWelcome?: () => void;
}

interface GroupChat {
  id: string;
  name: string;
  description?: string;
  image?: string;
  members: GroupChatMember[];
  messages: GroupChatMessage[];
  isMember?: boolean;
  memberCount?: number;
  isBanned?: boolean;
  unreadCount?: number;  // Add this line
  lastMessage?: {
    content: string;
    createdAt: string;
    user: {
		id: string;
      name: string;
      email: string;
    };
  };
  createdAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

const COMMON_EMOJIS = [
  '😀','😁','😂','🤣','😊','😇','😍','😘','😎','🤓','😅','😌','👍','👏','🙌','🙏',
  '💡','🎉','🔥','⭐','📚','🧠','📝','✏️','📈','📐','➕','➖','✖️','➗'
];

// Color gradients for group cards
const GROUP_COLORS = [
  'from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40 border-blue-200 dark:border-blue-800',
  'from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40 border-purple-200 dark:border-purple-800',
  'from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/40 border-green-200 dark:border-green-800',
  'from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40 border-orange-200 dark:border-orange-800',
  'from-pink-50 to-pink-100 dark:from-pink-950/40 dark:to-pink-900/40 border-pink-200 dark:border-pink-800',
  'from-teal-50 to-teal-100 dark:from-teal-950/40 dark:to-teal-900/40 border-teal-200 dark:border-teal-800',
  'from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/40 border-indigo-200 dark:border-indigo-800',
  'from-rose-50 to-rose-100 dark:from-rose-950/40 dark:to-rose-900/40 border-rose-200 dark:border-rose-800',
];

const getGroupColor = (index: number) => GROUP_COLORS[index % GROUP_COLORS.length];

export default function GroupChat({ onJoin, onShowWelcome }: GroupChatComponentProps = {}) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  // State
  const [availableGroups, setAvailableGroups] = useState<GroupChat[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupChat | null>(null);
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [showGroupList, setShowGroupList] = useState(true);
  const [replyingTo, setReplyingTo] = useState<ReplyInfo | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [showExpandedEmojis, setShowExpandedEmojis] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [selectedMemberMenu, setSelectedMemberMenu] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showGroupCall, setShowGroupCall] = useState(false);
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioErrors, setAudioErrors] = useState<Set<string>>(new Set());
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const emojiMenuRef = useRef<HTMLDivElement>(null);
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const memberMenuRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef<boolean>(true);



  // Effect for handling clicks outside of popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      
      if (attachMenuRef.current && !attachMenuRef.current.contains(target)) {
        setShowAttachMenu(false);
      }
      if (emojiMenuRef.current && !emojiMenuRef.current.contains(target)) {
        setShowEmojiPicker(false);
      }
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(target)) {
        setShowReactionPicker(null);
        setShowExpandedEmojis(false);
      }
      if (memberMenuRef.current && !memberMenuRef.current.contains(target)) {
        setSelectedMemberMenu(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if user is near bottom of messages
  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    
    const threshold = 150; // pixels from bottom
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    shouldAutoScrollRef.current = isNearBottom;
    return isNearBottom;
  };

  // Scroll to bottom when messages change (only if user is near bottom)
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Track scroll position to detect if user scrolls up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkIfNearBottom();
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Load groups and messages
  useEffect(() => {
    if (status === 'authenticated') {
      loadCurrentUser();
      loadAllGroups();
    }
  }, [status]);

  // Poll for new messages when a group is selected
  useEffect(() => {
    if (!selectedGroup || !selectedGroup.isMember) return;

    // Enable auto-scroll when switching groups
    shouldAutoScrollRef.current = true;

    // Initial load
    loadChatMessages(selectedGroup.id);

    // Poll every 500ms for new messages (faster updates)
    const pollInterval = setInterval(() => {
      loadChatMessages(selectedGroup.id);
    }, 500);

    return () => clearInterval(pollInterval);
  }, [selectedGroup?.id, selectedGroup?.isMember]);

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  // Load all groups
  const loadAllGroups = async () => {
    try {
      setGroupsLoading(true);
      const response = await fetch('/api/group-chat');
      if (response.ok) {
        const data = await response.json();
        setAvailableGroups(data.groups || []);
        
        // Update selected group if it exists in the new data
        if (selectedGroup) {
          const updatedGroup = data.groups?.find((g: GroupChat) => g.id === selectedGroup.id);
          if (updatedGroup) {
            setSelectedGroup(updatedGroup);
            // Reload messages only if user is a member
            if (updatedGroup.isMember) {
              loadChatMessages(updatedGroup.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      setGroupsError('Failed to load groups');
    } finally {
      setGroupsLoading(false);
    }
  };

  // Load chat messages
  const loadChatMessages = async (chatId: string, showLoading = false) => {
    try {
      if (showLoading) {
        setMessagesLoading(true);
      }
      
      // Check scroll position BEFORE fetching to preserve user's view
      checkIfNearBottom();
      
      const response = await fetch(`/api/group-chat/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        const newMessages = data.messages || [];
        
        // Merge with existing messages, preserving optimistic updates, sent status, and reactions
        setMessages(prevMessages => {
          // Keep pending and failed messages (optimistic updates)
          const pendingMessages = prevMessages.filter(msg => msg.status === 'pending' || msg.status === 'failed');
          
          // Get IDs of pending messages to avoid duplicates
          const pendingIds = new Set(pendingMessages.map(msg => msg.id));
          
          // Filter out any new messages that match pending ones
          const uniqueNewMessages = newMessages.filter((msg: GroupChatMessage) => !pendingIds.has(msg.id));
          
          // Create a map of existing messages for quick lookup
          const existingMessagesMap = new Map(prevMessages.map(msg => [msg.id, msg]));
          
          // Mark messages from current user as 'sent' and merge reactions intelligently
          const messagesWithStatus = uniqueNewMessages.map((msg: GroupChatMessage) => {
            const existingMsg = existingMessagesMap.get(msg.id);
            
            // Merge reactions: combine server and optimistic updates
            let mergedReactions = msg.reactions || [];
            const existingReactions = existingMsg?.reactions || [];
            
            if (existingReactions.length > 0) {
              // Create a map of all reactions (server + optimistic)
              const reactionMap = new Map<string, { emoji: string; userIds: string[] }>();
              
              // Add server reactions first
              mergedReactions.forEach(r => {
                reactionMap.set(r.emoji, { emoji: r.emoji, userIds: [...r.userIds] });
              });
              
              // Merge in optimistic reactions
              existingReactions.forEach(r => {
                const existing = reactionMap.get(r.emoji);
                if (existing) {
                  // Merge user IDs, keeping unique ones
                  const combinedUserIds = [...new Set([...existing.userIds, ...r.userIds])];
                  reactionMap.set(r.emoji, { emoji: r.emoji, userIds: combinedUserIds });
                } else {
                  // New reaction not yet on server
                  reactionMap.set(r.emoji, { emoji: r.emoji, userIds: [...r.userIds] });
                }
              });
              
              mergedReactions = Array.from(reactionMap.values()).filter(r => r.userIds.length > 0);
            }
            
            return {
              ...msg,
              status: msg.user.id === session?.user?.id ? 'sent' : msg.status,
              reactions: mergedReactions
            };
          });
          
          // Combine and sort by creation date
          const combined = [...messagesWithStatus, ...pendingMessages];
          return combined.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't show toast on polling errors to avoid spam
    } finally {
      if (showLoading) {
        setMessagesLoading(false);
      }
    }
  };

  // Join group
  const joinGroup = async () => {
    if (!selectedGroup || isJoining) return;
    
    setIsJoining(true);
    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/join`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'You have joined the group!',
        });
        onJoin?.();
        // Reload groups and messages after joining
        await loadAllGroups();
        if (selectedGroup) {
          await loadChatMessages(selectedGroup.id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to join group',
        variant: 'destructive',
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Leave group
  const leaveGroup = async () => {
    if (!selectedGroup || isLeaving) return;
    
    setIsLeaving(true);
    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/leave`, {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'You have left the group',
        });
        // Clear messages and keep group selected to show join option
        setMessages([]);
        // Reload groups to update membership status
        await loadAllGroups();
        setShowLeaveConfirm(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to leave group');
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to leave group',
        variant: 'destructive',
      });
    } finally {
      setIsLeaving(false);
    }
  };

  // Send message
  const sendMessage = async (content: string, messageType: 'text' | 'image' | 'voice' | 'sticker' = 'text', mediaUrl?: string, mediaDuration?: number) => {
    if (!content.trim() || !selectedGroup || !selectedGroup.isMember) return;

    // Capture replyingTo before clearing it
    const replyInfo = replyingTo;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: GroupChatMessage = {
      id: tempId,
      content: content.trim(),
      messageType,
      mediaUrl,
      mediaDuration,
      createdAt: new Date().toISOString(),
      status: 'pending',
      user: {
        id: session?.user?.id || 'me',
        name: session?.user?.name || 'You',
        email: session?.user?.email || '',
        avatar: session?.user?.image || undefined,
      },
      ...(replyInfo && {
        replyTo: {
          messageId: replyInfo.id,
          content: replyInfo.content,
          user: { id: '', name: replyInfo.user.name }
        }
      })
    };

    // Optimistic update - happens immediately
    setMessages(prev => [...prev, optimisticMessage]);
    setInputMessage('');
    setReplyingTo(null);

    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: content.trim(), 
          messageType, 
          mediaUrl,
          mediaDuration,
          ...(replyInfo && { replyToMessageId: replyInfo.id })
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temporary message with server response and mark as sent
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { 
              ...data.message, 
              status: 'sent',
              user: {
                ...data.message.user,
                id: session?.user?.id || data.message.user.id
              }
            } : msg
          )
        );
        
        // Immediately poll for updates to sync with other users faster
        if (selectedGroup) {
          setTimeout(() => loadChatMessages(selectedGroup.id), 50);
          // Poll again after 500ms to ensure delivery confirmation
          setTimeout(() => loadChatMessages(selectedGroup.id), 500);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      );
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        await sendMessage('', 'image', data.url);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({
      title: 'File upload',
      description: 'File upload functionality coming soon!',
    });
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try to use a compatible audio format
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options = { mimeType: 'audio/ogg;codecs=opus' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Use the same MIME type as the MediaRecorder
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(chunks, { type: mimeType });
        console.log('Audio recorded:', {
          mimeType,
          size: blob.size,
          type: blob.type
        });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Update duration every second
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive',
      });
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Send voice note
  const sendVoiceNote = async () => {
    if (!audioBlob) return;
    
    try {
      // Create a blob URL for immediate local playback
      const blobUrl = URL.createObjectURL(audioBlob);
      
      // Convert audio blob to base64 data URL for server storage
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        console.log('Base64 audio created:', {
          length: base64Audio.length,
          prefix: base64Audio.substring(0, 50),
          duration: recordingDuration
        });
        
        // Send with blob URL for immediate playback, server will store base64
        await sendMessage(`Voice message (${recordingDuration}s)`, 'voice', base64Audio, recordingDuration);
        
        setAudioBlob(null);
        setRecordingDuration(0);
      };
      
      reader.onerror = () => {
        toast({
          title: 'Error',
          description: 'Failed to process voice note',
          variant: 'destructive',
        });
      };
    } catch (error) {
      console.error('Error with voice note:', error);
      toast({
        title: 'Error',
        description: 'Failed to send voice note',
        variant: 'destructive',
      });
    }
  };

  // Cancel voice recording
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
    setAudioBlob(null);
    setRecordingDuration(0);
  };

  // Format recording duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle group call
  const handleGroupCall = (type: 'voice' | 'video') => {
    if (!selectedGroup) return;
    setCallType(type);
    setShowGroupCall(true);
    toast({
      title: `${type === 'video' ? 'Video' : 'Voice'} Call`,
      description: `Starting ${type} call for ${selectedGroup.name}...`,
    });
  };

  // Handle view profile
  const handleViewProfile = (user: User) => {
    // Navigate to user profile page with query parameter
    router.push(`/profile?userId=${user.id}`);
  };

  // Handle direct message
  const handleDirectMessage = (user: User) => {
    setLoading(true);
    toast({
      title: 'Direct Message',
      description: `Opening chat with ${user.name}...`,
    });
    // Navigate to direct messages page
    router.push(`/messages?userId=${user.id}`);
  };

  // Handle direct call
  const handleDirectCall = (user: User, type: 'voice' | 'video') => {
    setCallType(type);
    toast({
      title: `${type === 'video' ? 'Video' : 'Voice'} Call`,
      description: `Calling ${user.name}...`,
    });
    // TODO: Implement WebRTC calling
    // For now, show a confirmation that the call would be initiated
    setTimeout(() => {
      toast({
        title: 'Call Feature',
        description: `${type === 'video' ? 'Video' : 'Voice'} calling with ${user.name} will be available soon with WebRTC integration.`,
      });
    }, 1000);
  };

  // Handle adding/removing reactions
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const userId = session?.user?.id;
      if (!userId) return;
      
      // Determine the action before optimistic update
      const currentMessage = messages.find(msg => msg.id === messageId);
      const clickedReaction = currentMessage?.reactions?.find(r => r.emoji === emoji);
      const userHasClickedReaction = clickedReaction?.userIds.includes(userId);
      const isRemoving = userHasClickedReaction;
      
      // Optimistic update
      setMessages(prev => prev.map(msg => {
        if (msg.id !== messageId) return msg;
        
        let updatedReactions = msg.reactions ? [...msg.reactions] : [];
        
        // Find if user already reacted with this emoji
        const clickedReaction = updatedReactions.find(r => r.emoji === emoji);
        const userHasClickedReaction = clickedReaction?.userIds.includes(userId);
        
        // Find if user has any other reaction on this message
        const userOtherReaction = updatedReactions.find(r => 
          r.emoji !== emoji && r.userIds.includes(userId)
        );
        
        // Remove user from all other reactions (replace behavior)
        if (userOtherReaction) {
          updatedReactions = updatedReactions.map(r => {
            if (r.emoji !== emoji && r.userIds.includes(userId)) {
              return {
                ...r,
                userIds: r.userIds.filter(id => id !== userId)
              };
            }
            return r;
          }).filter(r => r.userIds.length > 0); // Remove empty reactions
        }
        
        // Toggle the clicked reaction
        if (userHasClickedReaction) {
          // Remove user's reaction (cancel)
          updatedReactions = updatedReactions.map(r => {
            if (r.emoji === emoji) {
              return {
                ...r,
                userIds: r.userIds.filter(id => id !== userId)
              };
            }
            return r;
          }).filter(r => r.userIds.length > 0); // Remove empty reactions
        } else {
          // Add user's reaction
          if (clickedReaction) {
            // Emoji exists, add user to it
            updatedReactions = updatedReactions.map(r => {
              if (r.emoji === emoji) {
                return {
                  ...r,
                  userIds: [...r.userIds, userId]
                };
              }
              return r;
            });
          } else {
            // New emoji, create it
            updatedReactions.push({
              emoji,
              userIds: [userId]
            });
          }
        }
        
        return {
          ...msg,
          reactions: updatedReactions
        };
      }));
      
      // API call to save reaction with action type
      const response = await fetch(`/api/messages/${messageId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          emoji,
          action: isRemoving ? 'remove' : 'add'
        })
      });
      
      // Refresh messages after reaction is saved to sync with server
      if (response.ok && selectedGroup) {
        // Multiple refreshes to ensure all users get the update
        setTimeout(() => loadChatMessages(selectedGroup.id), 100);
        setTimeout(() => loadChatMessages(selectedGroup.id), 500);
        setTimeout(() => loadChatMessages(selectedGroup.id), 1000);
      }
      
    } catch (error) {
      console.error('Error updating reaction:', error);
      // TODO: Revert optimistic update on error
    } finally {
      setShowReactionPicker(null);
      setShowExpandedEmojis(false);
    }
  };

  // Scroll to a specific message
  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.classList.add('bg-blue-100', 'dark:bg-blue-900/30');
      setTimeout(() => {
        messageElement.classList.remove('bg-blue-100', 'dark:bg-blue-900/30');
      }, 2000);
    }
  };

  // Handle reply
  const handleReply = (message: GroupChatMessage) => {
    setReplyingTo({
      id: message.id,
      content: message.content.length > 50 
        ? `${message.content.substring(0, 50)}...` 
        : message.content,
      user: { name: message.user.name }
    });
    // Focus the input
(document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement)?.focus();
  };

  // Cancel reply
  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  // Handle ban user
  const handleBanUser = async (userId: string, reason: string) => {
if (!selectedGroup || !currentUser || currentUser.role?.toLowerCase() !== 'admin') {
  return;
}    
    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: 'User banned successfully' });
        setShowAdminMenu(false);
        setSelectedUser(null);
        setBanReason('');
        loadAllGroups();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to ban user');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to ban user', 
        variant: 'destructive' 
      });
    }
  };

  // Handle unban user
  const handleUnbanUser = async (userId: string) => {
    if (!selectedGroup || !currentUser || currentUser.role?.toLowerCase() !== 'admin') {
      return;
    }    
    
    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/unban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: 'User unbanned successfully' });
        setShowAdminMenu(false);
        setSelectedUser(null);
        loadAllGroups();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unban user');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to unban user', 
        variant: 'destructive' 
      });
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedGroup || !currentUser || currentUser.role?.toLowerCase() !== 'admin') {
      return;
    }    
    
    try {
      const response = await fetch(`/api/group-chat/${selectedGroup.id}/messages/${messageId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({ title: 'Success', description: 'Message deleted successfully' });
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to delete message', 
        variant: 'destructive' 
      });
    }
  };

  // Loading state
  if (status === 'loading' || groupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-2">Please sign in to continue</h2>
        <p className="text-muted-foreground mb-4">You need to be signed in to access group chats</p>
        <Button onClick={() => router.push('/auth/signin')}>Sign In</Button>
      </div>
    );
  }

  // Check if user hasn't joined any groups
  const joinedGroups = availableGroups.filter(g => g.isMember);
  const hasJoinedGroups = joinedGroups.length > 0;
  const shouldShowWelcomeBanner = !hasJoinedGroups && availableGroups.length > 0;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Main Chat Interface */}
      <div className="flex h-full bg-background overflow-hidden">
      {/* Group List Sidebar */}
      <div className={`
        ${showGroupList ? 'flex' : 'hidden'}
        md:flex
        w-full md:w-80 lg:w-96
        border-r flex-shrink-0 flex-col
        absolute md:relative
        inset-0 md:inset-auto
        z-30 md:z-0
        bg-background
      `}>
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Groups</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowGroupList(false)}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {availableGroups.map((group, index) => (
            <div
              key={group.id}
              className={`
                p-4 rounded-xl cursor-pointer transition-all duration-200
                bg-gradient-to-br border
                ${getGroupColor(index)}
                ${
                  selectedGroup?.id === group.id 
                    ? 'ring-2 ring-primary shadow-md scale-[1.02]' 
                    : 'hover:shadow-md hover:scale-[1.01]'
                }
              `}
              onClick={() => {
                setSelectedGroup(group);
                // Only load messages if user is a member
                if (group.isMember) {
                  setMessages([]);
                  loadChatMessages(group.id, true);
                } else {
                  setMessages([]);
                }
                setShowGroupList(false);
              }}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar 
                    src={group.image} 
                    name={group.name} 
                    className="h-12 w-12"
                  />
                  {group.unreadCount !== undefined && group.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                      {group.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-base truncate">{group.name}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(group.lastMessage?.createdAt || group.createdAt || '')
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {group.lastMessage 
                      ? group.lastMessage.user.id === session?.user?.id
                        ? `You: ${group.lastMessage.content}`
                        : `${group.lastMessage.user.name}: ${group.lastMessage.content}`
                      : 'No messages yet'}
                  </p>
                  {group.isMember && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-500" />
                      <span className="text-xs text-green-600 dark:text-green-500 font-medium">Member</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {selectedGroup ? (
          <>
            {/* Chat Header - Fixed at top */}
            <div className="flex-shrink-0 border-b p-3 md:p-4 flex items-center justify-between bg-background z-20 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden flex-shrink-0"
                  onClick={() => setShowGroupList(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <Avatar 
                    src={selectedGroup.image} 
                    name={selectedGroup.name} 
                    className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h2 className="font-semibold text-sm md:text-base truncate">{selectedGroup.name}</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {selectedGroup.memberCount || selectedGroup.members?.length || 0} members
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selectedGroup.isMember ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMembers(!showMembers)}
                      className="hidden sm:flex"
                    >
                      <Users className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Members</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowMembers(!showMembers)}
                      className="sm:hidden"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLeaveConfirm(true)}
                      disabled={isLeaving}
                      className="hidden md:flex"
                    >
                      Leave Group
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowLeaveConfirm(true)}
                      disabled={isLeaving}
                      className="md:hidden"
                      title="Leave Group"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={joinGroup}
                    disabled={isJoining}
                    size="sm"
                  >
                    {isJoining ? 'Joining...' : 'Join Group'}
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            {selectedGroup.isMember ? (
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-muted/30 min-h-0"
                style={{ overscrollBehavior: 'contain' }}
              >
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center p-4">
                      <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No messages yet</h3>
                      <p className="text-muted-foreground">
                        Be the first to send a message!
                      </p>
                    </div>
                  </div>
                ) : (
                messages.map((message) => (
                  <div 
                    key={message.id}
                    id={`message-${message.id}`}
                    className={`flex ${message.user.id === session?.user?.id ? 'justify-end' : 'justify-start'} transition-colors duration-500`}
                  >
                    <div className={`relative max-w-[85%] sm:max-w-[75%] md:max-w-[65%] lg:max-w-[55%] ${message.user.id === session?.user?.id ? 'text-right' : ''}`}>
                      {/* Username at the top - Only for receiver and non-voice messages */}
                      {message.messageType !== 'voice' && message.user.id !== session?.user?.id && (
                        <div className="text-sm font-medium mb-1">
                          {message.user.name}
                        </div>
                      )}
                      
                      {/* Reply Preview */}
                      {message.replyTo && (
                        <div 
                          onClick={() => scrollToMessage(message.replyTo!.messageId)}
                          className="text-xs mb-2 border-l-2 border-blue-500 pl-2 bg-accent/30 rounded p-2 cursor-pointer hover:bg-accent/50 transition-colors"
                        >
                          <div className="text-muted-foreground/70 font-medium mb-0.5">
                            Replying to {message.replyTo.user.name}
                          </div>
                          <div className="text-muted-foreground/60 italic">
                            {message.replyTo.content}
                          </div>
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div 
                        className={`inline-block rounded-lg relative ${
                          message.messageType === 'voice' 
                            ? 'bg-accent/50 px-2 py-2' 
                            : `px-3 py-2 md:px-4 md:py-2 pb-5 ${
                                message.user.id === session?.user?.id 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-accent'
                              }`
                        }`}
                      >
                        {message.messageType === 'text' && (
                          <>
                            <p className="whitespace-pre-wrap break-words pr-12">{message.content}</p>
                            {/* Timestamp inside bubble at bottom */}
                            <div className={`absolute bottom-1 text-[10px] opacity-70 flex items-center gap-1 ${
                              message.user.id === session?.user?.id ? 'right-2' : 'left-2'
                            }`}>
                              <span className="whitespace-nowrap">
                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {message.user.id === session?.user?.id && (
                                <span className="inline-flex">
                                  {message.status === 'pending' && <Check className="h-3 w-3" />}
                                  {message.status === 'failed' && <span>❌</span>}
                                  {message.status === 'sent' && <CheckCheck className="h-3 w-3" />}
                                  {!message.status && <CheckCheck className="h-3 w-3" />}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                        {message.messageType === 'image' && message.mediaUrl && (
                          <>
                            <div className="mt-2 mb-4">
                              <img 
                                src={message.mediaUrl} 
                                alt="Shared content" 
                                className="max-w-full max-h-64 rounded-md" 
                              />
                            </div>
                            {/* Timestamp inside bubble at bottom */}
                            <div className={`absolute bottom-1 text-[10px] opacity-70 flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded ${
                              message.user.id === session?.user?.id ? 'right-2' : 'left-2'
                            }`}>
                              <span className="whitespace-nowrap text-white">
                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {message.user.id === session?.user?.id && (
                                <span className="inline-flex text-white">
                                  {message.status === 'pending' && <Check className="h-3 w-3" />}
                                  {message.status === 'failed' && <span>❌</span>}
                                  {message.status === 'sent' && <CheckCheck className="h-3 w-3" />}
                                  {!message.status && <CheckCheck className="h-3 w-3" />}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                        {message.messageType === 'voice' && (
                          !message.mediaUrl ? (
                            // Show placeholder for pending voice messages (sender's view while uploading)
                            <div className="flex flex-col w-full max-w-[280px]">
                              <div className="flex items-center gap-3 py-1">
                                <button
                                  disabled
                                  className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center transition-colors relative opacity-50 cursor-not-allowed"
                                  aria-label="Uploading"
                                >
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <Play className="h-5 w-5 text-primary" />
                                  </div>
                                </button>
                                <div className="flex-1 flex flex-col gap-1">
                                  <div className="h-8 flex items-center">
                                    <div className="flex-1 h-1 bg-primary/20 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary w-0 transition-all"></div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span className="text-xs text-muted-foreground min-w-[40px]">
                                      {message.mediaDuration ? 
                                        `${Math.floor(message.mediaDuration)}s` : 
                                        (message.content.match(/\d+/) ? `${message.content.match(/\d+/)?.[0]}s` : '0s')
                                      }
                                    </span>
                                    <div className="flex-1"></div>
                                    <div className="text-xs text-muted-foreground/60">
                                      {new Date(message.createdAt).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </div>
                                    {message.user.id === session?.user?.id && (
                                      <span className="inline-flex">
                                        {message.status === 'pending' && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
                                        {message.status === 'failed' && <span className="text-red-500">❌</span>}
                                        {message.status === 'sent' && <CheckCheck className="h-3.5 w-3.5 text-blue-500" />}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : audioErrors.has(message.id) ? (
                            // Fallback to native audio controls if custom player fails
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mic className="h-4 w-4" />
                                <span className="text-sm">{message.content}</span>
                              </div>
                              <audio controls className="w-full max-w-xs h-8">
                                <source src={message.mediaUrl} />
                                Your browser does not support audio playback.
                              </audio>
                            </div>
                          ) : (
                            <div className="flex flex-col w-full max-w-[280px]">
                              <div className="flex items-center gap-3 py-1">
                                <button
                                  onClick={() => {
                                    const audio = document.getElementById(`audio-${message.id}`) as HTMLAudioElement;
                                    if (audio) {
                                      if (audio.paused) {
                                        // Pause any other playing audio
                                        document.querySelectorAll('audio').forEach(a => {
                                          if (a.id !== `audio-${message.id}`) a.pause();
                                        });
                                        console.log('Attempting to play audio for message:', message.id, 'URL:', message.mediaUrl?.substring(0, 100));
                                        audio.play().then(() => {
                                          console.log('Audio play() resolved successfully for message:', message.id);
                                        }).catch(err => {
                                          console.error('Play error:', {
                                            message: err.message,
                                            name: err.name,
                                            stack: err.stack,
                                            code: (err as any).code,
                                            error: err,
                                            audioElement: {
                                              src: audio.src,
                                              currentSrc: audio.currentSrc,
                                              error: audio.error,
                                              readyState: audio.readyState,
                                              networkState: audio.networkState,
                                              paused: audio.paused,
                                              ended: audio.ended
                                            }
                                          });
                                          setAudioErrors(prev => new Set(prev).add(message.id));
                                        });
                                        setPlayingAudioId(message.id);
                                      } else {
                                        audio.pause();
                                        setPlayingAudioId(null);
                                      }
                                    }
                                  }}
                                  className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors relative"
                                  aria-label={playingAudioId === message.id ? 'Pause' : 'Play'}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    {playingAudioId === message.id ? (
                                      <Pause className="h-5 w-5 text-primary" />
                                    ) : (
                                      <Play className="h-5 w-5 text-primary" />
                                    )}
                                  </div>
                                </button>
                                <div className="flex-1 flex flex-col gap-1">
                                  <div className="h-8 flex items-center">
                                    <div className="flex-1 h-1 bg-primary/20 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary w-0 transition-all" id={`progress-${message.id}`}></div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span className="text-xs text-muted-foreground min-w-[40px]">
                                      {message.mediaDuration ? 
                                        `${Math.floor(message.mediaDuration)}s` : 
                                        (message.content.match(/\d+/) ? `${message.content.match(/\d+/)?.[0]}s` : '0s')
                                      }
                                    </span>
                                    <div className="flex-1"></div>
                                    <div className="text-xs text-muted-foreground/60">
                                      {new Date(message.createdAt).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </div>
                                    {message.user.id === session?.user?.id && (
                                      <span className="inline-flex">
                                        {message.status === 'pending' && <Check className="h-3.5 w-3.5 text-muted-foreground" />}
                                        {message.status === 'failed' && <span className="text-red-500">❌</span>}
                                        {message.status === 'sent' && <CheckCheck className="h-3.5 w-3.5 text-blue-500" />}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <audio
                                id={`audio-${message.id}`}
                                src={message.mediaUrl}
                                preload="metadata"
                                onPlay={() => {
                                  console.log('Audio started playing:', message.id);
                                  setPlayingAudioId(message.id);
                                }}
                                onPause={() => {
                                  console.log('Audio paused:', message.id);
                                  setPlayingAudioId(null);
                                }}
                                onTimeUpdate={(e) => {
                                  const audio = e.currentTarget;
                                  const progress = document.getElementById(`progress-${message.id}`);
                                  if (progress && audio.duration) {
                                    progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
                                  }
                                }}
                                onEnded={() => {
                                  console.log('Audio ended:', message.id);
                                  const progress = document.getElementById(`progress-${message.id}`);
                                  if (progress) {
                                    progress.style.width = '0%';
                                  }
                                  setPlayingAudioId(null);
                                }}
                                onError={(e) => {
                                  const audio = e.currentTarget as HTMLAudioElement;
                                  
                                  // Consolidated error logging
                                  const errorDetails = {
                                    messageId: message.id,
                                    mediaUrl: {
                                      type: typeof message.mediaUrl,
                                      length: message.mediaUrl?.length,
                                      preview: message.mediaUrl?.substring(0, 100),
                                      isDataUrl: message.mediaUrl?.startsWith('data:'),
                                      isBlobUrl: message.mediaUrl?.startsWith('blob:')
                                    },
                                    audioState: {
                                      networkState: audio.networkState,
                                      networkStateText: ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'][audio.networkState] || 'UNKNOWN',
                                      readyState: audio.readyState,
                                      readyStateText: ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][audio.readyState] || 'UNKNOWN',
                                      currentSrc: audio.currentSrc,
                                      duration: audio.duration,
                                      paused: audio.paused
                                    },
                                    error: audio.error ? {
                                      code: audio.error.code,
                                      codeText: ['', 'MEDIA_ERR_ABORTED', 'MEDIA_ERR_NETWORK', 'MEDIA_ERR_DECODE', 'MEDIA_ERR_SRC_NOT_SUPPORTED'][audio.error.code] || 'UNKNOWN_ERROR',
                                      message: audio.error.message
                                    } : 'No error object available',
                                    event: {
                                      type: e.type,
                                      target: e.target?.constructor.name
                                    }
                                  };
                                  
                                  console.error('Audio playback error:', JSON.stringify(errorDetails, null, 2));
                                  setAudioErrors(prev => new Set(prev).add(message.id));
                                }}
                                onCanPlay={() => console.log('Audio can play:', message.id)}
                                onCanPlayThrough={() => console.log('Audio can play through:', message.id)}
                                onEmptied={() => console.log('Audio emptied:', message.id)}
                                onLoadedData={() => console.log('Audio loaded data:', message.id)}
                                onLoadedMetadata={() => console.log('Audio loaded metadata:', message.id)}
                                onLoadStart={() => console.log('Audio load started:', message.id)}
                                onStalled={() => console.log('Audio stalled:', message.id)}
                                onSuspend={() => console.log('Audio suspended:', message.id)}
                                onWaiting={() => console.log('Audio waiting:', message.id)}
                                className="hidden"
                              />
                            </div>
                          )
                        )}
                        {message.messageType === 'sticker' && (
                          <>
                            <div className="text-4xl mb-4">{message.content}</div>
                            {/* Timestamp inside bubble at bottom */}
                            <div className={`absolute bottom-1 text-[10px] opacity-70 flex items-center gap-1 ${
                              message.user.id === session?.user?.id ? 'right-2' : 'left-2'
                            }`}>
                              <span className="whitespace-nowrap">
                                {new Date(message.createdAt).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {message.user.id === session?.user?.id && (
                                <span className="inline-flex">
                                  {message.status === 'pending' && <Check className="h-3 w-3" />}
                                  {message.status === 'failed' && <span>❌</span>}
                                  {message.status === 'sent' && <CheckCheck className="h-3 w-3" />}
                                  {!message.status && <CheckCheck className="h-3 w-3" />}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                        
                      </div>
                      
                      {/* Message Actions - Outside bubble */}
                      <div className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${message.user.id === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowReactionPicker(showReactionPicker === message.id ? null : message.id);
                          }}
                          className="hover:text-foreground"
                        >
                          React
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReply(message);
                          }}
                          className="hover:text-foreground"
                        >
                          Reply
                        </button>
                        {currentUser?.role === 'ADMIN' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(message.id);
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      
                      {/* Reactions */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5 max-w-full">
                          {message.reactions.map((reaction) => (
                            <button
                              key={`${message.id}-${reaction.emoji}`}
                              onClick={() => handleAddReaction(message.id, reaction.emoji)}
                              className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                                reaction.userIds.includes(session?.user?.id || '')
                                  ? 'bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700'
                                  : 'bg-accent/50 border-border hover:bg-accent'
                              }`}
                            >
                              <span className="text-xs leading-none">{reaction.emoji}</span>
                              {reaction.userIds.length > 1 && (
                                <span className="text-[10px] font-medium leading-none">{reaction.userIds.length}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Reaction Picker */}
                      {showReactionPicker === message.id && (
                        <div
                          ref={reactionPickerRef}
                          className="absolute z-50 bg-popover p-2 rounded-lg shadow-xl border mt-1"
                          style={{
                            bottom: '100%',
                            left: message.user.id === session?.user?.id ? 'auto' : '0',
                            right: message.user.id === session?.user?.id ? '0' : 'auto',
                            maxWidth: showExpandedEmojis ? '320px' : 'auto'
                          }}
                        >
                          <div className={`flex ${showExpandedEmojis ? 'flex-wrap' : ''} gap-1.5`}>
                            {/* Quick reactions */}
                            {['👍', '❤️', '😂', '😮', '😢', '🙏'].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddReaction(message.id, emoji);
                                }}
                                className="text-2xl p-2 hover:bg-accent rounded-md transition-colors hover:scale-110 active:scale-95"
                                title={`React with ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                            
                            {/* Academic emojis - shown when expanded */}
                            {showExpandedEmojis && (
                              <>
                                {['📚', '📖', '✏️', '📝', '🎓', '🧠', '💡', '🔬', '🧪', '📊', '📈', '🏆', '⭐', '✅', '💯', '🎯', '📌', '🔍', '💪', '🙌', '👏', '🤝', '🎉', '🔥'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddReaction(message.id, emoji);
                                    }}
                                    className="text-2xl p-2 hover:bg-accent rounded-md transition-colors hover:scale-110 active:scale-95"
                                    title={`React with ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </>
                            )}
                            
                            {/* Plus button to toggle expanded view */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowExpandedEmojis(!showExpandedEmojis);
                              }}
                              className="text-xl p-2 hover:bg-accent rounded-md transition-colors border border-border"
                              title={showExpandedEmojis ? "Show less" : "Show more emojis"}
                            >
                              {showExpandedEmojis ? '−' : '+'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
                )}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Join {selectedGroup.name}</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedGroup.description || 'Join this group to start chatting with members'}
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <Users className="h-4 w-4 inline mr-1" />
                      {selectedGroup.memberCount || selectedGroup.members?.length || 0} members
                    </p>
                  </div>
                  <Button
                    onClick={joinGroup}
                    disabled={isJoining || selectedGroup.isBanned}
                    className="mt-6"
                    size="lg"
                  >
                    {isJoining ? 'Joining...' : selectedGroup.isBanned ? 'You are banned' : 'Join Group'}
                  </Button>
                </div>
              </div>
            )}

            {/* Message Input - Fixed at bottom, only show if member and members sidebar is closed */}
            {selectedGroup.isMember && !showMembers && (
            <div className="flex-shrink-0 bg-background z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
              {/* Reply Preview */}
              {replyingTo && (
                <div className="px-4 py-3 bg-accent/30 border-t border-l-4 border-l-blue-500 flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground/70 font-medium mb-1">
                      Replying to {replyingTo.user.name}
                    </div>
                    <div className="text-sm text-muted-foreground/60 italic truncate">
                      {replyingTo.content}
                    </div>
                  </div>
                  <button
                    onClick={handleCancelReply}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 mt-0.5"
                    title="Cancel reply"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              
              <div className="border-t p-2 md:p-3">
              {/* Voice Recording UI */}
              {(isRecording || audioBlob) && (
                <div className="mb-3 p-3 bg-accent/50 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    {isRecording ? (
                      <>
                        <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Recording: {formatDuration(recordingDuration)}</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span className="text-sm font-medium">Voice note ready ({formatDuration(recordingDuration)})</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isRecording ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={stopRecording}
                      >
                        <StopCircle className="h-4 w-4 mr-1" />
                        Stop
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelRecording}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={sendVoiceNote}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              <div className="relative flex items-center gap-1 md:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  type="button"
                  disabled={isRecording || !!audioBlob}
                  className="h-9 w-9 md:h-10 md:w-10"
                >
                  <Smile className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setShowAttachMenu(!showAttachMenu);
                    setShowEmojiPicker(false);
                  }}
                  type="button"
                  disabled={isRecording || !!audioBlob}
                  className="h-9 w-9 md:h-10 md:w-10"
                >
                  <Plus className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
			
                
                {!isRecording && !audioBlob && (
                  <Input
                    ref={messageInputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (inputMessage.trim()) {
                          sendMessage(inputMessage);
                        }
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 h-9 md:h-10 text-sm md:text-base"
                  />
                )}
                
                {!inputMessage.trim() && !isRecording && !audioBlob && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={startRecording}
                    type="button"
                    title="Record voice note"
                    className="h-9 w-9 md:h-10 md:w-10"
                  >
                    <Mic className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                )}
                
                {inputMessage.trim() && (
                  <Button
                    onClick={() => {
                      if (inputMessage.trim()) {
                        sendMessage(inputMessage);
                      }
                    }}
                    disabled={!inputMessage.trim() || isLoading}
                    size="icon"
                    className="h-9 w-9 md:h-10 md:w-10"
                  >
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                )}
                
                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div
                    ref={emojiMenuRef}
                    className="absolute bottom-14 left-0 z-10 bg-popover p-2 rounded-lg shadow-lg border w-64 grid grid-cols-8 gap-1"
                  >
                    {COMMON_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setInputMessage(prev => prev + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl p-1 hover:bg-accent rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Attach Menu */}
                {showAttachMenu && (
                  <div
                    ref={attachMenuRef}
                    className="absolute bottom-14 left-10 z-10 bg-popover p-2 rounded-lg shadow-lg border w-48"
                  >
                    <button
                      onClick={() => {
                        imageInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded"
                    >
                      Image
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded"
                    >
                      File
                    </button>
                  </div>
                )}
                
                {/* Hidden file inputs */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              </div>
            </div>
            )}
          </>
        ) : (
          <div className="relative flex-1 flex flex-col items-center justify-center p-4">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")} // navigate to home
        className="absolute top-4 left-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Home Page
      </button>

      {/* Main content */}
      <div className="text-center max-w-md">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No group selected</h2>
        <p className="text-muted-foreground mb-6">
          Select a group from the sidebar to start chatting
        </p>
        <Button onClick={() => setShowGroupList(true)} className="md:hidden">
          Browse Groups
        </Button>
      </div>
    </div>
        )}
      </div>

      {/* Members Sidebar */}
      {showMembers && selectedGroup && (
        <div className={`
          ${showMembers ? 'flex' : 'hidden'}
          w-full sm:w-80 lg:w-96
          border-l flex-shrink-0 flex-col
          absolute sm:relative
          inset-0 sm:inset-auto
          z-[60] sm:z-0
          bg-background
          shadow-xl sm:shadow-none
        `}>
          <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">Members</h3>
                <p className="text-xs text-muted-foreground">{selectedGroup.members?.length || 0} members</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMembers(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* Group Call Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleGroupCall('voice')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Voice Call
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleGroupCall('video')}
              >
                <Video className="h-4 w-4 mr-2" />
                Video Call
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selectedGroup.members?.map((member, index) => {
              // Handle both member and member.users structures
              const user = member.users || member;
              const userId = user?.id || '';
              const userName = user?.name || 'Unknown User';
              const userAvatar = user?.avatar;
              const userRole = member.role || 'member';

              // Get color for member card
              const memberColor = GROUP_COLORS[index % GROUP_COLORS.length];
              
              return (
                <div
                  key={userId}
                  className={`
                    flex items-center justify-between p-4 rounded-xl
                    bg-gradient-to-br border transition-all duration-200
                    hover:shadow-md hover:scale-[1.01]
                    ${memberColor}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar 
                      src={userAvatar} 
                      name={userName} 
                      className="h-12 w-12 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{userName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={userRole === 'admin' ? 'default' : userRole === 'moderator' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                        </Badge>
                        {userId === session?.user?.id && (
                          <span className="text-xs text-muted-foreground">(You)</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedMemberMenu(selectedMemberMenu === userId ? null : userId)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                    {selectedMemberMenu === userId && (
                      <div ref={memberMenuRef} className="absolute right-0 top-10 z-10 bg-popover border rounded-lg shadow-lg p-2 min-w-[180px]">
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded flex items-center gap-2"
                          onClick={() => {
                            handleViewProfile(user);
                            setSelectedMemberMenu(null);
                          }}
                        >
                          <Users className="h-4 w-4" />
                          View Profile
                        </button>
                        {userId !== session?.user?.id && (
                          <>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded flex items-center gap-2"
                              onClick={() => {
                                handleDirectMessage(user);
                                setSelectedMemberMenu(null);
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                              Direct Message
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded flex items-center gap-2"
                              onClick={() => {
                                handleDirectCall(user, 'voice');
                                setSelectedMemberMenu(null);
                              }}
                            >
                              <Phone className="h-4 w-4" />
                              Voice Call
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded flex items-center gap-2"
                              onClick={() => {
                                handleDirectCall(user, 'video');
                                setSelectedMemberMenu(null);
                              }}
                            >
                              <Video className="h-4 w-4" />
                              Video Call
                            </button>
                          </>
                        )}
                        {currentUser?.role === 'ADMIN' && userRole !== 'admin' && userId !== session?.user?.id && (
                          <>
                            <div className="border-t my-1"></div>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent rounded text-red-600 flex items-center gap-2"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAdminMenu(true);
                                setSelectedMemberMenu(null);
                              }}
                            >
                              <X className="h-4 w-4" />
                              Ban User
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

{/* Group Call Modal */}
{showGroupCall && selectedGroup && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
    <div className="bg-background p-6 rounded-xl max-w-2xl w-full mx-4 border shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
            callType === 'video' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-green-100 dark:bg-green-900/30'
          }`}>
            {callType === 'video' ? (
              <Video className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            ) : (
              <Phone className="h-6 w-6 text-green-600 dark:text-green-500" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{callType === 'video' ? 'Video' : 'Voice'} Call</h3>
            <p className="text-sm text-muted-foreground">{selectedGroup.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowGroupCall(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-accent/30 rounded-lg p-8 mb-4 text-center">
        <div className="mb-4">
          {callType === 'video' ? (
            <Video className="h-16 w-16 mx-auto text-muted-foreground" />
          ) : (
            <Phone className="h-16 w-16 mx-auto text-muted-foreground" />
          )}
        </div>
        <h4 className="text-lg font-medium mb-2">Group Call Feature</h4>
        <p className="text-sm text-muted-foreground mb-4">
          {callType === 'video' ? 'Video' : 'Voice'} calling functionality will be implemented with WebRTC.
          All members will be able to join the call.
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{selectedGroup.members?.length || 0} members can join</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowGroupCall(false)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={() => {
            toast({
              title: 'Starting Call',
              description: `Initiating ${callType} call...`,
            });
            setShowGroupCall(false);
            // TODO: Implement WebRTC call logic
          }}
        >
          Start Call
        </Button>
      </div>
    </div>
  </div>
)}

{/* Leave Confirmation Dialog */}
{showLeaveConfirm && selectedGroup && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
    <div className="bg-background p-6 rounded-xl max-w-md w-full mx-4 border shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <LogOut className="h-6 w-6 text-red-600 dark:text-red-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Leave Group?</h3>
          <p className="text-sm text-muted-foreground">Are you sure you want to leave?</p>
        </div>
      </div>
      
      <div className="bg-accent/50 rounded-lg p-3 mb-4">
        <p className="text-sm">
          You are about to leave <strong>{selectedGroup.name}</strong>. You can rejoin anytime.
        </p>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setShowLeaveConfirm(false)}
          className="flex-1"
          disabled={isLeaving}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={leaveGroup}
          className="flex-1"
          disabled={isLeaving}
        >
          {isLeaving ? 'Leaving...' : 'Leave Group'}
        </Button>
      </div>
    </div>
  </div>
)}

{/* Admin Menu Modal */}
{showAdminMenu && selectedUser && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
    <div className="bg-background p-6 rounded-lg max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold mb-4">Admin Actions</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Manage user: <strong>{selectedUser.name}</strong>
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Ban Reason (optional)
          </label>
          <Input
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            placeholder="Reason for banning..."
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => handleBanUser(selectedUser.id, banReason)}
            className="flex-1"
          >
            Ban User
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowAdminMenu(false);
              setSelectedUser(null);
              setBanReason('');
            }}
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
    </div>
  );
}