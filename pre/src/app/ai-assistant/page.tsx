import { Metadata } from 'next';
import AIAssistant from '@/components/AIAssistant';

export const metadata: Metadata = {
  title: 'AI Assistant | Precision Academic World',
  description: 'Ask anything: math help, how to use the app, account support, and general questions.',
};

export default function AIAssistantPage() {
  return (
    <div className="container mx-auto px-4 py-4 lg:py-8">
      <div className="mb-4 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          AI Assistant
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Get instant help with math, using the app, account support, and more.
        </p>
      </div>
      
      <AIAssistant />
    </div>
  );
} 