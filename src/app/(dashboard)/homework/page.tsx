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
import { Loader2, BookOpen, Lightbulb, ListOrdered } from 'lucide-react';
import { generateHomeworkHelp, type GenerateHomeworkHelpOutput } from '@/ai/flows/generate-homework-help';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  question: z.string().min(10, {
    message: 'Please enter a question of at least 10 characters.',
  }),
});

export default function HomeworkPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateHomeworkHelpOutput | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateHomeworkHelp({ question: values.question });
      setResult(response);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to get homework help.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">AI Homework Helper</h1>
        <p className="text-muted-foreground">
          Enter a homework question and our AI tutor will provide an explanation, example, and solution.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Your Question</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you need help with?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'What is the Pythagorean theorem?' or 'Explain the process of photosynthesis.'"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Help
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
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><BookOpen className="h-6 w-6 text-primary"/> Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{result.explanation}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Lightbulb className="h-6 w-6 text-primary"/> Example</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{result.example}</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><ListOrdered className="h-6 w-6 text-primary"/> Solution</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{result.solution}</p>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
