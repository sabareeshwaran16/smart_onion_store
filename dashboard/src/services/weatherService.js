import axios from 'axios';

const BASE = 'https://api.openweathermap.org/data/2.5';

const getKey = () =>
  localStorage.getItem('owm_api_key') ||
  import.meta.env.VITE_OWM_API_KEY ||
  '';

// OWM icon code → emoji
export function owmEmoji(icon = '') {
  const m = {
    '01d':'☀️','01n':'🌙','02d':'⛅','02n':'⛅',
    '03d':'☁️','03n':'☁️','04d':'☁️','04n':'☁️',
    '09d':'🌧️','09n':'🌧️','10d':'🌦️','10n':'🌧️',
    '11d':'⛈️','11n':'⛈️','13d':'❄️','13n':'❄️',
    '50d':'🌫️','50n':'🌫️',
  };
  return m[icon] || '🌡️';
}

function fmtTime(unix, tz = 0) {
  return new Date((unix + tz) * 1000).toLocaleTimeString('en', {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  });
}

function degToCompass(deg) {
  return ['N','NE','E','SE','S','SW','W','NW'][Math.round(deg / 45) % 8];
}

// ── Current weather ──────────────────────────────────────────────────────────
export async function fetchCurrentWeather(city = 'Coimbatore,IN') {
  const key = getKey();
  if (!key) throw new Error('NO_KEY');

  const { data } = await axios.get(`${BASE}/weather`, {
    params: { q: city, appid: key, units: 'metric' },
  });

  return {
    location:    `${data.name}, ${data.sys.country}`,
    temp:        +data.main.temp.toFixed(1),
    feelsLike:   +data.main.feels_like.toFixed(1),
    humidity:    data.main.humidity,
    pressure:    data.main.pressure,
    windSpeed:   +((data.wind.speed * 3.6).toFixed(1)),
    windDir:     degToCompass(data.wind.deg || 0),
    visibility:  +((data.visibility / 1000).toFixed(1)),
    condition:   data.weather[0].main,
    description: data.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()),
    icon:        owmEmoji(data.weather[0].icon),
    iconCode:    data.weather[0].icon,
    iconUrl:     `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    sunrise:     fmtTime(data.sys.sunrise, data.timezone),
    sunset:      fmtTime(data.sys.sunset,  data.timezone),
    clouds:      data.clouds.all,
    lat:         data.coord.lat,
    lon:         data.coord.lon,
    timezone:    data.timezone,
  };
}

// ── 5-day / 3-hour forecast ──────────────────────────────────────────────────
export async function fetchForecast(city = 'Coimbatore,IN') {
  const key = getKey();
  if (!key) throw new Error('NO_KEY');

  const { data } = await axios.get(`${BASE}/forecast`, {
    params: { q: city, appid: key, units: 'metric', cnt: 40 },
  });

  // Group by day → 5-day summary
  const dayMap = {};
  data.list.forEach(item => {
    const day = new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'short' });
    if (!dayMap[day]) dayMap[day] = { temps: [], icons: [], rain: [] };
    dayMap[day].temps.push(item.main.temp);
    dayMap[day].icons.push(item.weather[0].icon);
    dayMap[day].rain.push(item.pop * 100);
  });

  const forecast = Object.entries(dayMap).slice(0, 5).map(([day, v]) => ({
    day,
    high:      +Math.max(...v.temps).toFixed(1),
    low:       +Math.min(...v.temps).toFixed(1),
    condition: data.list.find(i =>
      new Date(i.dt * 1000).toLocaleDateString('en', { weekday: 'short' }) === day
    )?.weather[0].main || '',
    icon:      owmEmoji(v.icons[Math.floor(v.icons.length / 2)]),
    iconUrl:   `https://openweathermap.org/img/wn/${v.icons[Math.floor(v.icons.length / 2)]}@2x.png`,
    rain:      +Math.max(...v.rain).toFixed(0),
  }));

  // Hourly — next 12 slots (3h each)
  const hourly = data.list.slice(0, 12).map(item => ({
    time:     new Date(item.dt * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    temp:     +item.main.temp.toFixed(1),
    humidity: item.main.humidity,
    rain:     +(item.pop * 100).toFixed(0),
    wind:     +((item.wind.speed * 3.6).toFixed(1)),
    icon:     owmEmoji(item.weather[0].icon),
    iconUrl:  `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
  }));

  return { forecast, hourly };
}

// ── Air Quality Index ────────────────────────────────────────────────────────
export async function fetchAirQuality(lat, lon) {
  const key = getKey();
  if (!key || !lat || !lon) return null;

  const { data } = await axios.get(`${BASE}/air_pollution`, {
    params: { lat, lon, appid: key },
  });

  const aqi = data.list[0].main.aqi;
  const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
  const colors = ['', '#16a34a', '#84cc16', '#f59e0b', '#ef4444', '#7c3aed'];

  return {
    aqi,
    label:      labels[aqi] || 'Unknown',
    color:      colors[aqi] || '#9ca3af',
    components: data.list[0].components, // co, no2, o3, pm2_5, pm10 …
  };
}

// ── Storage recommendation based on live weather ─────────────────────────────
export function getStorageRecommendation(weather, indoorTemp = 24.5, indoorHum = 68) {
  if (!weather) return null;
  const tips = [];

  if (weather.humidity > 75)
    tips.push({ level: 'warning', text: 'High outdoor humidity. Reduce ventilation to prevent moisture ingress.' });
  if (weather.humidity < 40)
    tips.push({ level: 'info', text: 'Low outdoor humidity. Ventilation is safe — consider increasing airflow.' });
  if (weather.temp > indoorTemp + 5)
    tips.push({ level: 'warning', text: 'Outdoor temp significantly higher than storage. Avoid opening vents.' });
  if (weather.temp < indoorTemp - 5)
    tips.push({ level: 'info', text: 'Cooler outdoor temp. Natural ventilation may help reduce storage temperature.' });
  if (weather.condition?.toLowerCase().includes('rain'))
    tips.push({ level: 'critical', text: 'Rain detected. Ensure storage is sealed to prevent water ingress.' });
  if (weather.windSpeed > 30)
    tips.push({ level: 'warning', text: 'High wind speed. Check storage seals and ventilation covers.' });
  if (tips.length === 0)
    tips.push({ level: 'success', text: 'Outdoor conditions are favorable. Normal storage operations recommended.' });

  return tips;
}
