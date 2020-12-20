import React, { useState, useEffect, useMemo } from "react";
import sunriceAndSunsetData from "./sunrise-sunset.json";
import WeatherCard from "./WeatherCard.js";
import useWeatherApi from "./useWeatherApi";
import WeatherSetting from "./weatherSetting.js";

// STEP 1：載入 emotion 的 styled 套件
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";
import { findLocation } from "./utils";

const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282"
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc"
  }
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getMoment = (locationName) => {
  const location = sunriceAndSunsetData.find(
    (data) => data.locationName === locationName
  );

  if (!location) return null;

  const now = new Date();
  const nowDate = Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(now)
    .replace(/\//g, "-");

  const locationDate =
    location.time && location.time.find((time) => time.dataTime === nowDate);

  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`
  ).getTime();

  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`
  ).getTime();

  const nowTimestamp = now.getTime();

  return sunriseTimestamp <= nowTimestamp && nowTimestamp <= sunsetTimestamp
    ? "day"
    : "night";
};

// STEP 3：把上面定義好的 styled-component 當成組件使用
const WeatherApp = () => {
  const storageCity = localStorage.getItem("cityName");

  const [currentCity, setCurrentCity] = useState(storageCity || "臺北市");
  const currentLocation = findLocation(currentCity) || {};

  const [weatherElement, fetchData] = useWeatherApi(currentLocation);
  const [currentTheme, setCurrentTheme] = useState("light");

  const moment = useMemo(() => getMoment(currentLocation.sunriseCityName), [
    currentLocation.sunriseCityName
  ]);
  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
  }, [moment]);

  useEffect(() => {
    localStorage.setItem("cityName", currentCity);
  }, [currentCity]);

  const [currentPage, setCurrentPage] = useState("WeatherCard");

  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {currentPage === "WeatherCard" && (
          <WeatherCard
            cityName={currentLocation.cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "WeatherSetting" && (
          <WeatherSetting
            cityName={currentLocation.cityName}
            setCurrentCity={setCurrentCity}
            setCurrentPage={setCurrentPage}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
