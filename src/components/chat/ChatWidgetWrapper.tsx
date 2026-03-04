'use client';

import dynamic from 'next/dynamic';

const ChatWidget = dynamic(
  () => import('./ChatWidget').then(mod => ({ default: mod.ChatWidget })),
  {
    ssr: false,
    loading: () => null,
  }
);

export { ChatWidget };
