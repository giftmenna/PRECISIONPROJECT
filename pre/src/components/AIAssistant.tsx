'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Plus, Trash2, Bot, User, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  metadata?: any;
}

interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}

export default function AIAssistant() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    if (session?.user) {
      loadConversations();
    }
  }, [session]);

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/ai/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    }
  };

  const createNewConversation = async () => {
    setIsCreatingConversation(true);
    try {
      const response = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });

      if (response.ok) {
        const data = await response.json();
        const newConversation = data.conversation;
        setConversations([newConversation, ...conversations]);
        setCurrentConversation(newConversation);
        setMessages([]);
        toast({
          title: 'Success',
          description: 'New conversation created',
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data.conversation);
        setMessages(data.conversation.messages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive',
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          message: inputMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        
        // Update conversation in list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversation.id 
              ? { ...conv, updatedAt: new Date().toISOString() }
              : conv
          )
        );
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send message',
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
      setIsLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        toast({
          title: 'Success',
          description: 'Conversation deleted',
        });
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!session?.user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please sign in to use the AI Assistant
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)] min-h-[500px] gap-4">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex items-center gap-2"
        >
          {showSidebar ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          {showSidebar ? 'Hide' : 'Show'} Conversations
        </Button>
        {currentConversation && (
          <span className="text-sm text-muted-foreground truncate">
            {currentConversation.title}
          </span>
        )}
      </div>

      {/* Conversations Sidebar */}
      <Card className={`w-full lg:w-80 flex-shrink-0 transition-all duration-300 ${
        showSidebar ? 'block' : 'hidden lg:block'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base lg:text-lg">Conversations</CardTitle>
            <Button
              size="sm"
              onClick={createNewConversation}
              disabled={isCreatingConversation}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3 lg:p-6">
          {conversations.length === 0 ? (
            <p className="text-xs lg:text-sm text-muted-foreground text-center py-4">
              No conversations yet. Start a new one!
            </p>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?.id === conversation.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                }`}
                onClick={() => {
                  loadConversation(conversation.id);
                  setShowSidebar(false); // Close sidebar on mobile after selection
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs lg:text-sm truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
            <MessageCircle className="h-4 w-4 lg:h-5 lg:w-5" />
            <span className="truncate">
              {currentConversation ? currentConversation.title : 'AI Assistant'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-3 lg:p-6 min-h-0">
          {!currentConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4">
                <Bot className="h-8 w-8 lg:h-12 lg:w-12 mx-auto mb-3 lg:mb-4 text-muted-foreground" />
                <h3 className="text-base lg:text-lg font-medium mb-2">Welcome to your AI Assistant!</h3>
                <p className="text-sm lg:text-base text-muted-foreground mb-4 max-w-md mx-auto">
                  Ask anything: math problems, how to use the app, account help, or general questions.
                </p>
                <Button 
                  onClick={createNewConversation} 
                  disabled={isCreatingConversation}
                  size="sm"
                  className="lg:text-base"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 lg:space-y-4 mb-3 lg:mb-4 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6 lg:py-8">
                    <Bot className="h-6 w-6 lg:h-8 lg:w-8 mx-auto mb-2" />
                    <p className="text-sm lg:text-base">Start chatting with your AI assistant!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 lg:gap-3 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[85%] lg:max-w-[80%] rounded-lg p-2 lg:p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-3 w-3 lg:h-4 lg:w-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs lg:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                          {message.role === 'user' && (
                            <User className="h-3 w-3 lg:h-4 lg:w-4 mt-0.5 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex gap-2 lg:gap-3 justify-start">
                    <div className="bg-muted rounded-lg p-2 lg:p-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-3 w-3 lg:h-4 lg:w-4" />
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm lg:text-base"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!inputMessage.trim() || isLoading}
                  size="sm"
                  className="h-9 w-9 lg:h-10 lg:w-10 p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 