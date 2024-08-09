const RADAR_API_KEY = "prj_test_pk_be09ea0c78f3858e0fb5a481d10b3818ac15cb18";

document.addEventListener("DOMContentLoaded", () => {
  main();
  updateStarIcon(); // Asegúrate de que la estrella esté en el estado correcto al cargar

  // Recuperar ciudades favoritas del localStorage y agregar al menú desplegable
  const favoriteCities = getFavoriteCities();
  favoriteCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.city.toLowerCase().replace(/ /g, "-");
    option.textContent = city.city;
    option.dataset.latitude = city.latitude;
    option.dataset.longitude = city.longitude;
    select.appendChild(option);
  });
});

let cityInput = document.getElementById("cityInput");
const select = document.getElementById("favorite-cities");
const starIcon = document.querySelector(".star-icon");
const city_Name = document.getElementById("city_Name");
const weatherDescription = document.getElementById("weatherDescription");
const dayOrNight = document.getElementById("dayOrNight");
const precipitation = document.getElementById("precipitation");
const currentTime = document.getElementById("currentTime");
const currentHour = document.getElementById("currentHour");
const degreesCelsius = document.getElementById("degreesCelsius");
let isUpdating = false;
let selectedCityValue = "";

// Inicializar el objeto con valores predeterminados
let object = {
  city: "Vancouver, BC CAN",
  latitude: 49.319183,
  longitude: -123.13855,
};

async function main() {
  select.addEventListener("change", () => {
    if (isUpdating) return;

    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption.value) {
      isUpdating = true;
      cityInput.value = "";
      selectedCityValue = selectedOption.text;

      // Encontrar la ciudad en el objeto y actualizar la información del clima
      const cityData = {
        city: selectedOption.text,
        latitude: parseFloat(selectedOption.dataset.latitude),
        longitude: parseFloat(selectedOption.dataset.longitude),
      };

      object = cityData; // Actualiza el objeto con la ciudad seleccionada
      apiWeatherCall(object);

      updateStarIcon(); // Actualiza el icono de estrella
      isUpdating = false;
    }
  });

  cityInput.addEventListener("input", () => {
    if (isUpdating) return;

    const inputText = cityInput.value.trim();
    if (inputText) {
      isUpdating = true;
      select.value = "";
      fetchSuggestions(inputText);
      isUpdating = false;
    } else {
      document.getElementById("suggestions").innerHTML = "";
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !cityInput.contains(event.target) &&
      !document.getElementById("suggestions").contains(event.target)
    ) {
      document.getElementById("suggestions").innerHTML = "";
    }
  });
}

starIcon.addEventListener("click", () => {
  starIcon.classList.toggle("selected");
  if (starIcon.classList.contains("selected")) {
    addCityToFavorites(object);
  } else {
    removeCityFromFavorites(object.city);
  }
});

function updateStarIcon() {
  const favoriteCities = getFavoriteCities();
  if (favoriteCities.some((city) => city.city === object.city)) {
    starIcon.classList.add("selected");
  } else {
    starIcon.classList.remove("selected");
  }
}

async function fetchSuggestions(query) {
  const myHeaders = new Headers();
  myHeaders.append("Authorization", RADAR_API_KEY);

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  const response = await fetch(
    `https://api.radar.io/v1/search/autocomplete?query=${query}&limit=7`,
    requestOptions
  );
  const data = await response.json();

  const suggestions = data.addresses.map((address) => ({
    formattedAddress: address.formattedAddress,
    latitude: address.latitude,
    longitude: address.longitude,
  }));
  const suggestionsList = document.getElementById("suggestions");
  suggestionsList.innerHTML = "";

  suggestions.forEach((suggestion) => {
    const li = document.createElement("li");
    li.textContent = suggestion.formattedAddress;
    li.addEventListener("click", () => {
      cityInput.value = suggestion.formattedAddress;
      suggestionsList.innerHTML = "";
      select.value = "";
      selectedCityValue = suggestion.formattedAddress;

      // Actualizar el objeto con la ciudad seleccionada y sus coordenadas
      object.city = suggestion.formattedAddress;
      object.latitude = suggestion.latitude;
      object.longitude = suggestion.longitude;

      apiWeatherCall(object);

      updateStarIcon(); // Actualizar el icono de estrella

      console.log("Ciudad seleccionada de sugerencias:", selectedCityValue);
      console.log("Objeto actualizado:", object);
    });

    suggestionsList.appendChild(li);
  });
}

