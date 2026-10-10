import { createContext, useContext, useState, useEffect } from 'react';
import { mockBatches } from '../utils/mockData';

const BatchContext = createContext(null);

export function BatchProvider({ children }) {
  const [batches, setBatches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('onion_batches')) || mockBatches; }
    catch { return mockBatches; }
  });
  const [activeBatchId, setActiveBatchId] = useState(() =>
    localStorage.getItem('active_batch_id') || mockBatches[0].id
  );

  const activeBatch = batches.find(b => b.id === activeBatchId) || batches[0];

  useEffect(() => {
    localStorage.setItem('onion_batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem('active_batch_id', activeBatchId);
  }, [activeBatchId]);

  const addBatch = (batch) => {
    const newBatch = { ...batch, id: `BATCH-${String(batches.length + 1).padStart(3, '0')}`, status: 'active' };
    setBatches(prev => [newBatch, ...prev]);
    setActiveBatchId(newBatch.id);
    return newBatch;
  };

  const updateBatch = (id, updates) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBatch = (id) => {
    setBatches(prev => {
      const next = prev.filter(b => b.id !== id);
      if (activeBatchId === id && next.length > 0) setActiveBatchId(next[0].id);
      return next;
    });
  };

  return (
    <BatchContext.Provider value={{ batches, activeBatch, activeBatchId, setActiveBatchId, addBatch, updateBatch, deleteBatch }}>
      {children}
    </BatchContext.Provider>
  );
}

export const useBatch = () => useContext(BatchContext);
