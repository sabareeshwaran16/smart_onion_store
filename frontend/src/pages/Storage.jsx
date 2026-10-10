import React, { useCallback, useState } from 'react';
import { Plus, Trash2, Edit2, Package, X } from 'lucide-react';
import { getBatches, createBatch, deleteBatch, updateBatch } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, EmptyState, Badge } from '../components/UI';

function BatchModal({ batch, onClose, onSave }) {
  const isEdit = !!batch?.batch_id;
  const [form, setForm] = useState({
    batch_id: batch?.batch_id || '',
    onion_variety: batch?.onion_variety || '',
    initial_weight: batch?.initial_weight || '',
    storage_start_date: batch?.storage_start_date || new Date().toISOString().split('T')[0],
    expected_retrieval_date: batch?.expected_retrieval_date || '',
    location: batch?.location || '',
    warehouse: batch?.warehouse || '',
    notes: batch?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      if (isEdit) {
        await updateBatch(form.batch_id, form);
      } else {
        await createBatch({ ...form, initial_weight: Number(form.initial_weight) });
      }
      onSave();
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-2xl overflow-hidden text-slate-900">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">{isEdit ? 'Edit Batch' : 'New Storage Batch'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {err && <p className="text-red-700 text-xs bg-red-50 border border-red-200 rounded-md px-3 py-2">{err}</p>}

          {[
            { key: 'batch_id',      label: 'Batch ID',   disabled: isEdit },
            { key: 'onion_variety', label: 'Variety' },
            { key: 'warehouse',     label: 'Warehouse' },
            { key: 'location',      label: 'Location' },
          ].map(({ key, label, disabled }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input
                className="input" required
                disabled={disabled}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}

          <div>
            <label className="label">Initial Weight (kg)</label>
            <input
              type="number" step="0.1" min="1" className="input" required
              value={form.initial_weight}
              onChange={(e) => setForm((f) => ({ ...f, initial_weight: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Storage Start</label>
              <input type="date" className="input text-xs" required
                value={form.storage_start_date}
                onChange={(e) => setForm((f) => ({ ...f, storage_start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Expected Retrieval</label>
              <input type="date" className="input text-xs"
                value={form.expected_retrieval_date}
                onChange={(e) => setForm((f) => ({ ...f, expected_retrieval_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea rows={2} className="input resize-none"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? 'Saving…' : isEdit ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Storage({ onBatchesUpdated }) {
  const [modal, setModal] = useState(null);
  const fetchFn = useCallback(() => getBatches(), []);
  const { data: batches, loading, error, refetch } = useAsync(fetchFn);

  const handleSaved = () => {
    refetch();
    if (onBatchesUpdated) onBatchesUpdated();
  };

  const handleDelete = async (batchId) => {
    if (!confirm(`Delete batch "${batchId}"? This cannot be undone.`)) return;
    try {
      await deleteBatch(batchId);
      refetch();
      if (onBatchesUpdated) onBatchesUpdated();
    } catch (e) {
      alert(e?.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Storage Batches"
        subtitle="Manage onion crop storage batches and locations"
        onRefresh={refetch}
        loading={loading}
      >
        <button onClick={() => setModal('new')} className="btn-primary btn-sm">
          <Plus size={14} />New Batch
        </button>
      </PageHeader>

      {loading && !batches ? <LoadingSpinner text="Loading storage batches..." /> :
       error ? <ErrorMessage message={error} onRetry={refetch} /> :
       !batches?.length ? (
        <EmptyState icon="📦" title="No batches yet" subtitle="Create your first storage batch to start monitoring." />
       ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {batches.map((b) => (
            <div key={b.batch_id} className="card-lg transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                      <Package size={17} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">{b.batch_id}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{b.onion_variety || 'Onion'}</p>
                    </div>
                  </div>
                  <Badge severity={b.is_active ? 'healthy' : 'offline'}>
                    {b.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Initial Weight</span>
                    <span className="font-bold text-slate-900">{b.initial_weight} kg</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Days in Storage</span>
                    <span className="font-bold text-slate-900">{b.storage_days ?? '—'} d</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Warehouse</span>
                    <span className="font-bold text-slate-900">{b.warehouse || '—'}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Days Remaining</span>
                    <span className="font-bold text-slate-900">
                      {b.days_remaining != null ? `${b.days_remaining} d` : '—'}
                    </span>
                  </div>
                </div>

                {b.notes && (
                  <p className="text-[11px] text-slate-600 mt-3 italic bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-normal">
                    {b.notes}
                  </p>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button onClick={() => setModal(b)} className="btn-secondary btn-sm flex-1">
                  <Edit2 size={12} />Edit
                </button>
                <button onClick={() => handleDelete(b.batch_id)} className="btn-danger btn-sm flex-1">
                  <Trash2 size={12} />Delete
                </button>
              </div>
            </div>
          ))}
        </div>
       )}

      {modal && (
        <BatchModal
          batch={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}
