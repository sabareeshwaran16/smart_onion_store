// ─── Sensors ────────────────────────────────────────────────────────────────
export const mockSensors = {
  temperature: 24.5, tempMin: 18.2, tempMax: 31.4, tempAvg: 23.8,
  humidity: 68.2, humMin: 55.0, humMax: 74.6, humAvg: 66.1,
  gasLevel: 320, gasMin: 210, gasMax: 480, gasAvg: 305,
  storageDays: 14, expectedShelfLife: 30, remainingDays: 16,
  healthScore: 82, fanStatus: 'ON', relayStatus: 'AUTO',
  lastUpdated: new Date().toISOString(),
};

// ─── Trends (24h) ────────────────────────────────────────────────────────────
export const mockTrends = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  temperature: +(22 + Math.sin(i / 3) * 3 + Math.random()).toFixed(1),
  humidity: +(65 + Math.cos(i / 4) * 5 + Math.random()).toFixed(1),
  gas: +(300 + Math.sin(i / 2) * 40 + Math.random() * 10).toFixed(0),
  healthScore: +(80 + Math.sin(i / 6) * 5).toFixed(1),
  spoilage: +(10 + i * 0.3 + Math.random()).toFixed(1),
}));

// ─── Weekly Trends ───────────────────────────────────────────────────────────
export const mockWeeklyTrends = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (6 - i));
  return {
    day: d.toLocaleDateString('en', { weekday: 'short' }),
    temperature: +(22 + Math.random() * 6).toFixed(1),
    humidity: +(62 + Math.random() * 12).toFixed(1),
    gas: +(290 + Math.random() * 80).toFixed(0),
    healthScore: +(76 + Math.random() * 18).toFixed(1),
    spoilage: +(8 + Math.random() * 15).toFixed(1),
  };
});

// ─── Predictions ─────────────────────────────────────────────────────────────
export const mockPredictions = {
  shelfLifeRemaining: 18, rottingRisk: 12, sproutingRisk: 28,
  spoilageRisk: 15, confidence: 94, healthPrediction: 'Stable',
  lastPrediction: new Date().toISOString(),
  predictionAccuracy: 91.4,
  errorRange: '±2.3 days',
  explanation: 'Temperature (24.5°C) and humidity (68%) are within optimal range. Gas levels indicate minimal ethylene production. Storage conditions are favorable for extended shelf life.',
  explanationFactors: [
    { factor: 'Temperature', status: 'ok', detail: '24.5°C — within optimal 20–26°C range', impact: 'positive' },
    { factor: 'Humidity', status: 'warning', detail: '68.2% — approaching upper threshold of 70%', impact: 'neutral' },
    { factor: 'Gas Level', status: 'ok', detail: '320 ppm — moderate ethylene, acceptable', impact: 'neutral' },
    { factor: 'Storage Duration', status: 'ok', detail: 'Day 14 — early stage, low cumulative stress', impact: 'positive' },
    { factor: 'Weather Forecast', status: 'warning', detail: 'Outdoor humidity forecast 82% for next 3 days', impact: 'negative' },
  ],
  recommendations: [
    { id: 1, title: 'Maintain Ventilation', priority: 'Medium', reason: 'Ethylene buildup detected at moderate levels.', action: 'Keep fan running for 2 more hours.', improvement: 'Reduces gas by ~15%', icon: 'wind' },
    { id: 2, title: 'Monitor Humidity', priority: 'High', reason: 'Humidity approaching upper threshold of 70%.', action: 'Activate dehumidifier if humidity exceeds 72%.', improvement: 'Extends shelf life by ~3 days', icon: 'droplets' },
    { id: 3, title: 'Inspect Batch', priority: 'Low', reason: 'Day 14 of storage — early sprouting possible.', action: 'Visual inspection recommended within 3 days.', improvement: 'Early detection prevents 5–10% loss', icon: 'search' },
    { id: 4, title: 'Temperature Stable', priority: 'Info', reason: 'Temperature within optimal 20–26°C range.', action: 'No action required.', improvement: 'Maintaining current conditions', icon: 'check' },
  ],
  history: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
    shelfLife: 18 + i, rottingRisk: Math.max(5, 12 - i),
    spoilageRisk: Math.max(8, 15 - i), confidence: 90 + Math.floor(Math.random() * 8),
    weight: +(980 - i * 4.2).toFixed(1),
  })),
  weatherImpact: {
    outdoorHumidity: 82,
    outdoorTemp: 32.4,
    indoorEffect: 'Expected indoor humidity rise of 4–6% over next 48 hours',
    shelfLifeImpact: '-5 days if ventilation not improved',
    recommendation: 'Close warehouse vents between 11 AM – 4 PM to prevent moisture ingress',
  },
};

