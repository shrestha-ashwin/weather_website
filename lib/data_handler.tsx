export async function Data_handler() {
  const response = await fetch(
    `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=27.713,85.345&days=2&aqi=yes&alerts=no`,
  );

  const data = await response.json();

  console.log(data);

  data_processor(data);

  return data;
}

type WeatherApiCondition = {
  text: string;
  icon: string;
  code: number;
};

type WeatherApiAirQuality = {
  "us-epa-index": number;
  "gb-defra-index"?: number;
  co?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  pm2_5?: number;
  pm10?: number;
};

type WeatherApiCurrent = {
  temp_c: number;
  feelslike_c: number;
  condition: WeatherApiCondition;
  humidity: number;
  wind_kph: number;
  uv: number;
  vis_km: number;
  is_day: 0 | 1;
  air_quality?: WeatherApiAirQuality;
};

type WeatherApiAstro = {
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moon_phase: string;
  moon_illumination: number;
  is_moon_up: 0 | 1;
  is_sun_up: 0 | 1;
};

type WeatherApiDaySummary = {
  maxtemp_c: number;
  mintemp_c: number;
  daily_chance_of_rain: number;
  daily_chance_of_snow: number;
  condition: WeatherApiCondition;
  uv: number;
};

type WeatherApiHour = {
  time_epoch: number;
  time: string;
  temp_c: number;
  is_day: 0 | 1;
  condition: WeatherApiCondition;
  chance_of_rain: number;
  will_it_rain: 0 | 1;
  humidity: number;
  wind_kph: number;
  uv: number;
};

type WeatherApiForecastDay = {
  date: string;
  date_epoch: number;
  day: WeatherApiDaySummary;
  astro: WeatherApiAstro;
  hour: WeatherApiHour[];
};

type WeatherApiForecast = {
  forecastday: WeatherApiForecastDay[];
};

export type WeatherApiResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
    localtime_epoch: number;
  };
  current: WeatherApiCurrent;
  forecast: WeatherApiForecast;
};

function data_processor(data: WeatherApiResponse) {
  const { current, forecast, location } = data;

  const {
    temp_c: temp,
    feelslike_c: feels_like,
    condition: { text: condition, icon: icon },
    humidity,
    wind_kph,
    uv,
    vis_km: visibility,
    is_day,
  } = current;

  const currentData = {
    temp: temp,
    feels_like: feels_like,
    condition: condition,
    icon: icon,
    humidity: humidity,
    wind_kph: wind_kph,
    uv: uv,
    visibility: visibility,
    is_day: is_day,
  };

  const {
    name: location_name,
    country,
    tz_id,
    localtime,
    localtime_epoch,
  } = location;

  const locationData = {
    location_name: location_name,
    country: country,
    tz_id: tz_id,
    localtime: localtime,
    localtime_epoch: localtime_epoch,
  };

  const astro_data = forecast["forecastday"][0]["astro"];

  const { is_moon_up, is_sun_up, sunrise, sunset } = astro_data;

  const sunData = {
    is_moon_up: is_moon_up,
    is_sun_up: is_sun_up,
    sunrise: sunrise,
    sunset: sunset,
  };

  const epa_index = current["air_quality"]["us-epa-index"];

  const metrics_data = forecast["forecastday"][0]["day"];
  const { maxtemp_c, mintemp_c, daily_chance_of_rain } = metrics_data;

  const current_epoch_time = localtime_epoch;

  const next7Hours = forecast.forecastday
    .flatMap((day) => day.hour)
    .filter((hour) => hour.time_epoch > current_epoch_time)
    .slice(0, 7);

  console.log(next7Hours);
}
