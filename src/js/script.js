const RADAR_API_KEY = "prj_test_pk_be09ea0c78f3858e0fb5a481d10b3818ac15cb18";

document.addEventListener("DOMContentLoaded", () => {
  main();
  updateStarIcon(); 

  const favoriteCities = getFavoriteCities();
  favoriteCities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city.city.toLowerCase().replace(/ /g, "-");
    option.textContent = city.city;
    option.dataset.latitude = city.latitude;
    option.dataset.longitude = city.longitude;
    select.appendChild(option);
  });

  document.querySelectorAll(".dailyCard").forEach((card, index) => {
    card.addEventListener("click", () => {
      console.log(index);
      updateThreeHourRange(index);
    });
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
const weather = document.getElementById("weather")
const weather1 = document.getElementById("weather1")
const weather2 = document.getElementById("weather2")
const weather3 = document.getElementById("weather3")
const weather4 = document.getElementById("weather4")
let isUpdating = false;
let selectedCityValue = "";
let weatherData = {};

// Initialize the object with default values
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

      //Find the city in the object and update the wheater information
      const cityData = {
        city: selectedOption.text,
        latitude: parseFloat(selectedOption.dataset.latitude),
        longitude: parseFloat(selectedOption.dataset.longitude),
      };

      object = cityData; // Update the object with the selected city 
      apiWeatherCall(object);

      updateStarIcon(); // Update icon star 
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

      // Update the object with the selected city and coordinates
      object.city = suggestion.formattedAddress;
      object.latitude = suggestion.latitude;
      object.longitude = suggestion.longitude;

      apiWeatherCall(object);

      updateStarIcon(); // update star icon

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
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,is_day,precipitation,weather_code&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => {
      var result = JSON.parse(result);
      weatherData = result;
      console.log(result);
      console.log(weatherData);

      // Show data
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

      /*if (result.current.is_day === 1) {
        dayOrNight.innerText = "Day Time";
      } else {
        dayOrNight.innerText = "Night Time";
      }*/

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
      /* console.log(result.daily.temperature_2m_max)
       */ let minTemperatureFirstDay = document.getElementById(
          "minTemperatureFirstDay"
        ); /* MIN TEMPERATURE */
      minTemperatureFirstDay.innerHTML =
        result.daily.temperature_2m_min[0] + "°C";
      let imageFirstDay =
        document.getElementById("imageFirstDay"); /* IMAGE CODE HERE */
      imageFirstDay.src = getCodeWeather(result.daily.weather_code[1]);
      let firstDate = document.getElementById("firstDate"); /* DAY CODE */
      firstDate.innerHTML = days[1];

      weather.innerText = weatherInfo(result.daily.weather_code[0]);

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
      weather1.innerText = weatherInfo(result.daily.weather_code[1]);

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
      weather2.innerText = weatherInfo(result.daily.weather_code[2]);

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
      weather3.innerText = weatherInfo(result.daily.weather_code[3]);

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
      console.log(result.daily.weather_code[5]);
      weather4.innerText = weatherInfo(result.daily.weather_code[4]);

      console.log(result.daily.weather_code[5]);

      /* -------------------------- 3 hour range --------------------------------- */

      // Sunrise y Sunset
      const sunriseTime = new Date(result.daily.sunrise[0]);
      const sunsetTime = new Date(result.daily.sunset[0]);

      /* 
      // Horarios de cada 3 horas
      const timeSlots = [0, 3, 6, 9, 12, 15, 18, 21];
      const hourlyTemperatures = result.hourly.temperature_2m;

      // Seleccionamos todos los elementos con la clase 'hour'
      const hourElements = document.getElementsByClassName("hour");

      timeSlots.forEach((start, index) => {
        let tempElement = document.getElementById(
          `hour${start}to${timeSlots[index + 1] || 0}`
        );
        let imgElement = document.getElementById(
          `day${start}to${timeSlots[index + 1] || 0}`
        );

        // Mostrar la temperatura
        tempElement.innerText = `${hourlyTemperatures[start]} °C`;

        // Determinar la hora específica en el rango de 3 horas
        const slotTime = new Date(result.hourly.time[start]);
        const formattedTime = slotTime.toTimeString().split(" ")[0].slice(0, 5); // Formato HH:MM

        // Mostrar la imagen correspondiente según la hora del día
        if (slotTime >= sunriseTime && slotTime < sunsetTime) {
          imgElement.innerHTML = '<img src="img/sun.png" alt="Sun">';
        } else {
          imgElement.innerHTML = '<img src="img/moon.png" alt="Moon">';
        }

        // Mostrar la hora en el elemento correspondiente
        hourElements[index].innerText = formattedTime;
      }); */

      /* -------------------------- 3 hour range --------------------------------- */

      updateThreeHourRange(0);

      // Styles

      let URL = background(result.current.weather_code);
      document.body.style.backgroundImage = `url('${URL}')`;
      const container = document.getElementById("container");
      container.style.backgroundImage = `url('${URL}')`;

      const container2 = document.getElementById("container2");
      const texth1 = document.getElementById('h1');
      const textH1 = document.getElementById('H1');
      const icon = document.getElementById("icon")
      const icon1 = document.getElementById("icon1")
      /* const container2 = document.getElementById("container2");*/
      const cityIn = document.getElementById ('cityInput');
      const sugg = document.getElementById ('suggestions');
      const hr = document.getElementById("hr");
      const text = document.getElementById("text")
      const text1 = document.getElementById("text1")
      const text2 = document.getElementById("text2")
      const text3 = document.getElementById("text3")
      const text4 = document.getElementById("text4")
      switch (result.current.weather_code) {
        case 0:
        container2.style.borderColor = "#b1bbd6";
        texth1.style.background = "-webkit-linear-gradient(#9fb3cb, #a8b3d1)";
        texth1.style.webkitBackgroundClip = "text";
        texth1.style.webkitTextFillColor = "transparent";
        textH1.style.background = "-webkit-radial-gradient(#001861, #1e5fac)";
        textH1.style.webkitBackgroundClip = "text";
        textH1.style.webkitTextFillColor = "transparent";
        city_Name.style.color = "#164a7c";
        currentTime.style.color = "black";
        degreesCelsius.style.color = '#001861';
        weatherDescription.style.color = "#a8b3d1";
        precipitation.style.color = "#b1b5da";
        select.style.color = "#b1b5da";
        select.style.borderColor = "#6f8ebb";
        icon.style.color = "#011337";
        icon1.style.color = "#6f8ebb";
        cityIn.style.color = "#b1b5da";
        cityIn.style.borderColor = "#6f8ebb";
        sugg.style.color = "#011337";
        sugg.style.borderColor = "#6f8ebb";
        hr.style.borderColor = "#b1bbd6";
        text.style.color = "#92a3c7"
        text1.style.color = "#92a3c7"
        text2.style.color = "#92a3c7"
        text3.style.color = "#92a3c7"
        text4.style.color = "#92a3c7"
        var a=document.getElementsByClassName("hour")
          for (var i=0; i<a.length; i++) a[i].style.color="#black";
        break;
        case 1:
        case 2:
        case 3:
        case 45:
        case 48:
          container2.style.borderColor = "#b1bbd6";
          texth1.style.background = "-webkit-linear-gradient(#6f8ebb, #011337)";
          texth1.style.webkitBackgroundClip = "text";
          texth1.style.webkitTextFillColor = "transparent";
          textH1.style.background = "-webkit-linear-gradient(#a8b3d1, #9fb3cb)";
          textH1.style.webkitBackgroundClip = "text";
          textH1.style.webkitTextFillColor = "transparent";
          city_Name.style.color = "#164a7c";
          currentTime.style.color = "#164a7c";
          degreesCelsius.style.color = '#011337';
          weatherDescription.style.color = "#164a7c";
          precipitation.style.color = "#164a7c";
          select.style.color = "#011337";
          select.style.borderColor = "#6f8ebb";
          icon.style.color = "#6f8ebb";
          icon1.style.color = "#6f8ebb";
          cityIn.style.color = "#011337";
          cityIn.style.borderColor = "#6f8ebb";
          sugg.style.color = "#011337";
          sugg.style.borderColor = "#6f8ebb";
          hr.style.borderColor = "#b1bbd6";
          text.style.color = "#011337"
          text1.style.color = "#011337"
          text2.style.color = "#011337"
          text3.style.color = "#011337"
          text4.style.color = "#011337"
          var a=document.getElementsByClassName("hour")
          for (var i=0; i<a.length; i++) a[i].style.color="#black";
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
          container2.style.borderColor = "#5a6465";
          texth1.style.background = "-webkit-linear-gradient(#c2cacc, #687878)";
          texth1.style.webkitBackgroundClip = "text";
          texth1.style.webkitTextFillColor = "transparent";
          textH1.style.background = "-webkit-linear-gradient(#c2cacc, #687878)";
          textH1.style.webkitBackgroundClip = "text";
          textH1.style.webkitTextFillColor = "transparent";
          city_Name.style.color = "#bac4c6";
          currentTime.style.color = "#bac4c6";
          degreesCelsius.style.color = '#bac4c6';
          weatherDescription.style.color = "#bac4c6";
          precipitation.style.color = "#bac4c6";
          select.style.color = "#bac4c6";
          select.style.borderColor = "#bac4c6";
          icon.style.color = "#bac4c6";
          icon1.style.color = "#bac4c6";
          cityIn.style.color = "#bac4c6";
          cityIn.style.borderColor = "#bac4c6";
          sugg.style.color = "#bac4c6";
          sugg.style.borderColor = "#bac4c6";
          hr.style.borderColor = "#5c7170";
          text.style.color = "#bac4c6"
          text1.style.color = "#bac4c6"
          text2.style.color = "#bac4c6"
          text3.style.color = "#bac4c6"
          text4.style.color = "#bac4c6"
          var a=document.getElementsByClassName("hour")
          for (var i=0; i<a.length; i++) a[i].style.color="#bac4c6";

          var b=document.getElementsByTagName("span")
          for (var i=0; i<b.length; i++) b[i].style.color="#bac4c6";
          break;
        case 71:
        case 73:
        case 75:
        case 77:
          container2.style.borderColor = "#b1bbd6";
          texth1.style.background = "-webkit-linear-gradient(#6f8ebb, #011337)";
          texth1.style.webkitBackgroundClip = "text";
          texth1.style.webkitTextFillColor = "transparent";
          textH1.style.background = "-webkit-linear-gradient(#6f8ebb, #011337)";
          textH1.style.webkitBackgroundClip = "text";
          textH1.style.webkitTextFillColor = "transparent";
          city_Name.style.color = "#164a7c";
          currentTime.style.color = "#164a7c";
          degreesCelsius.style.color = '#011337';
          weatherDescription.style.color = "#164a7c";
          precipitation.style.color = "#164a7c";
          select.style.color = "#011337";
          select.style.borderColor = "#6f8ebb";
          icon.style.color = "#6f8ebb";
          icon1.style.color = "#6f8ebb";
          cityIn.style.color = "#011337";
          cityIn.style.borderColor = "#6f8ebb";
          sugg.style.color = "#011337";
          sugg.style.borderColor = "#6f8ebb";
          hr.style.borderColor = "#b1bbd6";
          text.style.color = "#011337"
          text1.style.color = "#011337"
          text2.style.color = "#011337"
          text3.style.color = "#011337"
          text4.style.color = "#011337"
          var a=document.getElementsByClassName("hour")
          for (var i=0; i<a.length; i++) a[i].style.color="#black";
          break;
        case 80:
        case 81:
        case 82:
          container2.style.borderColor = "#5a6465";
          texth1.style.background = "-webkit-linear-gradient(#c2cacc, #687878)";
          texth1.style.webkitBackgroundClip = "text";
          texth1.style.webkitTextFillColor = "transparent";
          textH1.style.background = "-webkit-linear-gradient(#c2cacc, #687878)";
          textH1.style.webkitBackgroundClip = "text";
          textH1.style.webkitTextFillColor = "transparent";
          city_Name.style.color = "#bac4c6";
          currentTime.style.color = "#bac4c6";
          degreesCelsius.style.color = '#bac4c6';
          weatherDescription.style.color = "#bac4c6";
          precipitation.style.color = "#bac4c6";
          select.style.color = "#bac4c6";
          select.style.borderColor = "#bac4c6";
          icon.style.color = "#bac4c6";
          icon1.style.color = "#bac4c6";
          cityIn.style.color = "#bac4c6";
          cityIn.style.borderColor = "#bac4c6";
          sugg.style.color = "#bac4c6";
          sugg.style.borderColor = "#bac4c6";
          hr.style.borderColor = "#5c7170";
          text.style.color = "#bac4c6"
          text1.style.color = "#bac4c6"
          text2.style.color = "#bac4c6"
          text3.style.color = "#bac4c6"
          text4.style.color = "#bac4c6"
          var a=document.getElementsByClassName("hour")
          for (var i=0; i<a.length; i++) a[i].style.color="#bac4c6";

          var b=document.getElementsByTagName("span")
          for (var i=0; i<b.length; i++) b[i].style.color="#bac4c6";
          break;
        case 85:
        case 86:
          container2.style.borderColor = "#b1bbd6";
          texth1.style.background = "-webkit-linear-gradient(#6f8ebb, #011337)";
          texth1.style.webkitBackgroundClip = "text";
          texth1.style.webkitTextFillColor = "transparent";
          textH1.style.background = "-webkit-linear-gradient(#6f8ebb, #011337)";
          textH1.style.webkitBackgroundClip = "text";
          textH1.style.webkitTextFillColor = "transparent";
          city_Name.style.color = "#164a7c";
          currentTime.style.color = "#164a7c";
          degreesCelsius.style.color = '#011337';
          weatherDescription.style.color = "#164a7c";
          precipitation.style.color = "#164a7c";
          select.style.color = "#011337";
          select.style.borderColor = "#6f8ebb";
          icon.style.color = "#6f8ebb";
          icon1.style.color = "#6f8ebb";
          cityIn.style.color = "#011337";
          cityIn.style.borderColor = "#6f8ebb";
          sugg.style.color = "#011337";
          sugg.style.borderColor = "#6f8ebb";
          hr.style.borderColor = "#b1bbd6";
          text.style.color = "#011337"
          text1.style.color = "#011337"
          text2.style.color = "#011337"
          text3.style.color = "#011337"
          text4.style.color = "#011337"
          var a=document.getElementsByClassName("hour")
          for (var i=0; i<a.length; i++) a[i].style.color="black";
          break;
        case 95:
        case 96:
        case 99:
          container2.style.borderColor = "#5a6465";
          texth1.style.background = "-webkit-linear-gradient(#c2cacc, #687878)";
          texth1.style.webkitBackgroundClip = "text";
          texth1.style.webkitTextFillColor = "transparent";
          textH1.style.background = "-webkit-linear-gradient(#c2cacc, #687878)";
          textH1.style.webkitBackgroundClip = "text";
          textH1.style.webkitTextFillColor = "transparent";
          city_Name.style.color = "#bac4c6";
          currentTime.style.color = "#bac4c6";
          degreesCelsius.style.color = '#bac4c6';
          weatherDescription.style.color = "#bac4c6";
          precipitation.style.color = "#bac4c6";
          select.style.color = "#bac4c6";
          select.style.borderColor = "#bac4c6";
          icon.style.color = "#bac4c6";
          icon1.style.color = "#bac4c6";
          cityIn.style.color = "#bac4c6";
          cityIn.style.borderColor = "#bac4c6";
          sugg.style.color = "#bac4c6";
          sugg.style.borderColor = "#bac4c6";
          hr.style.borderColor = "#5c7170";
          text.style.color = "#bac4c6"
          text1.style.color = "#bac4c6"
          text2.style.color = "#bac4c6"
          text3.style.color = "#bac4c6"
          text4.style.color = "#bac4c6"
          var a=document.getElementsByClassName("hour")
          for (var i=0; i<a.length; i++) a[i].style.color="#bac4c6";

          var b=document.getElementsByTagName("span")
          for (var i=0; i<b.length; i++) b[i].style.color="#bac4c6";
          break;
        default:
        container2.style.borderColor = "#b1bbd6";
        texth1.style.background = "-webkit-linear-gradient(#9fb3cb, #a8b3d1)";
        texth1.style.webkitBackgroundClip = "text";
        /* texth1.style.webkitTextFillColor = "transparent"; */
        textH1.style.background = "-webkit-linear-gradient(#9fb3cb, #a8b3d1)";
        textH1.style.webkitBackgroundClip = "text";
        /* textH1.style.webkitTextFillColor = "transparent"; */
        city_Name.style.color = "#164a7c";
        currentTime.style.color = "#164a7c";
        degreesCelsius.style.color = '#2e8ac9';
        weatherDescription.style.color = "#164a7c";
        precipitation.style.color = "#b1b5da";
        select.style.color = "#b1b5da";
        select.style.borderColor = "#6f8ebb";
        icon.style.color = "#011337";
        icon1.style.color = "#6f8ebb";
        cityIn.style.color = "black";
        cityIn.style.borderColor = "#6f8ebb";
        sugg.style.color = "#011337";
        sugg.style.borderColor = "#6f8ebb";
        hr.style.borderColor = "#b1bbd6";
        text.style.color = "#92a3c7"
        text1.style.color = "#92a3c7"
        text2.style.color = "#92a3c7"
        text3.style.color = "#92a3c7"
        text4.style.color = "#92a3c7"
          break;
      }

    })
    .catch((error) => console.error(error));
}


