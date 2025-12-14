"use client";

import { useState } from 'react';
import { MoreVertical, MessageCircle, User, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  lastSeen?: string;
  status?: 'online' | 'offline' | 'typing';
}

interface GroupMembersProps {
  members?: GroupMember[];
  currentUserId?: string;
  onSendMessage: (userId: string) => void;
  onCall?: (userId: string) => void;
  onVideoCall?: (userId: string) => void;
}

export function GroupMembers({ 
  members = [], 
  currentUserId = '', 
  onSendMessage,
  onCall = () => {},
  onVideoCall = () => {}
}: GroupMembersProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (!Array.isArray(members)) {
    console.error('Members is not an array:', members);
    return (
      <div className="p-4 text-center text-muted-foreground">
        Error loading members
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No members to display
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-medium">Group Members ({members.length})</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {members.map((member) => {
          if (!member?.id) return null;
          const isCurrentUser = member.id === currentUserId;
          
          return (
            <div key={member.id} className="relative">
              <div className="flex items-center p-3 hover:bg-accent/50 transition-colors">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    {member.avatar ? (
                      <AvatarImage src={member.avatar} alt={member.name || 'User'} />
                    ) : (
                      <AvatarFallback className="bg-muted">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {member.status === 'online' && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {member.name || 'Unknown User'}
                      {isCurrentUser && ' (You)'}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {member.lastSeen || 'online'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </p>
                </div>

                {!isCurrentUser && (
                  <div className="flex items-center space-x-2 ml-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onCall(member.id)}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onVideoCall(member.id)}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onSendMessage(member.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <Separator className="mx-4" />
            </div>
          );
        })}
      </div>
    </div>
  );
}