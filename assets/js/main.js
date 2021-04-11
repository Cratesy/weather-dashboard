// my personal api key
const API_KEY = "c314d1e4aa32644f2a62faecbf154d20";

// getting city data from local storage
const getFromLocalStorage = () => {
  const localStorageData = JSON.parse(localStorage.getItem("cities"));

  if (localStorageData === null) {
    return [];
  } else {
    return localStorageData;
  }
};

// current day data
const transformCurrentDayData = (data, name) => {
  const current = data.current;
  return {
    cityName: name,
    temperature: current.temp,
    humidity: current.humidity,
    windSpeed: current.wind_speed,
    date: moment.unix(current.dt).format("MM/DD/YYYY"),
    iconURL: `http://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`,
    uvi: current.uvi,
  };
};

// 5 day forecast data
const transformForecastData = (data) => {
  return {
    date: moment.unix(data.dt).format("MM/DD/YYYY"),
    iconURL: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    temperature: data.temp.day,
    humidity: data.humidity,
  };
};

// current day card
const renderCurrentDayCard = (data) => {
  $("#current-day").empty();

  const card = `<div class="card my-2">
    <div class="card-body">
      <h2>
        ${data.cityName} (${data.date}) <img src="${data.iconURL}" />
      </h2>
      <div class="py-2">Temperature: ${data.temperature}&deg; C</div>
      <div class="py-2">Humidity: ${data.humidity}%</div>
      <div class="py-2">Wind Speed: ${data.windSpeed} MPH</div>
      <div class="py-2">UV Index: <span class="">${data.uvi}</span></div>
    </div>
  </div>`;

  $("#current-day").append(card);
};

// calling from apis to render card info
const renderAllCards = async (cityName) => {
  const currentDayUrl = `http://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`;

  const currentDayResponse = await fetchData(currentDayUrl);

  const forecastUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${currentDayResponse.coord.lat}&lon=${currentDayResponse.coord.lon}&exclude=minutely,hourly&units=metric&appid=${API_KEY}`;

  const forecastResponse = await fetchData(forecastUrl);

  const cardsData = forecastResponse.daily.map(transformForecastData);

  $("#forecast-cards-container").empty();

  cardsData.slice(1, 6).forEach(renderForecastCard);

  const currentDayData = transformCurrentDayData(
    forecastResponse,
    currentDayResponse.name
  );

  renderCurrentDayCard(currentDayData);
};

// render the 5 day forecast
const renderForecastCard = (data) => {
  const card = `<div class="card mh-100 bg-primary text-light rounded card-block">
    <h5 class="card-title p-1">${data.date}</h5>
    <img src="${data.iconURL}" />
    <h6 class="card-subtitle mb-2 text-light p-md-2">
      Temperature: ${data.temperature}&deg; C
    </h6>
    <h6 class="card-subtitle mb-2 text-light p-md-2">
      Humidity: ${data.humidity}%
    </h6>
  </div>`;

  $("#forecast-cards-container").append(card);
};

// cities list from local
const renderCitiesFromLocalStorage = () => {
  $("#searched-cities").empty();

  const cities = getFromLocalStorage();

  const ul = $("<ul>").addClass("list-group");

  const appendListItemToUl = (city) => {
    const li = $("<li>")
      .addClass("list-group-item")
      .attr("data-city", city)
      .text(city);

    ul.append(li);
  };

  cities.forEach(appendListItemToUl);

  ul.on("click", getDataByCityName);

  $("#searched-cities").append(ul);
};

// function called on load of the document
const onLoad = () => {
  // read from local storage and store data in variable called citiesFromLocalStorage
  // if data is present call renderCities and pass the data from local storage
  // renderCities(citiesFromLocalStorage)
  // get the last city name from citiesFromLocalStorage and store in variable called cityName
  // fetchAllWeatherData(cityName)
};

// function called when the form is submitted
const onSubmit = (event) => {
  event.preventDefault();

  const cityName = $("city-input").val();
  const cities = getFromLocalStorage();

  cities.push(cityName);

  localStorage.setItem("cities", JSON.stringify(cities));

  renderCitiesFromLocalStorage();

  $("#city-input").val("");

  renderAllCards(cityName);
};

// render cities on ready
const onReady = () => {
  renderCitiesFromLocalStorage();
};

$("#search-by-city-form").on("submit", onSubmit);

$(document).ready(onReady);
