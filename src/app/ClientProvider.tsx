'use client';

import { PropsWithChildren, useEffect, useState } from 'react';

interface ClientProviderProps extends PropsWithChildren {}

export default function ClientProvider({ children }: ClientProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}