// ─── Storage Batches ─────────────────────────────────────────────────────────
export const mockBatches = [
  {
    id: 'BATCH-001',
    name: 'Kharif Harvest 2024',
    variety: 'Nasik Red',
    initialWeight: 1000,
    currentWeight: 962,
    storageDate: '2024-11-01',
    retrievalDate: '2025-02-01',
    location: 'Block A, Shelf 2',
    warehouse: 'Main Warehouse',
    notes: 'Premium grade, sorted and dried before storage.',
    status: 'active',
    storageDays: 14,
    expectedDuration: 90,
    storageMethod: 'Ventilated Crates',
    marketPricePerKg: 28,
  },
  {
    id: 'BATCH-002',
    name: 'Rabi Stock 2024',
    variety: 'Bellary Red',
    initialWeight: 750,
    currentWeight: 718,
    storageDate: '2024-10-15',
    retrievalDate: '2025-01-15',
    location: 'Block B, Shelf 1',
    warehouse: 'Cold Storage Unit',
    notes: 'Medium grade, some surface moisture at intake.',
    status: 'active',
    storageDays: 31,
    expectedDuration: 90,
    storageMethod: 'Mesh Bags',
    marketPricePerKg: 24,
  },
  {
    id: 'BATCH-003',
    name: 'Summer Batch 2024',
    variety: 'Pusa Red',
    initialWeight: 500,
    currentWeight: 441,
    storageDate: '2024-09-01',
    retrievalDate: '2024-12-01',
    location: 'Block C, Shelf 3',
    warehouse: 'Main Warehouse',
    notes: 'Older batch, approaching retrieval date.',
    status: 'warning',
    storageDays: 76,
    expectedDuration: 90,
    storageMethod: 'Ventilated Crates',
    marketPricePerKg: 22,
  },
];

// ─── Storage Overview ─────────────────────────────────────────────────────────
export const mockStorageOverview = {
  batchId: 'BATCH-001',
  initialWeight: 1000,
  currentWeight: 962,
  weightLoss: 38,
  weightLossPct: 3.8,
  remainingShelfLife: 18,
  healthScore: 82,
  predictedSafeDays: 22,
  batchAge: 14,
  overallCondition: 'Good',
  weightAtRetrieval: 921,
  totalExpectedLoss: 79,
  weightForecast: Array.from({ length: 91 }, (_, i) => ({
    day: i,
    weight: +(1000 * Math.exp(-0.00045 * i) - i * 0.12).toFixed(1),
    predicted: +(1000 * Math.exp(-0.00048 * i) - i * 0.13).toFixed(1),
  })),
  weightLossFactors: [
    { factor: 'Moisture Evaporation', pct: 45, color: '#2563eb' },
    { factor: 'Temperature Effect', pct: 25, color: '#ea580c' },
    { factor: 'Humidity Effect', pct: 20, color: '#0891b2' },
    { factor: 'Storage Duration', pct: 10, color: '#7c3aed' },
  ],
  shelfLifeZones: { safe: 30, warning: 15, critical: 7 },
};

// ─── Economics ────────────────────────────────────────────────────────────────
export const mockEconomics = {
  batchId: 'BATCH-001',
  initialQty: 1000,
  currentQty: 962,
  estimatedFinalQty: 921,
  marketPricePerKg: 28,
  expectedRevenue: 25788,
  revenueWithoutStorage: 22000,
  revenueLoss: 1372,
  moneySavedBySmart: 3788,
  roi: 17.2,
  profitPct: 14.8,
  costOfStorage: 1200,
  netProfit: 24588,
  priceHistory: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    price: +(22 + Math.sin(i / 5) * 4 + i * 0.2).toFixed(1),
    revenue: +(21000 + i * 180 + Math.random() * 500).toFixed(0),
  })),
};

// ─── Spoilage Causes ─────────────────────────────────────────────────────────
export const mockSpoilageCauses = [
  { cause: 'Temperature Effect', pct: 32, color: '#ea580c', detail: 'Avg temp 24.5°C — moderate stress on cell walls' },
  { cause: 'Humidity Effect', pct: 28, color: '#0891b2', detail: 'Humidity 68% — moisture absorption accelerating' },
  { cause: 'Gas / Ethylene', pct: 18, color: '#7c3aed', detail: '320 ppm — ethylene triggering early ripening' },
  { cause: 'Storage Duration', pct: 14, color: '#16a34a', detail: 'Day 14 — cumulative stress building' },
  { cause: 'Weather Influence', pct: 8, color: '#f59e0b', detail: 'Outdoor humidity 82% — indirect moisture ingress' },
];

// ─── Retrieval Simulation ─────────────────────────────────────────────────────
export const mockRetrievalSim = {
  retrieveAfterDays: 90,
  expectedWeight: 921,
  shelfLifeRemaining: 8,
  rottingRisk: 34,
  sproutingRisk: 52,
  spoilageRisk: 28,
  storageHealth: 61,
  revenueEstimate: 25788,
  confidence: 91,
};

