'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookOpen, Lightbulb, ListOrdered, Upload, X } from 'lucide-react';
import { generateHomeworkHelp, type GenerateHomeworkHelpOutput } from '@/ai/flows/generate-homework-help';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const formSchema = z.object({
  question: z.string().min(10, {
    message: 'Please enter a question of at least 10 characters.',
  }),
  image: z.any().optional(),
});

export default function HomeworkPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateHomeworkHelpOutput | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: '',
    },
  });

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      let photoDataUri: string | undefined = undefined;
      const imageFile = values.image?.[0];
      
      if (imageFile) {
        photoDataUri = await fileToBase64(imageFile);
      }

      const response = await generateHomeworkHelp({ question: values.question, photoDataUri });
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

              <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Upload an Image (Optional)</FormLabel>
                      <FormControl>
                          <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                  field.onChange(e.target.files);
                                  handleImageChange(e);
                              }}
                          />
                      </FormControl>
                      <FormDescription>
                          You can upload a picture of your homework problem.
                      </FormDescription>
                      <FormMessage />
                  </FormItem>
                  )}
              />

              {imagePreview && (
                  <div className="relative w-48 h-48 border rounded-md">
                      <Image src={imagePreview} alt="Image preview" fill className="object-contain rounded-md" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-7 w-7 rounded-full"
                        onClick={() => {
                          form.setValue('image', null);
                          setImagePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                  </div>
              )}

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