function addCityToFavorites(cityObject) {
  const favoriteCities = getFavoriteCities();
  if (!favoriteCities.some((city) => city.city === cityObject.city)) {
    favoriteCities.push(cityObject);
    saveFavoriteCities(favoriteCities);

    const option = document.createElement("option");
    option.value = cityObject.city.toLowerCase().replace(/ /g, "-");
    option.textContent = cityObject.city;
    option.dataset.latitude = cityObject.latitude;
    option.dataset.longitude = cityObject.longitude;
    option.selected = true;
    select.appendChild(option);
  }
}

function removeCityFromFavorites(cityName) {
  let favoriteCities = getFavoriteCities();
  favoriteCities = favoriteCities.filter((city) => city.city !== cityName);
  saveFavoriteCities(favoriteCities);

  const options = Array.from(select.options);
  const optionToRemove = options.find(
    (option) => option.textContent === cityName
  );
  if (optionToRemove) {
    select.removeChild(optionToRemove);
  }
}

function saveFavoriteCities(cities) {
  localStorage.setItem("favoriteCities", JSON.stringify(cities));
}

function getFavoriteCities() {
  const cities = localStorage.getItem("favoriteCities");
  return cities ? JSON.parse(cities) : [];
}

async function apiWeatherCall(object) {
  let latitude = object.latitude;
  let longitude = object.longitude;
  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}1&current=temperature_2m,is_day,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      var result = JSON.parse(result);
      console.log(result);

      // Mostrar datos
      city_Name.innerText = object.city;
      degreesCelsius.innerText = result.current.temperature_2m + " °C";
      precipitation.innerText =
        "Precipitation: " + result.current.precipitation + " mm";

      currentTime.innerText = new Date(result.current.time).toLocaleDateString(
        "en-us",
        { year: "numeric", month: "long", day: "numeric" }
      );

      //   currentHour.innerText = new Date(result.current.time).toLocaleTimeString();

      switch (result.current.weather_code) {
        case 0:
          weatherDescription.innerText = "Clear Sky";
          break;
        case 1:
          weatherDescription.innerText = "Mainly Clear";
          break;
        case 2:
          weatherDescription.innerText = "Partly Cloudy";
          break;
        case 3:
          weatherDescription.innerText = "Overcast";
          break;
        case 45:
          weatherDescription.innerText = "Fog";
          break;
        case 48:
          weatherDescription.innerText = "Depositing Rime Fog";
          break;
        case 51:
          weatherDescription.innerText = "Light Drizzle";
          break;
        case 53:
          weatherDescription.innerText = "Moderate Drizzle";
          break;
        case 55:
          weatherDescription.innerText = "Heavy Drizzle";
          break;
        case 56:
          weatherDescription.innerText = "Light Freezing Drizzle";
          break;
        case 57:
          weatherDescription.innerText = "Heavy Freezing Drizzle";
          break;
        case 61:
          weatherDescription.innerText = "Slight Rain";
          break;
        case 63:
          weatherDescription.innerText = "Moderate Rain";
          break;
        case 65:
          weatherDescription.innerText = "Heavy Rain";
          break;
        case 66:
          weatherDescription.innerText = "Light Freezing Rain";
          break;
        case 67:
          weatherDescription.innerText = "Heavy Freezing Rain";
          break;
        case 71:
          weatherDescription.innerText = "Slight Snow Fall";
          break;
        case 73:
          weatherDescription.innerText = "Moderate Snow Fall";
          break;
        case 75:
          weatherDescription.innerText = "Heavy Snow Fall";
          break;
        case 77:
          weatherDescription.innerText = "Snow Grains";
          break;
        case 80:
          weatherDescription.innerText = "Slight Rain Showers";
          break;
        case 81:
          weatherDescription.innerText = "Moderate Rain Showers";
          break;
        case 82:
          weatherDescription.innerText = "Violent Rain Showers";
          break;
        case 85:
          weatherDescription.innerText = "Slight Snow Showers";
          break;
        case 86:
          weatherDescription.innerText = "Heavy Snow Showers";
          break;
        case 95:
          weatherDescription.innerText = "Slight Thunderstorm";
          break;
        case 96:
          weatherDescription.innerText = "Moderate Thunderstorm";
          break;
        case 99:
          weatherDescription.innerText =
            "Thunderstorm with slight and heavy hail";
          break;
        default:
          weatherDescription.innerText = "Clear Sky";
          break;
      }

      if (result.current.is_day === 1) {
        dayOrNight.innerText = "Day Time";
      } else {
        dayOrNight.innerText = "Night Time";
      }

      const dates = result.daily.time;
      const days = dates.map((date) => {
        const day = new Date(date).toLocaleDateString("en-US", {
          weekday: "long",
        });
        console.log(dates);
        return day;
      });

      /* FIRST DAY */
      let maxTemperatureFirstDay = document.getElementById(
        "maxTemperatureFirstDay"
      ); /* MAX TEMPERATURE */
      maxTemperatureFirstDay.innerHTML =
        result.daily.temperature_2m_max[0] + "°C";
     let minTemperatureFirstDay = document.getElementById(
        "minTemperatureFirstDay"
      ); /* MIN TEMPERATURE */
      minTemperatureFirstDay.innerHTML =
        result.daily.temperature_2m_min[0] + "°C";
      let imageFirstDay =
        document.getElementById("imageFirstDay"); /* IMAGE CODE HERE */
      imageFirstDay.src = getCodeWeather(result.daily.weather_code[1]);
      let firstDate = document.getElementById("firstDate"); /* DAY CODE */
      firstDate.innerHTML = days[1];

      /* SECOUND DAY */
      let maxTemperatureSecoundDay = document.getElementById(
        "maxTemperatureSecoundDay"
      ); /* MAX TEMPERATURE */
      maxTemperatureSecoundDay.innerHTML =
        result.daily.temperature_2m_max[2] + "°C";
      let minTemperatureSecoundDay = document.getElementById(
        "minTemperatureSecoundDay"
      ); /* MIN TEMPERATURE */
      minTemperatureSecoundDay.innerHTML =
        result.daily.temperature_2m_min[2] + "°C";
      let imageSecoundDay =
        document.getElementById("imageSecoundDay"); /* IMAGE CODE HERE */
      imageSecoundDay.src = getCodeWeather(result.daily.weather_code[2]);
      let secoundtDate = document.getElementById("secoundtDate"); /* DAY CODE */
      secoundtDate.innerHTML = days[2];

      /* THIRD DAY */
      let maxTemperatureThirdDay = document.getElementById(
        "maxTemperatureThirdDay"
      ); /* MAX TEMPERATURE */
      maxTemperatureThirdDay.innerHTML =
        result.daily.temperature_2m_max[3] + "°C";
      let minTemperatureThirdDay = document.getElementById(
        "minTemperatureThirdDay"
      ); /* MIN TEMPERATURE */
      minTemperatureThirdDay.innerHTML =
        result.daily.temperature_2m_min[3] + "°C";
      let thirdDayImage =
        document.getElementById("thirdDayImage"); /* IMAGE CODE HERE */
      thirdDayImage.src = getCodeWeather(result.daily.weather_code[3]);
      let thirdDate = document.getElementById("thirdDate"); /* DAY CODE */
      thirdDate.innerHTML = days[3];

      /* FOURTH DAY */
      let maxTemperatureFourDay = document.getElementById(
        "maxTemperatureFourDay"
      ); /* MAX TEMPERATURE */
      maxTemperatureFourDay.innerHTML =
        result.daily.temperature_2m_max[4] + "°C";
      let minTemperatureFourDay = document.getElementById(
        "minTemperatureFourDay"
      ); /* MIN TEMPERATURE */
      minTemperatureFourDay.innerHTML =
        result.daily.temperature_2m_min[4] + "°C";
      let fourDayImage =
        document.getElementById("fourDayImage"); /* IMAGE CODE HERE */
      fourDayImage.src = getCodeWeather(result.daily.weather_code[4]);
      let fourthDate = document.getElementById("fourthDate"); /* DAY CODE */
      fourthDate.innerHTML = days[4];

      /* FIFTH  DAY  */
      let maxTemperatureFiveDay = document.getElementById(
        "maxTemperatureFiveDay"
      ); /* MAX TEMPERATURE */
      maxTemperatureFiveDay.innerHTML =
        result.daily.temperature_2m_max[5] + "°C";
      let minTemperatureFiveDay = document.getElementById(
        "minTemperatureFiveDay"
      ); /* MIN TEMPERATURE */
      minTemperatureFiveDay.innerHTML =
        result.daily.temperature_2m_min[5] + "°C";
      let fifthDate = document.getElementById("fifthDate"); /* DAY CODE */
      fifthDate.innerHTML = days[5];
      let fiveDayImage = document.getElementById("fiveDayImage");
      fiveDayImage.src = getCodeWeather(result.daily.weather_code[5]);

      // Styles

      let URL = background(result.current.weather_code);
      document.body.style.backgroundImage = `url('${URL}')`;
      const container = document.getElementById("container");
      container.style.backgroundImage = `url('${URL}')`;
      const icon = document.getElementById("icon")
      const icon1 = document.getElementById("icon1")
      const container2 = document.getElementById("container2");
      const textH1 = document.getElementById('h1');
      const cityIn = document.getElementById ('cityInput');
      const sugg = document.getElementById ('suggestions');
      switch (result.current.weather_code) {
        case 0:
        container2.style.borderColor = "#b1bbd6";
        textH1.style.background = "-webkit-linear-gradient(#6f8ebb, #011337)";
        textH1.style.webkitBackgroundClip = "text";
        textH1.style.webkitTextFillColor = "transparent";
        city_Name.style.color = "#011337";
        currentTime.style.color = "#164a7c";
        currentHour.style.color = "#164a7c";
        degreesCelsius.style.color = "#164a7c";
        weatherDescription.style.color = "#164a7c";
        dayOrNight.style.color = "#164a7c";
        precipitation.style.color = "#164a7c";
        select.style.color = "#011337";
        select.style.borderColor = "#6f8ebb";
        icon.style.color = "#6f8ebb";
        icon1.style.color = "#6f8ebb";
        cityIn.style.color = "#011337";
        cityIn.style.borderColor = "#6f8ebb";
        sugg.style.color = "#011337";
        sugg.style.borderColor = "#6f8ebb";
        break;
        case 1:
        case 2:
        case 3:
        case 45:
        case 48:
          var image = "img/cloudyDay.jpg";
          break;
        case 51:
        case 53:
        case 55:
        case 56:
        case 57:
        case 61:
        case 63:
        case 65:
        case 66:
        case 67:
          var image = "img/rainyDay.jpg";
          break;
        case 71:
        case 73:
        case 75:
        case 77:
          var image = "img/snowyDay.jpg";
          break;
        case 80:
        case 81:
        case 82:
          var image = "img/rainyDay.jpg";
          break;
        case 85:
        case 86:
          var image = "img/snowyDay.jpg";
          break;
        case 95:
        case 96:
        case 99:
          var image = "img/rainyDay.jpg";
          break;
        default:
          var image = "img/sunnyDay.jpg";
          break;
      }

    })
    .catch((error) => console.error(error));
}

