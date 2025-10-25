
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
import { Loader2, Send, Paperclip, X } from 'lucide-react';
import { talkToBuddy } from '@/ai/flows/talk-to-buddy';
import { useUser, useFirestore } from '@/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  message: z.string(),
  image: z.any().optional(),
});

interface ChatMessage {
  role: 'user' | 'buddy';
  content: string;
  audioDataUri?: string;
  photoDataUri?: string;
}

interface BuddyProfile {
  name: string;
  pfpUrl: string;
  enableVoice: boolean;
  voice: string;
}

export default function BuddyPage() {
  const appUser = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [buddyProfile, setBuddyProfile] = useState<BuddyProfile>({ name: 'Buddy', pfpUrl: '', enableVoice: true, voice: 'Algenib' });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    if (appUser && db) {
      const buddyRef = doc(db, 'buddies', appUser.uid);
      getDoc(buddyRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
           setBuddyProfile({
            name: data.name || 'Buddy',
            pfpUrl: data.pfpUrl || '',
            enableVoice: data.enableVoice !== false, // default to true
            voice: data.voice || 'Algenib'
          });
        }
      });
    }
  }, [appUser, db]);

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
    if (!name) return 'B';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
        setImagePreview(null);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
      });
  }

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('image', null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if ((!values.message || values.message.trim() === '') && !imagePreview) return;

    setIsLoading(true);
    
    let photoDataUri: string | undefined = imagePreview || undefined;
    
    const userMessage: ChatMessage = { role: 'user', content: values.message, photoDataUri };
    setMessages(prev => [...prev, userMessage]);
    form.reset();
    removeImage();
    textareaRef.current?.focus();

    try {
      const response = await talkToBuddy({ 
        message: values.message,
        photoDataUri,
        buddyName: buddyProfile.name,
        conversationHistory: JSON.stringify(messages.slice(-10)), // Pass recent history
        enableVoice: buddyProfile.enableVoice,
        voice: buddyProfile.voice
      });
      const buddyMessage: ChatMessage = { role: 'buddy', content: response.reply, audioDataUri: response.audioDataUri };
      setMessages(prev => [...prev, buddyMessage]);
    } catch (error: any) {
      console.error("Talk to Buddy Error:", error);
       const buddyErrorMessage: ChatMessage = { role: 'buddy', content: "Sorry, I'm having a little trouble thinking straight right now. Could you try again in a moment?" };
       setMessages(prev => [...prev, buddyErrorMessage]);
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to get a response from Buddy.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
       <div className="mb-4">
        <h1 className="text-3xl font-bold font-headline">Chat with {buddyProfile.name}</h1>
        <p className="text-muted-foreground">
          Your personal AI companion. Ask it anything!
        </p>
      </div>

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4 md:p-6">
            <div ref={scrollAreaRef} className="flex-1 space-y-6 overflow-y-auto pr-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                            <AvatarImage src={buddyProfile.pfpUrl} alt={buddyProfile.name} />
                            <AvatarFallback className="text-4xl bg-primary/10">{getInitials(buddyProfile.name)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-2xl font-headline text-muted-foreground">This is {buddyProfile.name}.</h2>
                        <p className="text-muted-foreground">Ask a question, get advice, or just chat about your day!</p>
                    </div>
                )}
                {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'buddy' && (
                        <Avatar className="h-9 w-9 border-2 border-primary">
                            <AvatarImage src={buddyProfile.pfpUrl} alt={buddyProfile.name} />
                            <AvatarFallback>{getInitials(buddyProfile.name)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`max-w-lg rounded-xl p-3 px-4 shadow-sm ${
                        message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                     {message.photoDataUri && (
                        <div className="relative w-full aspect-video rounded-md mb-2 overflow-hidden">
                           <Image src={message.photoDataUri} alt="User upload" fill className="object-cover" />
                        </div>
                     )}
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
                            <AvatarImage src={buddyProfile.pfpUrl} alt={buddyProfile.name} />
                             <AvatarFallback>{getInitials(buddyProfile.name)}</AvatarFallback>
                        </Avatar>
                        <div className="max-w-lg rounded-xl p-3 px-4 shadow-sm bg-muted flex items-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 border-t pt-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                 <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                              <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                        field.onChange(e.target.files);
                                        handleImageChange(e);
                                    }}
                                />
                                <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                              </div>
                            </FormControl>
                        </FormItem>
                    )}
                 />
                <div className="flex-1 relative">
                  {imagePreview && (
                    <div className="absolute bottom-full left-0 mb-2 w-32 h-32 p-1 bg-background border rounded-md">
                        <Image src={imagePreview} alt="Image preview" fill className="object-contain rounded-md" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                    </div>
                  )}
                  <Textarea
                      ref={textareaRef}
                      placeholder={`Message ${buddyProfile.name}...`}
                      className="min-h-[40px] max-h-48 resize-none pr-12"
                      {...form.register('message')}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              form.handleSubmit(onSubmit)();
                          }
                      }}
                  />
                  <Button type="submit" disabled={isLoading} size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8">
                      <Send className="h-4 w-4" />
                  </Button>
                </div>
                </form>
            </Form>
            </div>
        </CardContent>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
