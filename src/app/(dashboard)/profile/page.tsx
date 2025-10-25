
'use client';

import { useUser, useAuth, useFirestore } from '@/firebase/provider';
import { getStorageInstance } from '@/firebase';
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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const buddyFormSchema = z.object({
  buddyName: z.string().min(2, { message: "Buddy's name must be at least 2 characters." }),
  buddyPfp: z.any().optional(),
  enableVoice: z.boolean().default(true),
  language: z.string().default('English'),
});

const languages = [
    'English', 'Spanish', 'French', 'German', 'Hindi', 'Mandarin', 'Japanese', 'Arabic', 'Russian', 'Portuguese'
];

export default function ProfilePage() {
  const user = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isBuddyLoading, setIsBuddyLoading] = useState(false);
  const [buddyPfpPreview, setBuddyPfpPreview] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(true);

  const buddyForm = useForm<z.infer<typeof buddyFormSchema>>({
    resolver: zodResolver(buddyFormSchema),
    defaultValues: {
      buddyName: 'Buddy',
      enableVoice: true,
      language: 'English',
      buddyPfp: null,
    },
  });

  useEffect(() => {
    async function fetchBuddyProfile() {
      if (user && db) {
        setIsFetching(true);
        const buddyRef = doc(db, 'buddies', user.uid);
        try {
          const docSnap = await getDoc(buddyRef);
          if (docSnap.exists()) {
            const buddyData = docSnap.data();
            const defaultValues = { 
              buddyName: buddyData.name || 'Buddy',
              enableVoice: buddyData.enableVoice !== false,
              language: buddyData.language || 'English',
              buddyPfp: null,
            };
            buddyForm.reset(defaultValues);
            if (buddyData.pfpUrl) {
              setBuddyPfpPreview(buddyData.pfpUrl);
            }
          }
        } catch(error) {
            console.error("Failed to fetch buddy profile:", error);
            toast({
                variant: 'destructive',
                title: 'Load Failed',
                description: 'Could not load your buddy profile.'
            });
        } finally {
            setIsFetching(false);
        }
      }
    }
    fetchBuddyProfile();
  }, [user, db, buddyForm.reset, toast]);

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      buddyForm.setValue('buddyPfp', e.target.files, { shouldDirty: true });
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
    if (!name) return 'B';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  async function onBuddySubmit(values: z.infer<typeof buddyFormSchema>) {
    if (!user || !db) return;
    setIsBuddyLoading(true);

    try {
      const storage = getStorageInstance();
      const pfpFile = values.buddyPfp?.[0];
      let pfpUrl = buddyPfpPreview; // Keep existing image if no new one is uploaded
      
      const dataToSave: {
        name: string;
        enableVoice: boolean;
        language: string;
        pfpUrl?: string | null;
      } = {
        name: values.buddyName,
        enableVoice: values.enableVoice,
        language: values.language,
        pfpUrl: pfpUrl,
      };

      if (pfpFile) {
        const pfpRef = ref(storage, `buddy-pfps/${user.uid}/${pfpFile.name}`);
        const snapshot = await uploadBytes(pfpRef, pfpFile);
        pfpUrl = await getDownloadURL(snapshot.ref);
        dataToSave.pfpUrl = pfpUrl;
      }
      
      const buddyRef = doc(db, 'buddies', user.uid);
      await setDoc(buddyRef, dataToSave, { merge: true });

      toast({ title: 'Buddy Updated', description: "Your buddy's profile has been saved." });
      buddyForm.reset(values); // Re-sync form state with latest saved data
      if (pfpUrl) setBuddyPfpPreview(pfpUrl);
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

  if (isFetching || !user) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <Card><CardHeader><CardTitle>Loading Profile...</CardTitle></CardHeader><CardContent><Loader2 className="h-8 w-8 animate-spin" /></CardContent></Card>
        </div>
    );
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
                                onChange={handlePfpChange}
                            />
                        </FormControl>
                      </div>
                      <FormMessage />
                  </FormItem>
                  )}
              />

               <FormField
                control={buddyForm.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map(lang => (
                            <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

              <Button type="submit" disabled={isBuddyLoading || !buddyForm.formState.isDirty}>
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
