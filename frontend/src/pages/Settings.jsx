import React, { useCallback, useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { getSettings, updateSettings } from '../api/client';
import { useAsync } from '../hooks/useAsync';
import PageHeader from '../components/PageHeader';
import { LoadingSpinner, ErrorMessage } from '../components/UI';

export default function Settings() {
  const fetchFn = useCallback(() => getSettings(), []);
  const { data, loading, error, refetch } = useAsync(fetchFn);

  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveErr, setSaveErr] = useState('');

  // Initialize form once data arrives
  if (data && !form) setForm({ ...data });

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveErr('');
    try {
      await updateSettings(form);
      setSaved(true);
      refetch();
    } catch (e) {
      setSaveErr(e?.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const FIELD_GROUPS = form ? [
    {
      title: 'Thresholds',
      fields: [
        { key: 'max_temperature',    label: 'Max Temperature (°C)', type: 'number', step: '0.5' },
        { key: 'min_temperature',    label: 'Min Temperature (°C)', type: 'number', step: '0.5' },
        { key: 'max_humidity',       label: 'Max Humidity (%)',     type: 'number', step: '1'   },
        { key: 'min_humidity',       label: 'Min Humidity (%)',     type: 'number', step: '1'   },
        { key: 'max_gas_value',      label: 'Max Gas Value (ppm)',  type: 'number', step: '10'  },
      ],
    },
    {
      title: 'Automation',
      fields: [
        { key: 'fan_auto_control',   label: 'Auto Fan Control',     type: 'boolean' },
        { key: 'alert_email',        label: 'Alert Email',          type: 'text'    },
        { key: 'weather_location',   label: 'Weather Location',     type: 'text',  placeholder: 'Chennai,IN' },
      ],
    },
  ] : [];

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Settings"
        subtitle="System thresholds and telemetry automation configuration"
        onRefresh={refetch}
        loading={loading}
      />

      {loading && !data ? <LoadingSpinner text="Loading settings..." /> :
       error ? <ErrorMessage message={error} onRetry={refetch} /> :
       !form ? <LoadingSpinner text="Initializing..." /> : (
        <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
          {saveErr && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-rose-700 text-xs font-semibold">{saveErr}</div>
          )}
          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-emerald-800 text-xs font-semibold">✓ Settings saved successfully</div>
          )}

          {FIELD_GROUPS.map((group) => (
            <div key={group.title} className="card-lg">
              <div className="section-title"><SettingsIcon size={14} className="text-slate-700" />{group.title}</div>
              <div className="space-y-4">
                {group.fields.map(({ key, label, type, step, placeholder }) => {
                  const val = form[key];
                  if (val === undefined) return null;
                  return (
                    <div key={key}>
                      <label className="label">{label}</label>
                      {type === 'boolean' ? (
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleChange(key, !form[key])}
                            className={`relative w-11 h-6 rounded-full transition-colors border border-slate-300 ${form[key] ? 'bg-slate-900' : 'bg-slate-200'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${form[key] ? 'translate-x-5' : ''}`} />
                          </button>
                          <span className="text-xs text-slate-800 font-semibold">{form[key] ? 'Enabled' : 'Disabled'}</span>
                        </div>
                      ) : (
                        <input
                          type={type}
                          step={step}
                          className="input"
                          value={form[key] || ''}
                          placeholder={placeholder}
                          onChange={(e) => handleChange(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Raw settings fallback */}
          {FIELD_GROUPS.length === 0 && (
            <div className="card-lg">
              <div className="section-title">All System Configuration Parameters</div>
              <div className="space-y-4">
                {Object.entries(form).map(([key, val]) => (
                  typeof val === 'boolean' ? (
                    <div key={key}>
                      <label className="label">{key.replace(/_/g, ' ')}</label>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => handleChange(key, !val)}
                          className={`relative w-11 h-6 rounded-full transition-colors border border-slate-300 ${val ? 'bg-slate-900' : 'bg-slate-200'}`}>
                          <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : ''}`} />
                        </button>
                        <span className="text-xs text-slate-800 font-semibold">{val ? 'On' : 'Off'}</span>
                      </div>
                    </div>
                  ) : (
                    <div key={key}>
                      <label className="label">{key.replace(/_/g, ' ')}</label>
                      <input type={typeof val === 'number' ? 'number' : 'text'} className="input"
                        value={form[key] ?? ''}
                        onChange={(e) => handleChange(key, typeof val === 'number' ? Number(e.target.value) : e.target.value)}
                      />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary btn-lg" id="save-settings-btn">
            <Save size={13} />
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
       )}
    </div>
  );
}
