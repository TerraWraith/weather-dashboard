# Weather Console

English | [中文](README-cn.md)

A lightweight city weather search page built with plain HTML, CSS, and JavaScript. The project requires no build step or dependency installation, and can be opened directly in a browser.

## Features

- Search real-time weather by city name.
- Display temperature, humidity, wind speed, apparent temperature, and update time.
- Switch page themes and weather icons based on current weather conditions.
- Save recent city searches for quick reuse.
- Responsive layout for desktop and mobile screens.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Open-Meteo Geocoding API
- Open-Meteo Forecast API

## Project Structure

```text
weather-app/
├── index.html      # Page structure
├── style.css       # Styles and responsive layout
├── script.js       # Weather search, rendering, and recent search logic
├── .gitignore      # Git ignore rules
├── README-cn.md    # Chinese project documentation
└── README-en.md    # English project documentation
```

## Local Usage

Option 1: Open the file directly

```text
Double-click index.html
```

Option 2: Use a local static server

```powershell
python -m http.server 5500
```

Then open this URL in your browser:

```text
http://localhost:5500
```

## How To Use

1. Enter a city name in the search box, such as `Beijing`, `Shanghai`, or `Tokyo`.
2. Click the `Search` button.
3. The page displays current weather data and saves the city to recent searches.

## Data Source

This project uses the free Open-Meteo APIs:

- Geocoding API: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast API: `https://api.open-meteo.com/v1/forecast`

Requests are sent directly from the browser, so no backend service or API key is required.

## Notes

- An internet connection is required to query real-time weather.
- City search uses the first matching result returned by the API.
- Recent searches are stored in browser `localStorage` and will be removed when browser data is cleared.
