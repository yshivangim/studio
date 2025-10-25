'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Music, Shirt, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const featureCards = [
  {
    href: '/homework',
    icon: BookOpen,
    title: 'Homework Helper',
    description: 'Stuck on a problem? Get instant help.',
  },
  {
    href: '/music',
    icon: Music,
    title: 'Music Recommender',
    description: 'Find your next favorite song.',
  },
  {
    href: '/fashion',
    icon: Shirt,
    title: 'Fashion Advisor',
    description: 'Get personalized style suggestions.',
  },
  {
    href: '/tts',
    icon: MessageSquare,
    title: 'Text to Speech',
    description: 'Bring your text to life with a voice.',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0] || 'friend'}!
        </h1>
        <p className="text-muted-foreground">
          What can I help you with today?
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((feature) => (
          <Link href={feature.href} key={feature.href}>
            <Card className="group flex h-full transform flex-col justify-between transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="font-headline text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <div className="p-6 pt-0">
                <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
