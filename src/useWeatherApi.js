import { useState, useEffect, useCallback } from "react";

const fetchWeatherForecast = (cityName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-62053E17-8980-4D01-B3F1-3D1078E88BA9&locationName=${cityName}`
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );

      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      };
    });
};

// STEP 1：定義 handleClick 方法，並呼叫中央氣象局 API
const fetchCurrentWeather = (locationName) => {
  return fetch(
    `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-62053E17-8980-4D01-B3F1-3D1078E88BA9&locationName=${locationName}`
  )
    .then((response) => response.json())
    .then((data) => {
      console.log("data", data);
      // STEP 1：定義 `locationData` 把回傳的資料中會用到的部分取出來
      const locationData = data.records.location[0];

      // STEP 2：將風速（WDSD）、氣溫（TEMP）和濕度（HUMD）的資料取出
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
            neededElements[item.elementName] = item.elementValue;
          }
          return neededElements;
        },
        {}
      );

      return {
        observationTime: locationData.time.obsTime,
        locationName: locationData.locationName,
        description: "多雲時晴",
        temperature: weatherElements.TEMP,
        windSpeed: weatherElements.WDSD,
        humid: weatherElements.HUMD
      };
    });
};

const useWeatherApi = (currentLocation) => {
  const { cityName, locationName } = currentLocation;

  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true
  });

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName)
      ]);

      setWeatherElement((prevState) => ({
        ...prevState,
        isLoading: true
      }));

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false
      });
    };

    fetchingData();
  }, [locationName, cityName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};

export default useWeatherApi;
