import { useState, useEffect, useRef } from 'react';

export function useFetch(fetchFn, mockData) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) {
        setData(mockData);
        setError(null); // silently use mock
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: load };
}
