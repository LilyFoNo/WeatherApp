[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/OWA08RZI)
# WAD202 - Mid Term - Weather App

**Welcome!**
This challenge will help you improve your coding skills by building realistic projects.

## The Challenge

Your challenge is to integrate with the Radar - [AutoComplete API](https://radar.com/documentation/api#autocomplete) AND Open-Mateo  [WeatherAPI](https://open-meteo.com/en/docs) to pull specific city information and it's weather data. Your users should be able to:

- <strong>Search for a city using an input field.</strong>
- <strong>Save favorite cities by clicking on a star icon.</strong>
- <strong>See the current weather info based on the selected city.</strong>
- <strong>See forecast for the next 5 days.</strong>
- <strong>See weather info for every 3 hours of each day.</strong>
- <strong>Have a good experience using desktop or mobile screen sizes.</strong>


**Wireframe**
The wireframe can be accessed with this [link](https://whimsical.com/5KrvqouiFGBcgW7RtQQMLV). You will need to use your best judgment for styles such as font size, font family, padding, margin, color pattern, etc. and decide how you want to display the information on the screen.

## Requirements

These are the requirements that are mandatory for this project:

- You may use the [wireframe](https://whimsical.com/5KrvqouiFGBcgW7RtQQMLV) as a guide to create the structure of your page for desktop and mobile. It is up to you how to design, include images and icons in the project.
- For Search input you may use [Radar.com](https://radar.com/documentation/api#autocomplete) OR [Google Places Autocomplete](https://developers.google.com/maps/documentation/places/web-service/autocomplete) for getting list of city suggestions.
- The default city should be based on users’ location. In case the user blocks the location info, Vancouver should be the default.
- When the user clicks on the star icon, the city should be included on the dropdown for “Favorite cities”.
- Favorite cities should be stored in localStorage. After the page loads, check if there is something saved there. If yes, append city options in the dropdown.
- When the user clicks on one of the options for dropdown, the weather info for the selected city should be loaded on the page.
- Create Fetch API calls to get the current weather and forecast for the next 5 days.
- When the user clicks on one of the cards in the “Daily forecast” section, the “3 hour range” section should change the data based on the day clicked.
- SCSS files should be used for styling files.
- Media queries should be used for responsive behaviors in the page.
  - Desktop size: 1440px
  - Mobile: 375px
- Slides for your presentation are required.

## Workflow

The captain should create the repository and commit the base files for the project (HTML, SCSS, and JS files). At this time, font family, color pattern, and relative unit should be set and included in the SCSS file. After that, the team should clone the captain’s repository and split the tasks for each team member. It is recommended to follow the division below:

- If 3 members:
  - Member 1: Search input + Favorite cities dropdown + Current weather (most confident with JS)
  - Member 2: Forecast 5 days
  - Member 3: 3 hour range
- Focus on the functionalities first. After all the features are implemented, work on styling for the desktop/mobile version. Leave responsiveness as the last task. Remember to use media queries and only make necessary changes to CSS properties. No need to redo the whole design. Use the requirements on the section above as a checklist. Make sure you completed all the tasks.
- After the project is completed, create a presentation to show your classmates what you have done, how you split the work, what you learned in the process and what was the most difficult part of the project for you.

## Git Control (highly recommended to follow)
- Protect your main branch.
- Work on feature branche(s)
- Regular pushes and descriptive commits

## Hints

Here are a few tips that can help you avoid some issues during the development of the project:

- Before starting coding, meet with your team and set naming patterns for HTML/CSS content and JavaScript functions to avoid conflicts during merge.
- Divide your code into multiple JavaScript and SCSS files, one for each section of the page and one for functions that could be used in different files. For example, API calls should be called in the main file and the data can be exported to other files (the forecast data will be used in “Daily forecast” and “3 hour range” sections).
- A lot of DOM manipulation will be needed in this project, so review how to use event listeners and how to create/modify/delete content of the page using JavaScript.
- Don’t stay stuck for too long in one problem that you cannot solve. First, google it, then ask your teammate for help, then ask the instructor for help. Spend 2-3 hours max to solve the problem or ask for help.

<hr> 

# APIs

### RadarAPI
- For City Suggestion AutoComplete, you may use [RadarAPI](https://radar.com/documentation/api#autocomplete)

- If you need to send your API <strong>key</strong> in a fetch call, you may do so like this: 

````
const response = await fetch(
  `https://api.radar.io/v1/search/autocomplete?query=${query}&layers=locality&limit=5`,
  {
    method: "GET",
    headers: {
      Authorization: RADAR_API_KEY,
    },
  }
);

if (response.ok) {
  const data = await response.json();  
   // do something with data
} else {
  // Handle the error
  console.error('Fetch error:', response.status, response.statusText);
}
````
where your `${RADAR_API_KEY}`is your unique key which can be found under Radar Dashboard.

### OpenMateoWeaterAPI
- Current Weather: [Open-MateoAPI - Current Weather](https://open-meteo.com/en/docs)

- 5 days Forecast & 3hr Forecast: [Open-MateoAPI - 3 hour Forecast](https://open-meteo.com/en/docs)

## Marking Criteria & Submissiom
- You midterm grade depeneds on many factors including but not limited to: 

   * [functional & non-functional](https://www.geeksforgeeks.org/functional-vs-non-functional-requirements/) requirements
   * github contributions
   * teamwork & conflict resolution
   * quality of code and structure
   * error handling
   * code readability
   * UI/UX
   * presentation
- Every member of the group should deploy their work on their respective github pages. Meaning each member of your team should have different live urls. You may use Github pages to host your sites or other hosting providers, for example Netlify, Hostinger etc. 
- To test your project submission, the `main` branch of your [Midterm repo](https://classroom.github.com/a/bMXqHT2x) will be ran by running the command - <br>`npm run dev`. 


- Your midterm project presentation date is <strong>09/07/24</strong>

<hr>

## Additional Notes:

- Remeber that [RadarAPI](https://radar.com/documentation/api#autocomplete) free trail expires in <u>14</u> days from account creation. 
- You can also use other free API(s) to complete the weather app requirements.  
