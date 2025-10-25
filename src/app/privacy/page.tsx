import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <div className="flex justify-center mb-8">
        <Link href="/" className="text-2xl font-bold font-headline text-foreground">
          Yo Companion
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose prose-stone dark:prose-invert max-w-none">
          <p>
            Your privacy is important to us. It is Yo Companion's policy to respect your privacy regarding any
            information we may collect from you across our application.
          </p>

          <h2 className="text-xl font-headline mt-6">Information We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by
            fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and
            how it will be used.
          </p>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to provide it,
            will be made clear to you at the point we ask you to provide your personal information. This may include
            your name, email address, and any data you provide to our AI services.
          </p>

          <h2 className="text-xl font-headline mt-6">How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul>
            <li>Provide, operate, and maintain our app</li>
            <li>Improve, personalize, and expand our app</li>
            <li>Understand and analyze how you use our app</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Communicate with you, either directly or through one of our partners</li>
            <li>For compliance purposes, including enforcing our Terms of Service, or other legal rights.</li>
          </ul>

          <h2 className="text-xl font-headline mt-6">Log Files and Storage</h2>
          <p>
            Yo Companion follows a standard procedure of using log files and storing user-generated content.
            The information collected includes authentication details, chat history, and other data you explicitly provide.
            This data is stored securely in Firebase services (Authentication and Firestore) and is used for providing the
            core functionality of the app.
          </p>

          <h2 className="text-xl font-headline mt-6">Security</h2>
          <p>
            The security of your Personal Information is important to us, but remember that no method of transmission
            over the Internet, or method of electronic storage, is 100% secure. While we strive to use commercially
            acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
          </p>

          <h2 className="text-xl font-headline mt-6">Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
    