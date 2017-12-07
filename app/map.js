/**
 * @file map.js
 * @description The map.js file defines the google map functionality -
 * the functions and variables that capture initializing a map from the
 * Google Map API as well as getting the various locations for a handful of
 * filters specified by the modelview.
 * @author Jon Cronin
 */
"use strict";

var locations = [];
var placeMarkers = [];
var map;

// expected latLong for Rocklin is lat: 38.7907339, long: -121.23578279999998
var defaultMapCenter = "Rocklin, CA";

/**
 * getLocations -
 * A function to return an array of filtered locations. The source array is the
 * locations[] array defined above. It is expected that the caller will supply
 * a valid filter.
 * @param  {String} someFilter a string containing a filter value
 * @return {Array} an Array of filtered locations
 */
function getLocations(someFilter) {
  console.log("Filter All locations for " + someFilter);
  var filtered;
  if (someFilter == "All Locations") {
    filtered = locations;
  } else {
    filtered = locations.filter(function(local) {
      return local.type == someFilter;
    });
  }
  console.log(filtered);
  return filtered;
}

/**
 * clearAllMarkersFromView -
 * A function that goes through all entries in the locations array and
 * clears the Google Marker from the Google Map.
 */
function clearAllMarkersFromView() {
  locations.forEach(function(place) {
    place.marker.setMap(null);
  }, self);
}

/**
 * updateMarkerViewability -
 * A function to update the Google Marker viewability on the Google Map by
 * going through all entries in the locations array and setting the Marker on
 * the Map if the filter type matches the input filter.
 * @param  {String} someFilter a string containing a filter value.
 */
function updateMarkerViewability(someFilter) {
  locations.forEach(function(place) {
    if (place.type == someFilter || someFilter == "All Locations") {
      place.marker.setMap(map);
    }
  }, self);
}

/**
 * makeMarkerIcon -
 * A constructor function to create a Google Marker that is colored based on
 * a supplied markerColor.
 * @param  {String} markerColor a string containing the hex representation of a
 *                              color.
 * @return {Google.Maps.MarkerImage} a MarkerImage that is colored based on the
 *                                   input markerColor.
 */
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' +
      markerColor + '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));
  return markerImage;
}

/**
 * populateLocationsAndMarkers -
 * A function that will populate the global locations array with objects that
 * include Markers for the various Google Places returned by the Google
 * PlacesService for the various filter entries in the global filters Array
 * defined in the app.js file for the application.
 * @param  {Google.Maps.Map} map the Google Map that we are working with for
 *                               this app.
 */
function populateLocationsAndMarkers(map) {
  filters.forEach(function(filter) {
    if (filter == "All Locations") {
      return;
    }
    var request = {
      location: {
        lat: 38.7907339,
        lng: -121.23578279999998
      },
      radius: '8000',
      keyword: filter
    };
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status) {
      if (status == 'OK') {
        console.log("INFO: Places API succeeded for " + filter);
        for (var ii = 0; ii < results.length; ii++) {
          if (ii > 4) {
            // only handle at most the first 5 entries
            break;
          }
          // console.log(results[ii]);
          // check to see if the place already exists in the locations array
          if (locations.find(function(currentValue) {
            return currentValue.place.name == this;
          }, results[ii].name)) {
            console.log("WARN: " + results[ii].name +
                        " already exists in locations");
            continue;
          }

          var largeInfowindow = new google.maps.InfoWindow();
          // Style the markers a bit. This will be our listing marker icon.
          var defaultIcon;
          switch (filter) {
            case "Golf Courses":
              defaultIcon = makeMarkerIcon('000099');
              break;
            case "Donuts":
              defaultIcon = makeMarkerIcon('ff4d94');
              break;
            case "Breweries":
              defaultIcon = makeMarkerIcon('663300');
              break;
            case "Mexican Restaurants":
              defaultIcon = makeMarkerIcon('ff9900');
              break;
            case "Parks":
              defaultIcon = makeMarkerIcon('33cc33');
              break;
          }

          // Create a "highlighted location" marker color for when the user
          // mouses over the marker.
          var highlightedIcon = makeMarkerIcon('FFFF24');

          // Get the position from the location array.
          var position = results[ii].geometry.location;
          var title = results[ii].name;
          // Create a marker per location, and put into markers array
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            icon: defaultIcon,
            animation: google.maps.Animation.DROP,
            id: (locations.length - 1)
          });

          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
          // Two event listeners - one for mouseover, one for mouseout,
          // to change the colors back and forth.
          marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
          });
          marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
          });

          // Push the marker to our array of markers.
          // take the result and store it in the all locations array
          var locObj = {
            type: filter,
            place: results[ii],
            marker: marker
          };
          locations.push(locObj);
        }
        myModel.viewablePlaces(locations);
      } else {
        console.log("ERR: Places API call for " + filter + " filter");
        console.log(status);
      }
    });
  });
}

/**
 * geocodeBaseCity -
 * A function to set the default center of the give map
 * @param  {String} address a string containing the town/address that the Google
 *                          Geocoder API expects.
 * @param  {Google.Maps.Map} map the Google Map that we are working with for
 *                               this app.
 */
function geocodeBaseCity(address, map) {
  var geocoder = new google.maps.Geocoder();
  var latLong;
  geocoder.geocode({
    'address': defaultMapCenter
  }, function(results, status) {
    if (status == 'OK') {
      latLong = results[0].geometry.location;
      map.setCenter(latLong);
    }
  });
}

/**
 * populateInfoWindow -
 * A function to populate the InfoWindow when the Google Marker is clicked.
 * @param  {Google.Maps.Marker} marker The Google Marker we want to associate
 *                                     an InfoWindow with.
 * @param  {Google.Maps.InfoWindow} infowindow The Google InfoWindow that is
 *                                             being acted upon - either opening
 *                                             or closing.
 */
function populateInfoWindow(marker, infowindow) {
  // handle animation of marker on click
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  }
  else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    },1400);
  }
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);

    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });
  } else {
    console.log("WARN: " + marker.title + " InfoWindow already opened");
  }
}

/**
 * initMap -
 * A function to initialize the Google Map for this application.
 */
function initMap() {
  var mapOptions = {
    zoom: 12,
    center: {
      lat: 0,
      lng: 0
    }
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  geocodeBaseCity(defaultMapCenter, map);
  populateLocationsAndMarkers(map);
  //TODO - Add a function that goes to the Foursquare API and gets the pic
  //populateLocationsWithPics()
};

/**
 * handleGoogleError -
 * A function to handle the error condition for the async call to the
 * Google Maps API.
 */
function handleGoogleError() {
  // update the map div with content that indicates an error ocurred
  console.log("ERR: Google maps API call failed");
}
