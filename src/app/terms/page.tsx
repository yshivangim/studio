import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div className="flex justify-center mb-8">
        <Link href="/" className="text-2xl font-bold font-headline text-foreground">
          Yo Companion
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Terms and Conditions</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose prose-stone dark:prose-invert max-w-none">
          <p>
            Welcome to Yo Companion! These terms and conditions outline the rules and regulations for the use of
            our application. By accessing this app we assume you accept these terms and conditions. Do not
            continue to use Yo Companion if you do not agree to take all of the terms and conditions stated on this
            page.
          </p>

          <h2 className="text-xl font-headline mt-6">License</h2>
          <p>
            Unless otherwise stated, Yo Companion and/or its licensors own the intellectual property rights for
            all material on Yo Companion. All intellectual property rights are reserved. You may access this from
            Yo Companion for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul>
            <li>Republish material from Yo Companion</li>
            <li>Sell, rent or sub-license material from Yo Companion</li>
            <li>Reproduce, duplicate or copy material from Yo Companion</li>
            <li>Redistribute content from Yo Companion</li>
          </ul>

          <h2 className="text-xl font-headline mt-6">User Content</h2>
          <p>
            In these terms and conditions, “your user content” means material (including without limitation text,
            images, audio material, video material and audio-visual material) that you submit to this app, for whatever
            purpose. You grant to Yo Companion a worldwide, irrevocable, non-exclusive, royalty-free license to use,
            reproduce, adapt, publish, translate and distribute your user content in any existing or future media.
          </p>
          <p>
            Your user content must be your own and must not be invading any third-party’s rights. Yo Companion reserves
            the right to remove any of your user content from this app at any time without notice.
          </p>

          <h2 className="text-xl font-headline mt-6">Disclaimer</h2>
          <p>
            The services and information on the app are provided free of charge, and you acknowledge that it would be
            unreasonable to hold us liable in respect of this app and the information on this app. Whilst we endeavor to
            ensure that the information on this app is correct, we do not warrant its completeness or accuracy; nor do we
            commit to ensuring that the app remains available or that the material on the app is kept up to date.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
    