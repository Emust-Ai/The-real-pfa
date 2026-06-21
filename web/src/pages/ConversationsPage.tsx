import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { MessageSquare, Send, ChevronLeft } from 'lucide-react';
import { toast } from '../components/ui/toast';

interface Participant {
  id: number;
  userId: number;
  user: { id: number; firstName: string | null; lastName: string | null; email: string };
}

interface Conversation {
  id: number;
  property: { id: number; title: string };
  participants: Participant[];
  lastMessage: { id: number; content: string; createdAt: string; senderId: number; isRead: boolean } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  sender: { id: number; firstName: string | null; lastName: string | null };
  isRead: boolean;
  createdAt: string;
}

export function ConversationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const open = searchParams.get('open');
    if (open) {
      setActiveId(Number(open));
      setSearchParams({}, { replace: true });
    }
  }, []);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () => api.get('/conversations').then(r => r.data),
    refetchInterval: 10000,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', activeId],
    queryFn: () => api.get(`/conversations/${activeId}/messages`).then(r => r.data),
    enabled: !!activeId,
  });

  const sendMsg = useMutation({
    mutationFn: (content: string) => api.post(`/conversations/${activeId}/messages`, { content }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['messages', activeId] });
      const prev = queryClient.getQueryData<Message[]>(['messages', activeId]);
      const optimistic: Message = {
        id: Date.now(),
        content,
        senderId: -1,
        sender: { id: -1, firstName: 'You', lastName: null },
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      queryClient.setQueryData<Message[]>(['messages', activeId], (old = []) => [...old, optimistic]);
      return { prev };
    },
    onError: (_err, _content, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['messages', activeId], ctx.prev);
      toast('Failed to send message', 'error');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeConv = conversations.find(c => c.id === activeId);

  const otherParticipant = (conv: Conversation) => {
    const me = conv.participants.find(p => p.userId === -1);
    const other = conv.participants.find(p => p.userId !== -1);
    return other?.user ?? { firstName: 'Unknown', lastName: '', email: '' };
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4 p-6">
      <div className="w-80 shrink-0 border rounded-lg overflow-y-auto">
        <div className="p-3 border-b font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Conversations
        </div>
        {conversations.length === 0 && (
          <p className="text-sm text-muted-foreground p-4 text-center">No conversations yet</p>
        )}
        {conversations.map(conv => {
          const other = conv.participants[0]?.user;
          return (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`w-full text-left p-3 border-b hover:bg-accent transition-colors ${
                activeId === conv.id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{conv.property.title}</p>
                {conv.unreadCount > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {other?.firstName ?? 'Unknown'} {other?.lastName ?? ''}
              </p>
              {conv.lastMessage && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.lastMessage.content}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 border rounded-lg flex flex-col">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a conversation</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 border-b">
              <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setActiveId(null)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="font-medium text-sm truncate">
                  {activeConv?.property.title ?? 'Conversation'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {otherParticipant(activeConv!)?.firstName ?? ''}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => {
                const isMine = msg.senderId === -1;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMine ? 'order-1' : 'order-1'}`}>
                      <div className={`rounded-lg px-3 py-2 text-sm ${
                        isMine
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}>
                        <p className="text-xs font-medium mb-0.5 opacity-70">
                          {msg.sender.firstName ?? 'Unknown'}
                        </p>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          <span className="text-[10px]">
                            {msg.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3">
              <form onSubmit={e => {
                e.preventDefault();
                if (input.trim() && activeId) {
                  sendMsg.mutate(input.trim());
                  setInput('');
                }
              }} className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!input.trim() || sendMsg.isPending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
