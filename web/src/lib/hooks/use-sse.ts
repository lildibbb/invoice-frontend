'use client';

import { useEffect, useState, useCallback } from 'react';

interface SseState<T = any> {
  data: T | null;
  status: 'idle' | 'connecting' | 'connected' | 'error' | 'closed';
  error: Error | null;
}

export function useSse<T = any>(url: string | null): SseState<T> & { close: () => void } {
  const [state, setState] = useState<SseState<T>>({
    data: null,
    status: 'idle',
    error: null,
  });

  const [source, setSource] = useState<EventSource | null>(null);

  const close = useCallback(() => {
    source?.close();
    setState((s) => ({ ...s, status: 'closed' }));
  }, [source]);

  useEffect(() => {
    if (!url) return;

    setState({ data: null, status: 'connecting', error: null });
    const es = new EventSource(url, { withCredentials: true });
    setSource(es);

    es.onopen = () => setState((s) => ({ ...s, status: 'connected' }));

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setState({ data: parsed, status: 'connected', error: null });
      } catch {
        setState((s) => ({ ...s, data: event.data as any }));
      }
    };

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) {
        setState((s) => ({ ...s, status: 'closed' }));
      } else {
        setState((s) => ({ ...s, status: 'error', error: new Error('SSE connection failed') }));
      }
    };

    return () => es.close();
  }, [url]);

  return { ...state, close };
}
