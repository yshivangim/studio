
'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, User, Sparkles } from 'lucide-react';
import { talkToBuddy, type TalkToBuddyOutput } from '@/ai/flows/talk-to-buddy';
import { useUser } from '@/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});

interface ChatMessage {
  role: 'user' | 'buddy';
  content: string;
  audioDataUri?: string;
}

export default function BuddyPage() {
  const appUser = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'buddy' && lastMessage.audioDataUri && audioRef.current) {
        audioRef.current.src = lastMessage.audioDataUri;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, [messages]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: values.message };
    setMessages(prev => [...prev, userMessage]);
    form.reset();

    try {
      const response = await talkToBuddy({ 
        message: values.message,
        conversationHistory: JSON.stringify(messages) // Pass history to AI
      });
      const buddyMessage: ChatMessage = { role: 'buddy', content: response.reply, audioDataUri: response.audioDataUri };
      setMessages(prev => [...prev, buddyMessage]);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to get a response from Buddy.',
      });
       const buddyMessage: ChatMessage = { role: 'buddy', content: "Sorry, I'm having a little trouble thinking straight right now. Could you try again in a moment?" };
       setMessages(prev => [...prev, buddyMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
       <div className="mb-4">
        <h1 className="text-3xl font-bold font-headline">Chat with your Buddy</h1>
        <p className="text-muted-foreground">
          Your personal AI companion. Ask it anything!
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4 md:p-6">
            <div ref={scrollAreaRef} className="flex-1 space-y-6 overflow-y-auto pr-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Sparkles className="h-16 w-16 text-primary/50 mb-4" />
                        <h2 className="text-2xl font-headline text-muted-foreground">This is your Buddy.</h2>
                        <p className="text-muted-foreground">Ask a question, get advice, or just chat about your day!</p>
                    </div>
                )}
                {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'buddy' && (
                        <Avatar className="h-9 w-9 border-2 border-primary">
                            <div className="bg-primary h-full w-full flex items-center justify-center">
                               <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                        </Avatar>
                    )}
                    <div className={`max-w-lg rounded-xl p-3 px-4 shadow-sm ${
                        message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                     {message.role === 'user' && (
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={appUser?.photoURL || ''} alt={appUser?.displayName || 'User'} />
                            <AvatarFallback>{getInitials(appUser?.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-4">
                        <Avatar className="h-9 w-9 border-2 border-primary">
                             <div className="bg-primary h-full w-full flex items-center justify-center">
                               <Sparkles className="h-5 w-5 text-primary-foreground" />
                            </div>
                        </Avatar>
                        <div className="max-w-lg rounded-xl p-3 px-4 shadow-sm bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 border-t pt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
                <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormControl>
                        <Textarea
                            placeholder="Ask your buddy anything..."
                            className="min-h-[40px] max-h-48 resize-none"
                            {...field}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)();
                                }
                            }}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading} size="icon">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
                </form>
            </Form>
            </div>
        </CardContent>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