/* -------------------------- 3 hour range --------------------------------- */
function updateThreeHourRange(dayIndex) {
  // Get the data from wheather API
  const hourlyTemperatures = weatherData.hourly.temperature_2m;
  const hourlyTimes = weatherData.hourly.time;


  const timeSlots = [0, 3, 6, 9, 12, 15, 18, 21];
  const startIndex = dayIndex * 8; 

  // Clean up the 3 hour range section
  document.querySelectorAll(".hour-range").forEach((element) => {
    element.innerHTML = ""; 
  });

  timeSlots.forEach((start, index) => {
    let tempElement = document.getElementById(
      `hour${start}to${timeSlots[index + 1] || 0}`
    );
    let imgElement = document.getElementById(
      `day${start}to${timeSlots[index + 1] || 0}`
    );

    // Show the temperature
    tempElement.innerText = `${hourlyTemperatures[startIndex + start]} °C`;

    // Determine the specific hour in the 3 hour range 
    const slotTime = new Date(hourlyTimes[startIndex + start]);
    const formattedTime = slotTime.toTimeString().split(" ")[0].slice(0, 5); //  HH:MM format

    // Show the right images according to the hour 
    const sunriseTime = new Date(weatherData.daily.sunrise[dayIndex]);
    const sunsetTime = new Date(weatherData.daily.sunset[dayIndex]);

    if (slotTime >= sunriseTime && slotTime < sunsetTime) {
      imgElement.innerHTML = '<img src="src/img/sun.png" alt="Sun">';
    } else {
      imgElement.innerHTML = '<img src="src/img/moon.png" alt="Moon">';
    }

    // Show the hour in the right element 
    document.getElementsByClassName("hour")[index].innerText = formattedTime;
  });
}


