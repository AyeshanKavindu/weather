import React, { useState } from "react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null); // Stores One Call API data
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchWeather = async () => {
    if (!city.trim()) return;

    setIsLoading(true);
    setError("");
    setWeather(null);

    const apiKey = import.meta.env.VITE_WEATHER_API_KEY; // Access env var

    try {
      // Step 1: Get city coordinates
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          city
        )}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoRes.json();

      if (!geoData.length) {
        setError("City not found");
        setIsLoading(false);
        return;
      }

      const { lat, lon } = geoData[0];

      // Step 2: Fetch One Call API weather data
      const oneCallRes = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,alerts&units=metric&appid=${apiKey}`
      );
      const weatherData = await oneCallRes.json();

      setWeather(weatherData);
    } catch (err) {
      setError("Failed to fetch weather data");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setWeather(null);
    setCity("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-500 flex items-center justify-center p-6">
      {!weather ? (
        <div className="flex flex-col items-center space-y-6 w-full max-w-md">
          <h1 className="text-5xl font-bold text-white">🌤️ Weather</h1>
          <input
            type="text"
            placeholder="Search city..."
            className="w-full px-6 py-3 rounded-md text-black text-lg focus:outline-none"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
          />
          {error && (
            <p className="text-red-600 font-semibold text-center">{error}</p>
          )}
          {isLoading && <p className="text-white">Loading...</p>}
          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            Get Weather
          </button>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 w-full">
          <header className="flex items-center justify-between p-6 bg-blue-600 text-white rounded-t-2xl">
            <h1 className="text-2xl font-bold">🌤️ Weather</h1>
            <button
              onClick={clearSearch}
              className="bg-blue-200 text-blue-800 px-4 py-2 rounded-md hover:bg-blue-300"
            >
              New Search
            </button>
          </header>

          <main className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
            {/* Current Weather */}
            <section className="md:col-span-2 bg-blue-50 p-4 rounded-lg text-center">
              <h2 className="text-xl font-semibold mb-2">
                {city
                  ? city.charAt(0).toUpperCase() + city.slice(1)
                  : "Unknown Location"}
              </h2>
              <img
                alt={weather?.current?.weather?.[0]?.description || ""}
                src={`https://openweathermap.org/img/wn/${
                  weather?.current?.weather?.[0]?.icon || "01d"
                }@2x.png`}
                className="mx-auto"
              />
              <p className="text-4xl font-bold">
                {Math.round(weather?.current?.temp) ?? "--"}°C
              </p>
              <p className="text-gray-600">
                {weather?.current?.weather?.[0]?.description || ""}
              </p>
            </section>

            {/* Sidebar Details */}
            <aside className="bg-blue-100 p-4 rounded-lg md:col-span-1">
              <h2 className="text-lg font-semibold mb-2">Details</h2>
              <ul className="space-y-1 text-left">
                <li>🌡️ Temp: {Math.round(weather?.current?.temp) ?? "--"}°C</li>
                <li>💧 Humidity: {weather?.current?.humidity ?? "--"}%</li>
                <li>💨 Wind: {Math.round(weather?.current?.wind_speed) ?? "--"} m/s</li>
                <li>
                  🌅 Sunrise:{" "}
                  {weather?.current?.sunrise
                    ? new Date(weather.current.sunrise * 1000).toLocaleTimeString()
                    : "--"}
                </li>
                <li>
                  🌇 Sunset:{" "}
                  {weather?.current?.sunset
                    ? new Date(weather.current.sunset * 1000).toLocaleTimeString()
                    : "--"}
                </li>
              </ul>
            </aside>

            {/* Hourly Forecast */}
            <section className="md:col-span-3 mt-6">
              <h3 className="text-lg font-semibold mb-2">Hourly Forecast</h3>
              <div className="flex gap-4 overflow-x-auto">
                {weather?.hourly?.slice(0, 24).map((hour, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-100 p-4 rounded-lg min-w-[80px] text-center"
                  >
                    <p>
                      {new Date(hour.dt * 1000).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <img
                      alt={hour.weather[0]?.description || ""}
                      src={`https://openweathermap.org/img/wn/${hour.weather[0]?.icon}.png`}
                      className="mx-auto"
                    />
                    <p>{Math.round(hour.temp)}°C</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 7-Day Forecast */}
            <section className="md:col-span-3 mt-6">
              <h3 className="text-lg font-semibold mb-2">7-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                {weather?.daily?.slice(0, 7).map((day, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-100 p-4 rounded-lg text-center"
                  >
                    <p>
                      {new Date(day.dt * 1000).toLocaleDateString(undefined, {
                        weekday: "short",
                      })}
                    </p>
                    <img
                      alt={day.weather[0]?.description || ""}
                      src={`https://openweathermap.org/img/wn/${day.weather[0]?.icon}.png`}
                      className="mx-auto"
                    />
                    <p>{Math.round(day.temp.day)}°C</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      )}
    </div>
  );
}
