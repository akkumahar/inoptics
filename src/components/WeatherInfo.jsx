import React, { useEffect, useState } from 'react';
import Footer from './Footer';
import './WeatherInfo.css';
import Breadcrumbs from './Breadcrumbs';
import weather from "../assets/Weather.png";

const API_KEY = 'd54796fa262538bba493d8f1d47108b2';
const LAT = 28.6139;
const LON = 77.2090;

const WeatherInfo = () => {
  const [forecast, setForecast] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backgroundUrl, setBackgroundUrl] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=metric&appid=${API_KEY}`
        );
        const data = await res.json();

        setForecast(data.list);
        setCurrent(data.list[0]);
        setLoading(false);

        const weatherMain = data.list[0].weather[0].main.toLowerCase();

         } catch (error) {
        console.error('Weather API error:', error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading || !current) return <div className="main-content-wrapper">Loading weather data...</div>;

  return (
    <div
      className="main-content-wrapper"
    >
      <div className="weather-container">
      <Breadcrumbs />
      <div className="weather-combined">
      <img src={weather}  alt="Weather" className="weather-image" />
      <div className="weather-left">
  <div className="date-time-container">
  <p className="day-text">
      {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
    </p>
    <h2 className="month-text">
      {new Date().toLocaleDateString('en-US', { month: 'long' })}
    </h2>
  
    <div className="date-time-details">
      <div className="date-row">
        <span className="label">DATE:</span>
        <span className="value">
          {new Date().toLocaleDateString('en-GB')}
        </span>
      </div>
      <div className="time-row">
        <span className="label">TIME:</span>
        <span className="value">
          {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </span>
      </div>
    </div>
  </div>

  <div className="main-temp">
  <div className="temp-left">
    <h1>{Math.round(current.main.temp)}<sup className="deg">°</sup></h1>
  </div>
  
  <div className="temp-right">
    <h2 className="state">New Delhi</h2>
    <p className="description">{current.weather[0].description}</p>
    <p className="high-low">
      High: {Math.round(current.main.temp_max)}°C | Low: {Math.round(current.main.temp_min)}°C
    </p>
  </div>
</div>

<div className="bottom-section">
  {/* Left column */}
  <div className="weather-details">
    <p className="detail-item">
      <strong>Feels Like:&nbsp;</strong> {Math.round(current.main.feels_like)}°
    </p>
    <p className="detail-item">
      <strong>Visibility:&nbsp;</strong> {current.visibility / 1000} km
    </p>
    <p className="detail-item">
      <strong>Humidity:&nbsp;</strong> {current.main.humidity}%
    </p>
    <p className="detail-item">
    <strong>Wind:&nbsp;&nbsp;</strong>{current.wind.speed} m/s Wind</p>
    </div>

  <div className="info-section">
  <h4 className="uv-header">UV Index</h4>
  <p className="uv-text">Moderate</p>
  <div className="uv-bar">
  <div className="uv-level" style={{ width: '40%' }}></div>
  </div>
</div>
</div>
        </div>

        <div className="weather-right">
  {/* Hourly Forecast */}
  <div className="forecast-box1">
    <h3>Hourly Forecast</h3>
    <div className="forecast-items-grid">
      {forecast.slice(0, 6).map((item, index) => (
        <div key={index} className="forecast-item-hourly">
          <div className="forecast-hour">
            {new Date(item.dt_txt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              hour12: true,
            })}
          </div>
          <img
            src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
            alt={item.weather[0].description}
            width="40"
            height="40"
          />
          <div className="forecast-description">{item.weather[0].main}</div>
          <div className="forecast-temp">
            {Math.round(item.main.temp)}°C
          </div>
        </div>
      ))}
    </div>
  </div>

  {/* 6-Day Forecast */}
  <div className="forecast-box2">
    <h3>6-Day Forecast</h3>
    <div className="forecast-days-grid">
      {[...new Set(forecast.map(item => item.dt_txt.split(' ')[0]))]
        .slice(0, 6)
        .map((day, i) => {
          const dayForecast = forecast.find(item =>
            item.dt_txt.includes(`${day} 12:00:00`)
          );
          return (
            <div key={i} className="forecast-item-daily">
              <div>
                {new Date(day).toLocaleDateString('en-US', {
                  weekday: 'short',
                })}
              </div>
              <div>{Math.round(dayForecast?.main?.temp)}°</div>
              <img
                src={`https://openweathermap.org/img/wn/${dayForecast?.weather[0].icon}.png`}
                alt={dayForecast?.weather[0].description}
                width="30"
              />
            </div>
          );
        })}
    </div>
  </div>
</div>
</div>
      </div>

      <Footer />
    </div>
  );
};

export default WeatherInfo;
