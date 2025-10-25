
'use client';

import { useUser, useAuth } from '@/firebase/provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


export default function ProfilePage() {
  const user = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        toast({ title: "Signed Out", description: "You have been successfully signed out." });
        router.push('/login');
    } catch (error) {
        toast({ variant: 'destructive', title: "Sign Out Failed", description: "An error occurred while signing out." });
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name[0];
  }

  if (!user) {
    return null; // Or a loading state
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">Your Profile</h1>
        <p className="text-muted-foreground">
          View and manage your account details.
        </p>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
                    <AvatarFallback className="text-2xl">
                      {getInitials(user.displayName)}
                    </AvatarFallback>
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
