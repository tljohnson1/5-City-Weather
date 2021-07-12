// Wait until DOM is ready to register callbacks
$(function() {
   $("#compareBtn").click(compareBtnClick);
   $("#city1").on("input", cityInput);
   $("#city2").on("input", cityInput);
   $("#city3").on("input", cityInput);
   $("#city4").on("input", cityInput);
   $("#city5").on("input", cityInput); 
});

// Called when city input values change
function cityInput(e) {
   // Extract the text from city input that triggered the callback
   const cityId = e.target.id;
   const city = $(`#${cityId}`).val().trim();
   
   // Only show error message if no city 
   if (city.length === 0) {
      showElement("error-value-" + cityId);      
   }
   else {
      hideElement("error-value-" + cityId);
   }
}

// Compare button is clicked
function compareBtnClick() {
   // Get user input
   const city1 = $("#city1").val().trim();
   const city2 = $("#city2").val().trim();
   const city3 = $("#city3").val().trim();
   const city4 = $("#city4").val().trim();
   const city5 = $("#city5").val().trim();

   // Show error messages if city fields left blank
   if (city1.length === 0) {
      showElement("error-value-city1");
   }
   if (city2.length === 0) {
      showElement("error-value-city2");
   }
   if (city3.length === 0) {
      showElement("error-value-city3");
   }
   if (city4.length === 0) {
      showElement("error-value-city4");
   }
   if (city5.length === 0) {
      showElement("error-value-city5");
   }

   // Ensure both city names provided
   if (city1.length > 0 && city2.length > 0 && city4.length > 0 && city5.length > 0 && city3.length > 0) {
      showElement("forecast");
      hideElement("error-loading-city1");
      hideElement("error-loading-city2");
      hideElement("error-loading-city3");
      hideElement("error-loading-city4");
      hideElement("error-loading-city5");

      showElement("loading-city1");
      showText("loading-city1", `Loading ${city1}...`);
      showElement("loading-city2");
      showText("loading-city2", `Loading ${city2}...`);
      showElement("loading-city3");
      showText("loading-city3", `Loading ${city3}...`);
      showElement("loading-city4");
      showText("loading-city4", `Loading ${city4}...`);
      showElement("loading-city5");
      showText("loading-city5", `Loading ${city5}...`);

      hideElement("results-city1");
      hideElement("results-city2");
      hideElement("results-city3");
      hideElement("results-city4");
      hideElement("results-city5");

      // Fetch forecasts
      getWeatherForecast(city1, "city1");
      getWeatherForecast(city2, "city2");
      getWeatherForecast(city3, "city3");
      getWeatherForecast(city4, "city4");
      getWeatherForecast(city5, "city5");   }
}

// Request this city's forecast
function getWeatherForecast(city, cityId) {
   // Web API URL and API key
   const endpoint = "https://api.openweathermap.org/data/2.5/forecast";
   const apiKey = "1307007a7da1aeb5b59930a312a42cd3";

   // Make GET request to API for the given city's forecast   
   $.ajax({
      url: endpoint, 
      method: "GET",
      data: {q: city, units: "imperial", appid : apiKey},
      dataType: "json"      
   })
   .done(function(data) {
         displayForecast(data, cityId, city);
   })
   .fail(function() {
         displayError(cityId, city);
   });
}

// Display forecast received from JSON  
function displayForecast(data, cityId, city) {
   // No longer loading
   hideElement("loading-" + cityId);

   // Display results table
   showElement("results-" + cityId);

   const cityName = data.city.name;
   showText(cityId + "-name", cityName);

   // Get 5 day forecast
   const forecast = getSummaryForecast(data.list);

   // Put forecast into the city's table
   let day = 1;
   for (const date in forecast) {
      // Only process the first 5 days
      if (day <= 5) {
         showText(`${cityId}-day${day}-name`, getDayName(date));
         showText(`${cityId}-day${day}-high`, Math.round(forecast[date].high) + "&deg;");
         showText(`${cityId}-day${day}-low`, Math.round(forecast[date].low) + "&deg;");
         showImage(`${cityId}-day${day}-image`, forecast[date].weather);
      }
      day++;
   }   
}

function displayError(cityId, city) {
   // Display appropriate error message
   hideElement("loading-" + cityId);
   const errorId = "error-loading-" + cityId;
   showElement(errorId);
   showText(errorId, "Unable to load city \"" + city + "\".");
}

// Return a map of objects that contain the high temp, low temp, and weather for the next 5 days
function getSummaryForecast(forecastList) {  
   // Map for storing high, low, weather
   const forecast = [];
   
   // Determine high and low for each day
   forecastList.forEach(function (item) {
      // Extract just the yyyy-mm-dd 
      const date = item.dt_txt.substr(0, 10);
      
      // Extract temperature
      const temp = item.main.temp;

      // Have this date been seen before?
      if (date in forecast) {         
         // Determine if the temperature is a new low or high
         if (temp < forecast[date].low) {
            forecast[date].low = temp;
         }
         if (temp > forecast[date].high) {
            forecast[date].high = temp;
         }
      }
      else {
         // Initialize new forecast
         const temps = {
            high: temp,
            low: temp,
            weather: item.weather[0].main
         }   
         
         // Add entry to map 
         forecast[date] = temps;
      }
   });
   
   return forecast;
}

// Convert date string into Mon, Tue, etc.
function getDayName(dateStr) {
   const date = new Date(dateStr);
   return date.toLocaleDateString("en-US", { weekday: 'short', timeZone: 'UTC' });
}

// Show the element
function showElement(elementId) {
   $(`#${elementId}`).show();
}

// Hide the element
function hideElement(elementId) {
   $(`#${elementId}`).hide();
}

// Display the text in the element
function showText(elementId, text) {
   $(`#${elementId}`).html(text);
}

// Show the weather image that matches the weatherType
function showImage(elementId, weatherType) {   
   // Images for various weather types
   const weatherImages = {
      Clear: "clear.png",
      Clouds: "clouds.png",
      Drizzle: "drizzle.png",
      Mist: "mist.png",
      Rain: "rain.png",
      Snow: "snow.png"
   };

   const imgUrl = "https://s3-us-west-2.amazonaws.com/static-resources.zybooks.com/";
   $(`#${elementId}`).attr({
      src: imgUrl + weatherImages[weatherType],
      alt: weatherType
   });
}
