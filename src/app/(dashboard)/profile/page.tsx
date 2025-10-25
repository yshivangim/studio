'use client';

import { useUser, useAuth, useFirestore } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const buddyFormSchema = z.object({
  buddyName: z.string().min(2, { message: "Buddy's name must be at least 2 characters." }),
  buddyPfp: z.any().optional(),
  enableVoice: z.boolean().default(true),
  voice: z.string().default('Algenib'),
});

export default function ProfilePage() {
  const user = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isBuddyLoading, setIsBuddyLoading] = useState(false);
  const [buddyPfpPreview, setBuddyPfpPreview] = useState<string | null>(null);

  const buddyForm = useForm<z.infer<typeof buddyFormSchema>>({
    resolver: zodResolver(buddyFormSchema),
    defaultValues: {
      buddyName: 'Buddy',
      enableVoice: true,
      voice: 'Algenib',
    },
  });

  useEffect(() => {
    if (user && db) {
      const buddyRef = doc(db, 'buddies', user.uid);
      getDoc(buddyRef).then((docSnap) => {
        if (docSnap.exists()) {
          const buddyData = docSnap.data();
          buddyForm.reset({ 
            buddyName: buddyData.name || 'Buddy',
            enableVoice: buddyData.enableVoice !== false, // default to true
            voice: buddyData.voice || 'Algenib'
          });
          setBuddyPfpPreview(buddyData.pfpUrl);
        }
      });
    }
  }, [user, db, buddyForm]);

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuddyPfpPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/login');
    } catch (error: any) {
      console.error('Sign Out Error', error.code, error.message);
      toast({ variant: 'destructive', title: 'Sign Out Failed', description: 'An error occurred while signing out.' });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  };

  async function onBuddySubmit(values: z.infer<typeof buddyFormSchema>) {
    if (!user || !db) return;
    setIsBuddyLoading(true);

    try {
      const storage = getStorage();
      const pfpFile = values.buddyPfp?.[0];
      let pfpUrl = buddyPfpPreview;

      if (pfpFile) {
        const pfpRef = ref(storage, `buddy-pfps/${user.uid}/${pfpFile.name}`);
        const snapshot = await uploadBytes(pfpRef, pfpFile);
        pfpUrl = await getDownloadURL(snapshot.ref);
      }
      
      const buddyRef = doc(db, 'buddies', user.uid);
      await setDoc(buddyRef, { 
        name: values.buddyName, 
        pfpUrl,
        enableVoice: values.enableVoice,
        voice: values.voice,
       }, { merge: true });

      toast({ title: 'Buddy Updated', description: 'Your buddy\'s profile has been saved.' });
    } catch (error: any) {
      console.error('Buddy Update Error', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update buddy profile.',
      });
    } finally {
      setIsBuddyLoading(false);
    }
  }

  if (!user) {
    return null; // Or a loading state
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
        <p className="text-muted-foreground">View and manage your account details.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
              <AvatarFallback className="text-2xl">{getInitials(user.displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-headline">{user.displayName || 'Anonymous User'}</CardTitle>
              <CardDescription>Manage your personal information and settings.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" value={user.displayName || ''} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={user.email || ''} readOnly />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Customize Your Buddy</CardTitle>
            <CardDescription>Give your AI companion a personal touch.</CardDescription>
        </CardHeader>
        <CardContent>
           <Form {...buddyForm}>
            <form onSubmit={buddyForm.handleSubmit(onBuddySubmit)} className="space-y-8">
               <FormField
                control={buddyForm.control}
                name="buddyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buddy's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alex, Sparky" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                  control={buddyForm.control}
                  name="buddyPfp"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Buddy's Profile Picture</FormLabel>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={buddyPfpPreview || ''} alt="Buddy PFP" />
                            <AvatarFallback>{getInitials(buddyForm.getValues('buddyName'))}</AvatarFallback>
                        </Avatar>
                        <FormControl>
                            <Input
                                type="file"
                                accept="image/*"
                                className="max-w-xs"
                                onChange={(e) => {
                                    field.onChange(e.target.files);
                                    handlePfpChange(e);
                                }}
                            />
                        </FormControl>
                      </div>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              
              <FormField
                control={buddyForm.control}
                name="enableVoice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Voice Replies
                      </FormLabel>
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={buddyForm.control}
                name="voice"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Buddy's Voice Style</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Algenib" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Voice A (Female)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Achernar" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Voice B (Male)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isBuddyLoading}>
                {isBuddyLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Buddy Profile
              </Button>
            </form>
           </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Account Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} className="w-full sm:w-auto" disabled={!auth}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
