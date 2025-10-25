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
import { Loader2, Shirt, Sparkles, X } from 'lucide-react';
import { getFashionSuggestions, type FashionSuggestionsOutput } from '@/ai/flows/get-fashion-suggestions';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

const formSchema = z.object({
  userPreferences: z.string().min(10, 'Please describe your style preferences.'),
  currentTrends: z.string().optional(),
  image: z.any().optional(),
});

export default function FashionPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FashionSuggestionsOutput | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userPreferences: '',
      currentTrends: '',
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

      const response = await getFashionSuggestions({
        userPreferences: values.userPreferences,
        currentTrends: values.currentTrends,
        photoDataUri,
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

               <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Upload Clothing/Accessory (Optional)</FormLabel>
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
                          Upload a picture of an item you own for matching advice.
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
