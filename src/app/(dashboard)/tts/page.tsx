'use client';

import { useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Volume2 } from 'lucide-react';
import { generateSpeechFromText } from '@/ai/flows/generate-speech-from-text';

const formSchema = z.object({
  text: z.string().min(5, 'Please enter at least 5 characters of text.'),
});

export default function TTSPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setAudioSrc(null);
    try {
      const response = await generateSpeechFromText({ text: values.text });
      setAudioSrc(response.media);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'An Error Occurred',
        description: error.message || 'Failed to generate speech.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Text-to-Speech</h1>
        <p className="text-muted-foreground">
          Convert text into high-quality, realistic audio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Enter Your Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text to Convert</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Type or paste your text here..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Volume2 className="mr-2 h-4 w-4" />
                Generate Speech
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {audioSrc && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Playback</CardTitle>
          </CardHeader>
          <CardContent>
            <audio ref={audioRef} controls src={audioSrc} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
