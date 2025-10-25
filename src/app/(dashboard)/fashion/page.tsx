'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shirt, Sparkles } from 'lucide-react';
import { getFashionSuggestions, type FashionSuggestionsOutput } from '@/ai/flows/get-fashion-suggestions';

const formSchema = z.object({
  userPreferences: z.string().min(10, 'Please describe your style preferences.'),
  currentTrends: z.string().optional(),
});

export default function FashionPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FashionSuggestionsOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: '',
      currentTrends: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await getFashionSuggestions({
        ...values,
        recentInteractions: 'none', // Placeholder for now
      });
      setResult(response);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to get fashion suggestions.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Fashion Advisor</h1>
        <p className="text-muted-foreground">
          Describe your style and get personalized fashion recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Define Your Style</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userPreferences"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Fashion Preferences</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I prefer a minimalist style with neutral colors. I like comfortable clothes like oversized sweaters and wide-leg pants.'"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentTrends"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Trends You're Interested In (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'I've seen a lot of ballet flats and chrome accessories lately.'"
                        className="min-h-[60px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Advice
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

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="h-6 w-6 text-primary" /> Your Personalized Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap rounded-md bg-muted/50 p-4">
                {result.suggestions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