function getCodeWeather(value) {
  switch (value) {
    case 0:
      var image = "src/img/sun.png";
      break;
    case 1:
    case 2:
    case 3:
      var image = "src/img/mainlyClear.png";
      break;
    case 45:
    case 48:
      var image = "src/img/Fog.png";
      break;
    case 51:
    case 53:
    case 55:
      var image = "src/img/drizzle.png";
      break;
    case 56:
    case 57:
      var image = "src/img/Frezzingdrizzle.png";
      break;
    case 61:
    case 63:
    case 65:
      var image = "src/img/Rain.png";
      break;
    case 66:
    case 67:
      var image = "src/img/rainy-shower.png";
      break;
    case 71:
    case 73:
    case 75:
      var image = "src/img/snowfall.png";
      break;
    case 77:
      var image = "src/img/snowgrain.png";
      break;
    case 80:
    case 81:
    case 82:
      var image = "src/img/rainy-shower.png";
      break;
    case 85:
    case 86:
      var image = "src/img/snowshower.png";
      break;
    case 95:
    case 96:
    case 99:
      var image = "src/img/storm.png";
      break;
    default:
      var image = "src/img/sun.png";
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
      var image = "src/img/sunnyDay.jpg";
      break;
    case 1:
    case 2:
    case 3:
    case 45:
    case 48:
      var image = "src/img/cloudyDay.jpg";
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
      var image = "src/img/rainyDay.jpg";
      break;
    case 71:
    case 73:
    case 75:
    case 77:
      var image = "src/img/snowyDay.jpg";
      break;
    case 80:
    case 81:
    case 82:
      var image = "src/img/rainyDay.jpg";
      break;
    case 85:
    case 86:
      var image = "src/img/snowyDay.jpg";
      break;
    case 95:
    case 96:
    case 99:
      var image = "src/img/rainyDay.jpg";
      break;
    default:
      var image = "src/img/sunnyDay.jpg";
      break;
  }
  let url = {
    image: image,
  };
  return url.image;
}


