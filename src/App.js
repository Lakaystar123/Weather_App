import React, { useState } from "react";
import Weather from "./Weather";
import "./Tailwind.css";

const App = () => {
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Utility: Format UNIX timestamp to human-readable time (HH:MM AM/PM)
  const formatTime = (unixTimestamp, timezoneOffset = 0) => {
    if (!unixTimestamp) return "--:--";
    const date = new Date((unixTimestamp + timezoneOffset) * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Utility: Check if current time is night based on sunrise/sunset and current UTC timestamp + timezone offset
  const isCurrentlyNight = (currentTime, sunrise, sunset, timezoneOffset = 0) => {
    if (!currentTime || !sunrise || !sunset) return false;
    // Adjust times with timezone offset
    const current = currentTime + timezoneOffset;
    return current < sunrise || current > sunset;
  };

  // Utility: Format temperature nicely with unit
  const formatTemperature = (tempCelsius, useFahrenheit = false) => {
    if (tempCelsius == null) return "--°";
    if (useFahrenheit) {
      const f = (tempCelsius * 9) / 5 + 32;
      return `${Math.round(f)}°F`;
    }
    return `${Math.round(tempCelsius)}°C`;
  };

  // Utility: Simple advice based on weather condition
  const getWeatherAdvice = (condition) => {
    const advices = {
      clear: "Enjoy the sunshine!",
      clouds: "Might be a bit gloomy today.",
      rain: "Don't forget your umbrella.",
      drizzle: "Light rain; dress accordingly.",
      thunderstorm: "Stay safe indoors!",
      snow: "Time for snow boots!",
      mist: "Drive carefully in the mist.",
      fog: "Visibility is low, be cautious.",
      haze: "Air quality might be poor.",
    };
    return advices[condition?.toLowerCase()] || "Have a great day!";
  };

  // Toggle dark mode with some extra logic if needed
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Background class logic based on weather and dark mode
  const getBackgroundClass = () => {
    if (!weather)
      return isDarkMode
        ? "bg-gradient-to-b from-gray-900 to-blue-950"
        : "bg-gradient-to-b from-blue-200 to-blue-400";

    const mainWeather = weather.weather[0].main.toLowerCase();
    const currentTime = weather.dt;
    const sunrise = weather.sys?.sunrise;
    const sunset = weather.sys?.sunset;
    const timezoneOffset = weather.timezone || 0;

    const night = isCurrentlyNight(currentTime, sunrise, sunset, timezoneOffset);

    const darkBackgrounds = {
      clear: "bg-gradient-to-b from-gray-900 to-blue-950",
      clouds: "bg-gradient-to-b from-gray-800 to-gray-950",
      rain: "weather-rain bg-gradient-to-b from-gray-700 to-gray-900",
      snow: "weather-snow bg-gradient-to-b from-gray-400 to-gray-600",
      thunderstorm: "bg-gradient-to-b from-gray-900 to-gray-950",
      drizzle: "weather-rain bg-gradient-to-br from-gray-600 to-gray-800",
      mist: "bg-gradient-to-b from-gray-500 to-gray-700",
      fog: "bg-gradient-to-b from-gray-500 to-gray-700",
      haze: "bg-gradient-to-b from-gray-500 to-gray-700",
    };

    const lightBackgrounds = {
      clear: "bg-gradient-to-b from-blue-600 to-blue-800",
      clouds: "bg-gradient-to-b from-gray-300 to-blue-400",
      rain: "weather-rain bg-gradient-to-b from-gray-400 to-gray-600",
      snow: "weather-snow bg-gradient-to-b from-gray-200 to-gray-400",
      thunderstorm: "bg-gradient-to-b from-gray-500 to-gray-700",
      drizzle: "weather-rain bg-gradient-to-br from-gray-400 to-gray-600",
      mist: "bg-gradient-to-b from-gray-300 to-gray-500",
      fog: "bg-gradient-to-b from-gray-300 to-gray-500",
      haze: "bg-gradient-to-b from-gray-300 to-gray-500",
    };

    if (isDarkMode) {
      return night ? darkBackgrounds[mainWeather] || darkBackgrounds.clear : darkBackgrounds[mainWeather] || darkBackgrounds.clear;
    } else {
      return lightBackgrounds[mainWeather] || lightBackgrounds.clear;
    }
  };

  return (
    <div
      className={`${getBackgroundClass()} min-h-screen flex flex-col text-white overflow-hidden transition-all duration-1000 ease-in-out`}
      role="main"
    >
      {/* Top spacer bar with dark mode toggle */}
      <div className="h-12 bg-black/20 flex justify-end items-center px-4">
        <button
          onClick={toggleDarkMode}
          className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-sm transition focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Main content container */}
      <div className="flex-1 flex flex-col w-full max-w-lg mx-auto px-4 pb-6">
        <Weather
          setWeather={setWeather}
          setIsLoading={setIsLoading}
          // Passing utilities down to Weather if needed
          formatTime={formatTime}
          formatTemperature={formatTemperature}
          getWeatherAdvice={getWeatherAdvice}
          isDarkMode={isDarkMode}
        />

        {/* Loading spinner */}
        {isLoading && (
          <div className="flex flex-col items-center mt-6">
            <div
              className="h-8 w-8 rounded-full border-2 border-white/40 border-t-white animate-spin"
              aria-label="Loading weather data"
            ></div>
            <p className="mt-2 text-white/60 text-sm text-center">
              Fetching latest weather data...
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-auto pt-6 text-center">
          <p className="text-white/60 text-xs">
            Built with{" "}
            <span className="text-red-400" aria-hidden="true">
              ❤️
            </span>{" "}
            by{" "}
            <a
              href="https://github.com/Lakaystar123"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 underline decoration-white/40 hover:decoration-white/80 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            >
              Lakaystar
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
