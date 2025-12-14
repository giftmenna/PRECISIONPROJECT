import { Suspense } from 'react';
import { Metadata } from 'next';
import { MessagesSkeleton } from '@/components/skeletons/MessagesSkeleton';
import MessagesContent from './MessagesContent';

export const metadata: Metadata = {
  title: 'Messages | Precision Academic World',
  description: 'Chat with other students and teachers',};

export const dynamic = 'force-dynamic';

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </Suspense>
  );
}
