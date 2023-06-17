var myAPI = "954ef440730995cee08acf8d0fd0e617";
var presentCity = "";
var previousCity = "";

var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusString);
    }
    return response;
}

// This Function displays the current conditions in the targetted city.
var getCurrentConditions = (event) => {

    // search for a city
    let city = $('#lookup-city').val();
    presentCity = $('#lookup-city').val();

    // fetch data from open weather Website
    let weatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    fetch(weatherURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {

        // Save city to local storage
        saveCity(city);
        $('#search-validation-error').text("");

        // This line was used to create icon for the current weather using Open Weather API.
        let presentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
        
        let presentTimeUTC = response.dt;
        let presentTimeZoneOffset = response.timezone;
        let presenttimeZoneOffsetPeriods = presentTimeZoneOffset / 60 / 60;
        let presentMoment = moment.unix(presentTimeUTC).utc().utcOffset(presenttimeZoneOffsetPeriods);
        
        // Render cities list
        renderCities();
        
        // Obtain the five day forecast for the searched city
        getFiveDayForecast(event);
        
        $('#header-text').text(response.name);
                
        let currentWeatherHTML = `
        <h3> ${response.name} ${presentMoment.format("(MM/DD/YY)")}<img src="${presentWeatherIcon}"></h3>
        <ul class="list-unstyled">
        <li>Temperature: ${response.main.temp}&#x2109;</li> 
        <li>Humidity: ${response.main.humidity}%</li>
        <li>Wind Speed: ${response.wind.speed}mph</li>
        </ul>`;
        
        $('#present-weather').html(currentWeatherHTML);
    })
}

var getFiveDayForecast = (event) => {
    let city = $('#lookup-city').val();
    let weatherURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + myAPI;
    
    // This line of codes fetch data from Open Weather API
    fetch(weatherURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {

        let weatherForecastHTML = `
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;

        for (let i = 0; i < response.list.length; i++) {
            let dayRecords = response.list[i];
            let periodClockTimeUTC = dayRecords.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetPeriods = timeZoneOffset / 60 / 60;
            let currentMoment = moment.unix(periodClockTimeUTC).utc().utcOffset(timeZoneOffsetPeriods);
            let iconURL = "https://openweathermap.org/img/w/" + dayRecords.weather[0].icon + ".png";

        if (currentMoment.format("HH:mm:ss") === "11:00:00" || currentMoment.format("HH:mm:ss") === "12:00:00" || currentMoment.format("HH:mm:ss") === "13:00:00") {
                weatherForecastHTML += `
                <div class="weather-card card m-2 p0">
                    <ul class="list-unstyled p-3">
                        <li>${currentMoment.format("MM/DD/YY")}</li>
                        <li class="weather-icon"><img src="${iconURL}"></li>
                        <li>Temp: ${dayRecords.main.temp}&#x2109;</li>
                        <li>Wind Speed: ${dayRecords.wind.speed} mph</li>
                        <li>Humidity: ${dayRecords.main.humidity}%</li>
                    </ul>
                </div>`;
            }
        }

        // This line creates the HTML template
        weatherForecastHTML += `</div>`;

        // Append the five-day weather forecast to the document.
        $('#five-day-forecast').html(weatherForecastHTML);
    })
}

// The function below saves the city to localStorage
var saveCity = (recentCity) => {
    let knownCity = false;

    // These line of codes check if City exists in local storage
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === recentCity) {
            knownCity = true;
            break;
        }
    }

    // The line of codes below save data to the localStorage if the city is new.
    if (knownCity === false) {
        localStorage.setItem('cities' + localStorage.length, recentCity);
    }
}

// Render the list of searched cities
var renderCities = () => {
    $('#search-results').empty();

    // If localStorage is empty
    if (localStorage.length===0){
        if (previousCity){
            $('#lookup-city').attr("value", previousCity);
        } else {
            $('#lookup-city').attr("value", "");
        }
    } else {

        // The line of code create a key for previous city written to localStorage
        let previousCityKey="cities"+(localStorage.length-1);
        previousCity=localStorage.getItem(previousCityKey);

        // The code sets search input to last city searched. If the last city searched is remove, the text box defaults to a placeholder (Enter your city here).
        $('#lookup-city').attr("value", previousCity);

        // The code enables the stored cities to be displayed to the screen.
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityElement;

            // Set to previousCity if presentCity not set
            if (presentCity===""){
                presentCity=previousCity;
            }

            // The code set button class to active for presentCity
            if (city === presentCity) {
                cityElement = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityElement = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            }

            // Displays city to the screen.
            $('#search-results').prepend(cityElement);
        }

        // These lines of codes add a "clear" hyperlink to the screen if cities are displayed on the screen.
        if (localStorage.length>0){
            $('#clear-history').html($('<a id="clear-history" href="#">clear</a>'));
        } else {
            $('#clear-history').html('');
        }
    }
    
}

// The line of codes below create an event listener for the city's search button.
$('#search-button').on("click", (event) => {
event.preventDefault();
presentCity = $('#lookup-city').val();
getCurrentConditions(event);
});

// The code is an event listener for the Old searched cities buttons 
$('#search-results').on("click", (event) => {
    event.preventDefault();
    $('#lookup-city').val(event.target.textContent);
    presentCity=$('#lookup-city').val();
    getCurrentConditions(event);
});

// The line of codes will clear the old searched cities from localStorage event listener
$("#clear-history").on("click", (event) => {
    localStorage.clear();
    renderCities();
});

// Render the searched cities
renderCities();

getCurrentConditions();