// ─── Alerts ──────────────────────────────────────────────────────────────────
export const mockAlerts = [
  {
    id: 1, type: 'critical', title: 'High Temperature Alert',
    message: 'Temperature exceeded 30°C threshold.',
    problem: 'Temperature at 31.4°C — above safe limit of 28°C',
    reason: 'Afternoon heat buildup with inadequate ventilation',
    impact: 'Shelf life may reduce by 5–7 days if sustained for 24h',
    recommendedAction: 'Activate fan immediately. Open vents between 6–9 AM tomorrow.',
    time: '5 min ago', timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'active', priority: 'Critical',
  },
  {
    id: 2, type: 'warning', title: 'Humidity Warning',
    message: 'Humidity approaching upper threshold (70%).',
    problem: 'Humidity at 68.2% — approaching 70% threshold',
    reason: 'Outdoor humidity 82% causing moisture ingress through vents',
    impact: 'Sprouting risk increases by 12% if humidity exceeds 72%',
    recommendedAction: 'Close vents during peak humidity hours (11 AM – 4 PM).',
    time: '12 min ago', timestamp: new Date(Date.now() - 720000).toISOString(),
    status: 'active', priority: 'High',
  },
  {
    id: 3, type: 'info', title: 'Fan Activated',
    message: 'Fan turned ON automatically due to temperature rise.',
    problem: 'Automatic fan activation triggered',
    reason: 'Temperature crossed 28°C auto-trigger threshold',
    impact: 'Expected temperature reduction of 2–3°C within 30 minutes',
    recommendedAction: 'Monitor temperature. Fan will auto-stop when temp drops below 26°C.',
    time: '18 min ago', timestamp: new Date(Date.now() - 1080000).toISOString(),
    status: 'active', priority: 'Low',
  },
  {
    id: 4, type: 'warning', title: 'Gas Level Elevated',
    message: 'MQ135 reading above 400 ppm.',
    problem: 'Gas level at 420 ppm — above 400 ppm warning threshold',
    reason: 'Ethylene buildup from ripening onions in batch',
    impact: 'Accelerated sprouting if gas exceeds 500 ppm for 48h',
    recommendedAction: 'Increase ventilation. Run fan for 3 hours continuously.',
    time: '1 hr ago', timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'resolved', priority: 'Medium',
  },
  {
    id: 5, type: 'info', title: 'Prediction Updated',
    message: 'AI model generated new shelf life prediction.',
    problem: 'Routine prediction cycle completed',
    reason: 'Scheduled 30-minute prediction interval',
    impact: 'Shelf life revised from 19 to 18 days based on latest sensor data',
    recommendedAction: 'Review updated recommendations in AI Predictions page.',
    time: '2 hr ago', timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'resolved', priority: 'Low',
  },
  {
    id: 6, type: 'critical', title: 'Sensor Disconnect',
    message: 'DHT22 sensor lost connection briefly.',
    problem: 'DHT22 sensor offline for 4 minutes',
    reason: 'Loose wire connection detected on sensor module',
    impact: 'Data gap of 4 minutes — predictions may have slightly lower confidence',
    recommendedAction: 'Check sensor wiring. Reconnect and verify readings.',
    time: '3 hr ago', timestamp: new Date(Date.now() - 10800000).toISOString(),
    status: 'resolved', priority: 'Critical',
  },
];

// ─── Activity ─────────────────────────────────────────────────────────────────
export const mockActivity = [
  { id: 1, event: 'Fan turned ON automatically', time: '10:32 AM', icon: 'fan' },
  { id: 2, event: 'Temperature alert triggered', time: '09:15 AM', icon: 'alert' },
  { id: 3, event: 'Sensor data synced to cloud', time: '08:00 AM', icon: 'sync' },
  { id: 4, event: 'AI prediction model updated', time: '07:45 AM', icon: 'ai' },
  { id: 5, event: 'Humidity threshold adjusted', time: '06:30 AM', icon: 'settings' },
];

