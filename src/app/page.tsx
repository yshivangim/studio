import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Music,
  Shirt,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/icons';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <BookOpen className="w-8 h-8 text-primary" />,
    title: 'AI Homework Helper',
    description: 'Get detailed explanations, examples, and solutions for your homework questions.',
    image: PlaceHolderImages.find(img => img.id === 'feature-homework')?.imageUrl,
    imageHint: 'student studying',
  },
  {
    icon: <Shirt className="w-8 h-8 text-primary" />,
    title: 'Fashion & Music Recommender',
    description: 'Discover new styles and tunes tailored to your taste and mood.',
    image: PlaceHolderImages.find(img => img.id === 'feature-recommender')?.imageUrl,
    imageHint: 'fashion music',
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-primary" />,
    title: 'Text-to-Speech',
    description: 'Convert any text into realistic, emotionally-aware speech.',
    image: PlaceHolderImages.find(img => img.id === 'feature-tts')?.imageUrl,
    imageHint: 'sound waves',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold font-headline">Yo Companion</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 md:py-32">
          <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline mb-4 tracking-tighter">
            Meet Your Personal AI Assistant
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
            Yo Companion is here to help you with your homework, style, and more.
            Supercharge your productivity and creativity, all in one place.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup" className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Get Started for Free
            </Link>
          </Button>
        </section>

        <section className="bg-background py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-center mb-12">
              Everything You Need, and More
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                  {feature.image && (
                     <div className="w-full h-48 relative">
                       <Image
                         src={feature.image}
                         alt={feature.title}
                         fill
                         className="object-cover"
                         data-ai-hint={feature.imageHint}
                       />
                     </div>
                  )}
                  <CardHeader className="flex flex-row items-center gap-4">
                    {feature.icon}
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Yo Companion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
