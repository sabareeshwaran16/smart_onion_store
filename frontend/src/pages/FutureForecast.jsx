import React, { useCallback, useState, useEffect } from 'react';
import { getBatches, simulateRetrieval } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage, EmptyState, RiskBar, StatCard } from '../components/UI';
import { formatNumber } from '../utils/helpers';

export default function FutureForecast({ selectedBatchId, onBatchChange }) {
  const [selectedBatch, setSelectedBatch] = useState(selectedBatchId || '');
  const [days, setDays] = useState(30);
  const [simData, setSimData] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState('');

  const batchesFn = useCallback(() => getBatches(true), []);
  const { data: batches } = useAsync(batchesFn);

  useEffect(() => {
    if (selectedBatchId) {
      setSelectedBatch(selectedBatchId);
    }
  }, [selectedBatchId]);

  const runSimulation = useCallback(async () => {
    if (!selectedBatch) return;
    setSimLoading(true);
    setSimError('');
    try {
      const res = await simulateRetrieval(selectedBatch, days);
      setSimData(res.data);
    } catch (e) {
      setSimError(e?.response?.data?.detail || 'Simulation query error');
    } finally {
      setSimLoading(false);
    }
  }, [selectedBatch, days]);

  useEffect(() => {
    if (selectedBatch) {
      runSimulation();
    }
  }, [selectedBatch, days, runSimulation]);

  return (
    <div className="space-y-5 text-xs animate-fade-in">
      <PageHeader 
        title="RETRIEVAL FORECAST SIMULATION" 
        subtitle="Simulate Crop Health & Weight Retention at Target Retrieval Date"
      >
        <select
          className="input w-48 text-xs"
          value={selectedBatch}
          onChange={(e) => {
            setSelectedBatch(e.target.value);
            if (onBatchChange) onBatchChange(e.target.value);
          }}
          id="batch-selector"
        >
          <option value="">Select batch…</option>
          {(batches || []).map((b) => (
            <option key={b.batch_id} value={b.batch_id}>{b.batch_id}</option>
          ))}
        </select>
      </PageHeader>

      {!selectedBatch ? (
        <EmptyState icon="📦" title="Select Storage Batch" subtitle="Select an active batch to run retrieval forecasting." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Retrieval Target Slider */}
          <div className="lg:col-span-4 space-y-4">
            <div className="card-lg space-y-4">
              <div className="section-title">FORECAST PARAMETERS</div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="label block">TARGET RETRIEVAL DURATION (DAYS)</label>
                  <div className="flex items-center justify-between text-slate-900 font-bold text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    <span className="text-slate-500 font-medium text-xs">Simulate In:</span>
                    <span className="text-slate-900 font-bold">{days} Days</span>
                  </div>
                  
                  <input
                    type="range"
                    min="5"
                    max="180"
                    step="5"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold uppercase">
                    <span>5d</span>
                    <span>90d</span>
                    <span>180d</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed">
                  Calculates estimated crop weight retention and decay hazards based on storage parameters, historical ambient trends, and cultivar kinetics.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Simulation Results */}
          <div className="lg:col-span-8 space-y-4">
            {simLoading && !simData ? (
              <LoadingSpinner text="Executing retrieval simulation models..." />
            ) : simError ? (
              <ErrorMessage message={simError} onRetry={runSimulation} />
            ) : !simData ? (
              <EmptyState icon="📊" title="Run Forecast" subtitle="Adjust configuration parameters to estimate retrieval status." />
            ) : (
              <div className="space-y-4">
                
                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <StatCard 
                    label="ESTIMATED HEALTH SCORE" 
                    value={formatNumber(simData.health_score, 0)} 
                    unit="%" 
                    status={simData.health_score >= 75 ? 'NORMAL' : 'WARNING'}
                    color={
                      simData.health_score >= 75 ? 'text-emerald-700' :
                      simData.health_score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }
                    target={`Quality: ${simData.expected_quality || 'Good'}`}
                  />
                  <StatCard 
                    label="ESTIMATED CURRENT WEIGHT" 
                    value={formatNumber(simData.estimated_current_weight, 1)} 
                    unit="kg" 
                    status="ESTIMATED"
                    color="text-slate-900"
                  />
                  <StatCard 
                    label="ESTIMATED WEIGHT LOSS" 
                    value={formatNumber(simData.weight_loss_percentage, 2)} 
                    unit="%" 
                    status={simData.weight_loss_percentage > 5 ? 'ELEVATED' : 'NORMAL'}
                    color="text-amber-600"
                    target={`Loss: -${formatNumber(simData.weight_loss, 1)} kg`}
                  />
                </div>

                {/* Risk assessment */}
                <div className="card-lg space-y-3">
                  <div className="section-title">PREDICTED RISKS AT RETRIEVAL ({days} DAYS)</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <RiskBar label="Rot Risk" value={simData.rot_risk} />
                      <RiskBar label="Sprouting Risk" value={simData.sprouting_risk} />
                      <RiskBar label="Spoilage Risk" value={simData.spoilage_risk} />
                    </div>
                    
                    {/* Operational Recommendation */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">STORAGE GUIDELINE</span>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                          "{simData.recommendation}"
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase mt-3 pt-2 border-t border-slate-200 flex justify-between font-semibold">
                        <span>Model Confidence</span>
                        <span className="text-slate-900 font-bold">{simData.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