// ─── Weather ─────────────────────────────────────────────────────────────────
export const mockWeather = {
  location: 'Coimbatore, IN',
  current: {
    temp: 32.4, feelsLike: 35.1, humidity: 72, pressure: 1008,
    windSpeed: 14, windDir: 'SW', visibility: 8, uvIndex: 7,
    condition: 'Partly Cloudy', icon: '⛅', description: 'Partly cloudy with warm breeze',
    sunrise: '06:12 AM', sunset: '06:38 PM',
  },
  forecast: [
    { day: 'Today', high: 34, low: 24, condition: 'Sunny',         icon: '☀️', rain: 5,  humidity: 72 },
    { day: 'Tue',   high: 32, low: 23, condition: 'Partly Cloudy', icon: '⛅', rain: 15, humidity: 76 },
    { day: 'Wed',   high: 29, low: 22, condition: 'Rainy',         icon: '🌧️', rain: 80, humidity: 88 },
    { day: 'Thu',   high: 27, low: 21, condition: 'Thunderstorm',  icon: '⛈️', rain: 90, humidity: 92 },
    { day: 'Fri',   high: 31, low: 23, condition: 'Cloudy',        icon: '☁️', rain: 20, humidity: 78 },
  ],
  hourly: Array.from({ length: 12 }, (_, i) => ({
    time: `${String(new Date().getHours() + i).padStart(2, '0')}:00`,
    temp: +(30 + Math.sin(i / 3) * 4).toFixed(1),
    humidity: +(70 + Math.cos(i / 2) * 8).toFixed(0),
    rain: +(Math.random() * 30).toFixed(0),
    icon: i % 3 === 0 ? '🌧️' : i % 2 === 0 ? '⛅' : '☀️',
  })),
  storageRecommendation: 'Outdoor humidity is high (72%). Consider reducing ventilation to prevent moisture ingress. Monitor indoor humidity closely.',
  indoorTemp: 24.5,
  outdoorTemp: 32.4,
  storageImpact: {
    humidityRise: '+4–6%',
    shelfLifeImpact: '-5 days',
    riskLevel: 'Medium',
    action: 'Close vents 11 AM – 4 PM',
  },
};

// ─── Device ──────────────────────────────────────────────────────────────────
export const mockDevice = {
  esp32: { status: 'online', ip: '192.168.1.105', firmware: 'v2.1.3', uptime: '3d 14h 22m', mac: 'A4:CF:12:78:3B:01' },
  dht22: { status: 'online', lastRead: new Date().toISOString(), accuracy: '±0.5°C' },
  mq135: { status: 'online', lastRead: new Date().toISOString(), calibrated: true },
  fan:   { status: 'ON', mode: 'auto', lastActivated: new Date(Date.now() - 1800000).toISOString(), runtime: '32 min' },
  wifi:  { status: 'connected', ssid: 'OnionStorage_AP', rssi: -52, quality: 78 },
  relay: { status: 'active', channel: 1, load: 'Fan' },
  lastCommunication: new Date().toISOString(),
  logs: Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    time: new Date(Date.now() - i * 600000).toLocaleTimeString(),
    event: ['Sensor read OK', 'Fan relay toggled', 'Data sent to API', 'Threshold check passed', 'Heartbeat sent'][i % 5],
    level: ['info', 'info', 'success', 'info', 'success'][i % 5],
  })),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const mockAnalytics = {
  stats: {
    avgTemp: 23.8, avgHumidity: 66.1, avgGas: 305, avgShelfLife: 19.2,
    maxTemp: 31.4, minTemp: 18.2, totalAlerts: 24, resolvedAlerts: 18,
    predictionAccuracy: 91.4,
  },
  monthly: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    temperature: +(21 + Math.random() * 8).toFixed(1),
    humidity: +(60 + Math.random() * 15).toFixed(1),
    gas: +(270 + Math.random() * 100).toFixed(0),
    healthScore: +(72 + Math.random() * 22).toFixed(1),
    spoilage: +(8 + Math.random() * 18).toFixed(1),
  })),
};

// ─── History (100 rows) ───────────────────────────────────────────────────────
export const mockHistory = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  date: new Date(Date.now() - i * 3600000 * 3).toISOString(),
  temperature: +(20 + Math.random() * 10).toFixed(1),
  humidity: +(58 + Math.random() * 18).toFixed(1),
  gas: +(260 + Math.random() * 120).toFixed(0),
  storageDays: Math.floor(i / 8) + 1,
  healthScore: +(70 + Math.random() * 25).toFixed(1),
  shelfLife: +(14 + Math.random() * 12).toFixed(0),
  rottingRisk: +(5 + Math.random() * 25).toFixed(1),
  sproutingRisk: +(10 + Math.random() * 30).toFixed(1),
  spoilageRisk: +(6 + Math.random() * 22).toFixed(1),
  fanStatus: Math.random() > 0.45 ? 'ON' : 'OFF',
  alerts: Math.floor(Math.random() * 3),
}));

// ─── Settings ────────────────────────────────────────────────────────────────
export const mockSettings = {
  temperatureMin: 18, temperatureMax: 28,
  humidityMin: 55, humidityMax: 75,
  gasMax: 500, spoilageThreshold: 40,
  predictionInterval: 30,
  weatherLocation: 'Coimbatore,IN',
  weatherApiKey: '',
  fastapiUrl: 'http://localhost:8000',
  notifications: { email: true, sms: false, push: true, alertSound: true },
  theme: 'light', language: 'en',
  user: { name: 'Admin User', email: 'admin@smartonion.io', role: 'Administrator' },
};
