const loadingScreen = document.getElementById("loadingScreen");
const loadingPhrase = document.getElementById("loadingPhrase");
const resultArea = document.getElementById("resultArea-text");
const primaryPacCard = document.querySelector(".primary-pac-card");
const primaryMainMapForm = document.querySelector(".primary-main-map-form");
const primaryMainFormResult = document.querySelector(".primary-main-form-result");
const locationName = document.getElementById("locationName");

let address = "";
let loadingStatements = [
  "Looking for the property...",
  "Searching the database...",
  "Matching the details...",
];

// Function to hide all sections except primary-pac-card
function hideAllSectionsExceptPrimaryPacCard() {
  primaryPacCard.style.display = "flex";
  primaryMainMapForm.style.display = "none";
  primaryMainFormResult.style.display = "none";
}

// Initial page load behavior
window.addEventListener("load", () => {
  hideAllSectionsExceptPrimaryPacCard();
});

// Increase font size, change color, and set font family for loading statements
function styleLoadingStatements() {
  loadingPhrase.style.fontSize = "24px"; // Change the font size to your desired value
  loadingPhrase.style.color = "#AE893E"; // Change the color to your desired color
  loadingPhrase.style.fontFamily = "Arial, sans-serif"; // Change the font family to your desired font
}

// Call the styleLoadingStatements function to apply the styles
styleLoadingStatements();

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 40.749933, lng: -73.98633 },
    zoom: 13,
    mapTypeControl: false,
  });

  const card = document.getElementById("pac-card");
  const input = document.getElementById("pac-input");
  const options = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
  };

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(card);

  const autocomplete = new google.maps.places.Autocomplete(input, options);

  autocomplete.bindTo("bounds", map);

  const infowindow = new google.maps.InfoWindow();
  const infowindowContent = document.getElementById("infowindow-content");

  infowindow.setContent(infowindowContent);

  const marker = new google.maps.Marker({
    map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener("place_changed", () => {
    infowindow.close();
    marker.setVisible(false);

    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    address = place.formatted_address;

    // Update the content of the <h3> element with the entered address
    locationName.textContent = address;

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    infowindow.open(map, marker);
  });
}

window.initMap = initMap;

document.querySelector("#pac-input").addEventListener("input", (e) => {
  const typedAddress = document.querySelector("#pac-input");
  address = typedAddress.value;

  // Update the content of the <h3> element with the entered address
  locationName.textContent = address;
});

document.querySelector("#homeValueForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  showMainMapForm();
  resultArea.style.fontWeight = 500;
  $.ajax({
    url: "https://home-value-server.vercel.app/home_value",
    contentType: "application/json",
    method: "post",
    data: JSON.stringify({ address }),
    success: (res) => {
      hideLoadingScreen();
      if (!res.response || Object.keys(res.response).length === 0)
        resultArea.textContent = "Unexpected Error, Please try again";
      else if (res.response.low == null) resultArea.textContent = res.response;
      else if (res.response.low === 0) resultArea.textContent = "No Valuation";
      else {
        resultArea.style.fontWeight = 900;
        resultArea.innerHTML = `Your property is worth around <br>$${res.response.low} - $${res.response.high}`;
      }
    },
  });
  await showLoadingScreen();
});

document.querySelector(".primary-main-map-form .button-9").addEventListener("click", (e) => {
  e.preventDefault();
  showMainFormResult();
});

// Attach an event listener to the "Get My Value" button
document.querySelector(".primary-main-map-form .button-9").addEventListener("click", (e) => {
  e.preventDefault();
  showMainFormResult();
  // createUserInCRM(); 
});

function showMainMapForm() {
  primaryPacCard.style.display = "none";
  primaryMainMapForm.style.display = "flex";
  primaryMainFormResult.style.display = "none";
}

function showMainFormResult() {
  primaryPacCard.style.display = "none";
  primaryMainMapForm.style.display = "none";
  primaryMainFormResult.style.display = "flex";
}

function hideLoadingScreen() {
  loadingScreen.style.display = "none";
}

async function showLoadingScreen() {
  loadingScreen.style.display = "flex";
  for (let i = 0; i < loadingStatements.length; i++) {
    loadingPhrase.textContent = loadingStatements[i];
    await delay(4000);
  }
}

function delay(delayInms) {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
}