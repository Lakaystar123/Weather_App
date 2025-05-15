import React, { useState, useEffect, useCallback } from "react";

const Weather = ({ setWeather: setAppWeather, setIsLoading }) => {
  const [city, setCity] = useState("Thimphu");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(true); // show search initially
  const [isDarkMode, setIsDarkMode] = useState(true); // default dark mode ON

  const apiKey = process.env.REACT_APP_WEATHER_API_KEY;


  const fetchWeather = useCallback(async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    setIsSearching(true);
    if (setIsLoading) setIsLoading(true);
    setError("");

    try {
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );

      if (!currentResponse.ok) {
        throw new Error(
          currentResponse.status === 404
            ? "City not found. Please check spelling."
            : "Weather service unavailable."
        );
      }

      const currentData = await currentResponse.json();
      setWeather(currentData);
      if (setAppWeather) setAppWeather(currentData);

      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );

      if (!forecastResponse.ok) {
        throw new Error("Unable to fetch forecast data.");
      }

      const forecastData = await forecastResponse.json();
      const dailyForecast = [];
      const seenDays = new Set();

      forecastData.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString();
        if (!seenDays.has(day) && date.getHours() >= 12 && date.getHours() <= 15) {
          seenDays.add(day);
          dailyForecast.push(item);
        }
      });

      setForecast(dailyForecast.slice(0, 5));
      setError("");
      setShowSearch(false);
    } catch (err) {
      setWeather(null);
      setForecast([]);
      if (setAppWeather) setAppWeather(null);
      setError(err.message);
    } finally {
      setIsSearching(false);
      if (setIsLoading) setIsLoading(false);
    }
  }, [city, setAppWeather, setIsLoading]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const getWeatherIcon = (condition, isNight = false) => {
    const iconMap = {
      clear: isNight ? "🌙" : "☀️",
      clouds: isNight ? "☁️" : "⛅",
      rain: "🌧️",
      drizzle: "🌦️",
      thunderstorm: "⛈️",
      snow: "❄️",
      mist: "🌫️",
      fog: "🌫️",
      haze: "🌫️",
    };
    return iconMap[condition?.toLowerCase()] || "🌡️";
  };

  const getDayOfWeek = (timestamp) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(timestamp * 1000).getDay()];
  };

  const getWeatherMessage = (condition) => {
    const messages = {
      clear: "Perfect day for a walk!",
      clouds: "Cloudy skies, keep an eye on it!",
      rain: "Grab an umbrella, it’s rainy!",
      drizzle: "Light showers, bring a raincoat!",
      thunderstorm: "Stay indoors, storms ahead!",
      snow: "Bundle up, it’s snowy!",
      mist: "Misty, drive carefully!",
      fog: "Foggy, take it slow!",
      haze: "Hazy, limit outdoor time!",
    };
    return messages[condition?.toLowerCase()] || "Plan your day!";
  };

  const getCardBackground = (condition) => {
    const backgrounds = {
      clear: "bg-gradient-to-br from-blue-500 to-blue-700",
      clouds: "bg-gradient-to-br from-gray-400 to-gray-600",
      rain: "bg-gradient-to-br from-gray-600 to-gray-800",
      drizzle: "bg-gradient-to-br from-gray-500 to-gray-700",
      thunderstorm: "bg-gradient-to-br from-gray-800 to-gray-900",
      snow: "bg-gradient-to-br from-gray-300 to-gray-500",
      mist: "bg-gradient-to-br from-gray-400 to-gray-600",
      fog: "bg-gradient-to-br from-gray-400 to-gray-600",
      haze: "bg-gradient-to-br from-gray-400 to-gray-600",
    };
    return backgrounds[condition?.toLowerCase()] || "bg-gradient-to-br from-blue-500 to-blue-700";
  };

  return (
    <div
      className={`w-full min-h-screen flex flex-col
        ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      {/* Top controls: Search toggle and Dark mode toggle */}
      <div className="flex justify-between items-center p-4">
        {/* Show Search Toggle Button only when search is hidden */}
        {!showSearch && (
          <button
            onClick={() => setShowSearch(true)}
            className={`p-2 rounded-full
              ${isDarkMode ? "bg-white/20 hover:bg-white/30" : "bg-gray-300 hover:bg-gray-400"} transition`}
            aria-label="Open search"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode((prev) => !prev)}
          className={`px-4 py-2 rounded-full
            ${isDarkMode ? "bg-white/20 hover:bg-white/30 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"} transition`}
          aria-label="Toggle Dark Mode"
          type="button"
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div
          className={`mx-4 my-2 flex items-center gap-2
            ${isDarkMode ? "bg-white/10 text-white" : "bg-gray-200 text-black"}
            rounded-full p-1 backdrop-blur-lg shadow-md border border-white/20`}
        >
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
            placeholder="Search for a city"
            className={`flex-1 bg-transparent placeholder-white/70
              focus:outline-none px-4 py-2 rounded-full text-sm
              ${isDarkMode ? "text-white" : "text-black"}`}
            autoFocus
          />
          <button
            onClick={fetchWeather}
            disabled={isSearching}
            className={`px-4 py-2 rounded-full
              ${isDarkMode ? "bg-white/20 hover:bg-white/30 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"}
              disabled:opacity-50 transition`}
            aria-label="Search weather"
          >
            {isSearching ? (
              <div className="h-5 w-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                className="h-5 w-5 stroke-current"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
          </button>
          <button
            onClick={() => setShowSearch(false)}
            className={`px-3 py-2 rounded-full
              ${isDarkMode ? "bg-white/20 hover:bg-white/30 text-white" : "bg-gray-300 hover:bg-gray-400 text-black"} transition`}
            aria-label="Close search"
          >
            <svg
              className="h-5 w-5 stroke-current"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Live Weather Banner */}
      {weather && (
        <div
          className={`live-banner mx-4 mt-4 rounded-lg p-4 flex items-center justify-between border border-white/10
            ${isDarkMode ? "bg-black/30 backdrop-blur-md" : "bg-white/30 backdrop-blur-md text-black"}`}
        >
          <div>
            <h2 className="text-xl font-semibold">{weather.name}</h2>
            <p className="text-sm opacity-70">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} •{" "}
              {weather.weather[0].description}
            </p>
            <p className="text-lg font-light mt-1">{Math.round(weather.main.temp)}°C</p>
          </div>
          <div className="text-4xl">
            {getWeatherIcon(
              weather.weather[0].main,
              new Date(weather.dt * 1000).getHours() >= 18
            )}
          </div>
        </div>
      )}

      {/* Forecast Display */}
      {forecast.length > 0 && (
        <div className="flex flex-col gap-4 mx-4 my-6">
          {forecast.map((day, index) => (
            <div
              key={index}
              className={`weather-card animate-fade-in rounded-2xl p-4
                ${getCardBackground(day.weather[0].main)} ${isDarkMode ? "text-white" : "text-black"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{index === 0 ? "Today" : getDayOfWeek(day.dt)}</p>
                  <p className="text-sm capitalize opacity-80">{day.weather[0].description}</p>
                  <p className="text-sm opacity-90 mt-1">{getWeatherMessage(day.weather[0].main)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light">{Math.round(day.main.temp)}°C</p>
                  <p className="text-3xl">
                    {getWeatherIcon(day.weather[0].main, new Date(day.dt * 1000).getHours() >= 18)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <p>Feels Like: {Math.round(day.main.feels_like)}°C</p>
                <p>Humidity: {day.main.humidity}%</p>
                <p>Wind: {day.wind.speed} m/s</p>
                <p>Pressure: {day.main.pressure} hPa</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info messages */}
      {!weather && !error && !showSearch && (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className={`${isDarkMode ? "text-white/60" : "text-gray-700"}`}>
            Search for a city to get weather information
          </p>
        </div>
      )}
      {error && !showSearch && (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className={`${isDarkMode ? "text-red-100" : "text-red-700"}`}>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Weather;