function getCodeWeather(value) {
  switch (value) {
    case 0:
      var image = "img/sun.png";
      break;
    case 1:
    case 2:
    case 3:
      var image = "img/mainlyClear.png";
      break;
    case 45:
    case 48:
      var image = "img/Fog.png";
      break;
    case 51:
    case 53:
    case 55:
      var image = "img/drizzle.png";
      break;
    case 56:
    case 57:
      var image = "img/Frezzingdrizzle.png";
      break;
    case 61:
    case 63:
    case 65:
      var image = "img/Rain.png";
      break;
    case 66:
    case 67:
      var image = "img/rainy-shower.png";
      break;
    case 71:
    case 73:
    case 75:
      var image = "img/snowfall.png";
      break;
    case 77:
      var image = "img/snowgrain.png";
      break;
    case 80:
    case 81:
    case 82:
      var image = "img/rainy-shower.png";
      break;
    case 85:
    case 86:
      var image = "img/snowshower.png";
      break;
    case 95:
    case 96:
    case 99:
      var image = "img/storm.png";
      break;
    default:
      var image = "img/sun.png";
      break;
  }
  let finalObject = {
    image: image,
  };
  return finalObject.image;
}

function background(value) {
  switch (value) {
    case 0:
      var image = "img/sunnyDay.jpg";
      break;
    case 1:
    case 2:
    case 3:
    case 45:
    case 48:
      var image = "img/cloudyDay.jpg";
      break;
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      var image = "img/rainyDay.jpg";
      break;
    case 71:
    case 73:
    case 75:
    case 77:
      var image = "img/snowyDay.jpg";
      break;
    case 80:
    case 81:
    case 82:
      var image = "img/rainyDay.jpg";
      break;
    case 85:
    case 86:
      var image = "img/snowyDay.jpg";
      break;
    case 95:
    case 96:
    case 99:
      var image = "img/rainyDay.jpg";
      break;
    default:
      var image = "img/sunnyDay.jpg";
      break;
  }
  let url = {
    image: image,
  };
  return url.image;
}

// Llamar a la API de clima con los valores iniciales del objeto
apiWeatherCall(object);