function weatherInfo (data) {
  switch (data) {
    case 0:
      return "Clear Sky";
      case 1:
      return "Mainly Clear";
    case 2:
      return "Partly Cloudy";
    case 3:
      return "Overcast";
    case 45:
      return "Fog";
    case 48:
      return "Depositing Rime Fog";
    case 51:
      return "Light Drizzle";
    case 53:
      return "Moderate Drizzle";
    case 55:
      return "Heavy Drizzle";
    case 56:
      return "Light Freezing Drizzle";
    case 57:
      return "Heavy Freezing Drizzle";
    case 61:
      return "Slight Rain";
    case 63:
      return "Moderate Rain";
    case 65:
      return "Heavy Rain";
    case 66:
      return "Light Freezing Rain";
    case 67:
      return "Heavy Freezing Rain";
    case 71:
      return "Slight Snow Fall";
    case 73:
      return "Moderate Snow Fall";
    case 75:
      return "Heavy Snow Fall";
    case 77:
      return "Snow Grains";
    case 80:
      return "Slight Rain Showers";
    case 81:
      return "Moderate Rain Showers";
    case 82:
      return "Violent Rain Showers";
    case 85:
      return "Slight Snow Showers";
    case 86:
      return "Heavy Snow Showers";
    case 95:
      return "Slight Thunderstorm";
    case 96:
      return "Moderate Thunderstorm";
    case 99:
      return "Thunderstorm with slight and heavy hail";
    default:
      return "Clear Sky";
  }
}
// Llamar a la API de clima con los valores iniciales del objeto
apiWeatherCall(object);
