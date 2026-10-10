export function getRiskLevel(value) {
  if (value >= 70) return 'critical';
  if (value >= 40) return 'high';
  if (value >= 20) return 'warning';
  return 'healthy';
}

export function getHealthColor(score) {
  if (score >= 75) return 'text-green-400';
  if (score >= 50) return 'text-yellow-400';
  if (score >= 25) return 'text-orange-400';
  return 'text-red-400';
}

export function getBadgeClass(severity) {
  const map = {
    critical: 'badge-critical',
    high: 'badge-high',
    warning: 'badge-warning',
    info: 'badge-info',
    healthy: 'badge-healthy',
    low: 'badge-healthy',
  };
  return map[severity?.toLowerCase()] || 'badge-info';
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function formatTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatNumber(val, decimals = 1) {
  if (val == null || isNaN(Number(val))) return '—';
  return Number(val).toFixed(decimals);
}

export function getRiskBarColor(value) {
  if (value >= 70) return 'bg-red-500';
  if (value >= 40) return 'bg-orange-500';
  if (value >= 20) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function getWeatherIcon(condition) {
  if (!condition) return '🌤';
  const c = condition.toLowerCase();
  if (c.includes('rain')) return '🌧';
  if (c.includes('storm')) return '⛈';
  if (c.includes('cloud')) return '☁';
  if (c.includes('clear') || c.includes('sun')) return '☀';
  if (c.includes('mist') || c.includes('fog')) return '🌫';
  return '🌤';
}
