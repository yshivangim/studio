'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Music, Disc } from 'lucide-react';
import { generateMusicSuggestions, type GenerateMusicSuggestionsOutput } from '@/ai/flows/generate-music-suggestions';

const formSchema = z.object({
  listeningHabits: z.string().min(10, 'Please describe your music taste.'),
  mood: z.string().min(3, 'Please describe your current mood.'),
  activity: z.string().min(3, 'Please describe what you are doing.'),
});

export default function MusicPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateMusicSuggestionsOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      listeningHabits: '',
      mood: '',
      activity: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateMusicSuggestions(values);
      setResult(response);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to get music suggestions.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Music Recommender</h1>
        <p className="text-muted-foreground">
          Tell us about your vibe, and we'll suggest some tunes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Find Your Next Jam</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="listeningHabits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you listen to?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I like indie pop artists like Clairo and beabadoobee, and some classic rock like Led Zeppelin.'"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="mood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What's your mood?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Chill and relaxed'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What are you doing?</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 'Studying for an exam'" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {result && result.suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Music className="h-6 w-6 text-primary" /> Here's what we found</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Disc className="h-5 w-5 mt-1 text-primary/80 shrink-0" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
