'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Avatar from '@/components/Avatar';
import { MessageCircle, Send, ArrowLeft, Loader2, Mic, Play, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface Message {
  id: string;
  content: string;
  senderId: string;
  messageType: string;
  mediaUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  messages: Message[];
}

export default function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = searchParams.get('userId');
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Fetch conversation
  useEffect(() => {
    if (status === 'authenticated' && userId) {
      fetchConversation();
      // Poll for new messages every 3 seconds
      const interval = setInterval(fetchConversation, 3000);
      return () => clearInterval(interval);
    }
  }, [status, userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to load conversation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !userId) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: userId,
          content,
          messageType: 'text',
        }),
      });

      if (response.ok) {
        setInputMessage('');
        await fetchConversation();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to send message',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsRecording(false);
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      };
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
    if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
  };

  const sendVoiceNote = async () => {
    if (!audioBlob || !userId) return;

    setSending(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice_note.webm');
      formData.append('recipientId', userId);
      formData.append('messageType', 'voice');

      const response = await fetch('/api/messages', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setAudioBlob(null);
        setRecordingDuration(0);
        await fetchConversation();
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.error || 'Failed to send voice note',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending voice note:', error);
      toast({
        title: 'Error',
        description: 'Failed to send voice note',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Select a conversation</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a user to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {conversation ? (
        <>
          <CardHeader className="border-b flex flex-row items-center space-x-2 flex-shrink-0">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Avatar 
                src={conversation.otherUser.avatar} 
                name={conversation.otherUser.name} 
                className="h-10 w-10"
              />
              <div>
                <h2 className="font-semibold">{conversation.otherUser.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {conversation.messages.length > 0 ? 'Last seen recently' : 'No messages yet'}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
            {conversation.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">No messages yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Send a message to start the conversation</p>
              </div>
            ) : (
              conversation.messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                      message.senderId === session?.user?.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {message.content && <p className="break-words">{message.content}</p>}
                    <p className={`text-xs mt-1 ${message.senderId === session?.user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {formatDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Fixed Input Section at Bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
            <div className="max-w-4xl mx-auto p-2 md:p-3">
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
                          disabled={sending}
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
                    placeholder="Type a message..."
                    className="flex-1 h-9 md:h-10 text-sm md:text-base placeholder:text-center"
                    disabled={sending}
                  />
                )}
                
                {!inputMessage.trim() && !isRecording && !audioBlob && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={startRecording}
                    type="button"
                    title="Record voice note"
                    disabled={sending}
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
                    disabled={!inputMessage.trim() || sending}
                    size="icon"
                    className="h-9 w-9 md:h-10 md:w-10"
                  >
                    <Send className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                )}
                
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
}