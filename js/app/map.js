/**
 * @file map.js
 * @description The map.js file defines the google map functionality -
 * the functions and variables that capture initializing a map from the
 * Google Map API as well as getting the various locations for a handful of
 * filters specified by the modelview.
 * @author Jon Cronin
 */
"use strict";

var map;

// expected latLong for Rocklin is lat: 38.7907339, long: -121.23578279999998
var defaultMapCenter = "Rocklin, CA";

/**
 * clearAllMarkersFromView -
 * A function that goes through all entries in the locations array and
 * clears the Google Marker from the Google Map.
 */
function clearAllMarkersFromView() {
  console.log("INFO: Clearing all markers from view");
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
  console.log("INFO: setting markers for " + someFilter + " filter");
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
  console.log("INFO: creating " + markerColor + " marker icon");
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
 * updateLocationWithImg -
 * A function that updates a location in the locations array with a given URL
 * for a photo of that location of some sort. The updated field of the location
 * object is the "displayContent" field which is the block of HTML that is
 * embedded in the Google InfoWindow of the Google Marker associated with
 * each location on the map.
 * @param  {String} someTitle  The title of the location/place in the locations
 *                             array that needs to be updated.
 * @param  {String} someImgUrl The URL of the image to be used in the
 *                             displayContent of the location object associated
 *                             with "someTitle" found in the locations array.
 */
function updateLocationWithImg(someTitle,someImgUrl) {
  if(!someImgUrl) {
    console.log("WARN: location " + someTitle +
                " does not have a 4Square image");
    return;
  }
  var idx = locations.findIndex(function(local) {
    return local.place.name == someTitle;
  });
  if(idx) {
    locations[idx].displayContent = '<div><h3>' + someTitle + '</h3>' +
                                    '<img src="' + someImgUrl + '">' +
                                    '</div>' +
                                    '<footer>foursquare image</footer>';
  }
  console.log("INFO: " + someTitle + " updated with display content - \n" +
              locations[idx].displayContent);
}

/**
 * makeFourSquareImg -
 * A function that will make Jquery API calls to create HTTP get requests to
 * the FourSquare API Search and Photos Endpoints. This API is used to populate
 * the photo that is used in the Google InfoWindow for a marker being displayed
 * for a specific location on the map. Ultimately this function will update the
 * locations array items with the URL for the photo if one is found.
 * @param  {Google LatLng} latLong the Google LatLng object for a specific
 *                                 location.
 * @param  {String} title   the title/name of the location being searched for.
 */
function makeFourSquareImg(latLong, title) {
  var foursquare_client_id =
                        "XSB01FC3WW2BE1VJQTTDNI2GS04HTFTG5OVKWJC5BNDEJWC5";
  var foursquare_client_secret =
                        "HJUFYYZCGR00V3IA34BT2NPYPJKRMQWKXSJUUDSMTN5X1HA3";
  var llString = latLong.toUrlValue();
  var foursquare_url = "https://api.foursquare.com/v2/venues/search?" +
                       "&client_id=" +
                       foursquare_client_id +
                       "&client_secret=" +
                       foursquare_client_secret +
                       "&ll=" +
                       llString +
                       "&v=20171218&limit=1";
  console.log("INFO: Making 4Square requests for " + title);

  $.getJSON(foursquare_url,function(venueData) {
    if(venueData.meta.code != '200') {
      console.log("ERROR: 4Square failed to get venue " + title);
      return;
    }
    var locID = venueData.response.venues[0].id;
    console.log("INFO: 4Square got the location \n" + title +
                "\n" + locID);
    var photosUrl = "https://api.foursquare.com/v2/venues/" +
                    locID +
                    "/photos?" +
                    "&client_id=" +
                    foursquare_client_id +
                    "&client_secret=" +
                    foursquare_client_secret +
                    "&v=20171218&limit=1";
    $.getJSON(photosUrl, function(photoData) {
      if(photoData.meta.code != '200') {
        console.log("ERROR: 4Square failed to get photo for venue " + title);
        return;
      }
      console.log("INFO: 4Square got the photo for \n" + title +
                  "\n" + locID);
      var imgUrl = "";
      if(photoData.response.photos.count != 0) {
        imgUrl = photoData.response.photos.items[0].prefix +
                 "100x100" +
                 photoData.response.photos.items[0].suffix;
      }
      updateLocationWithImg(title,imgUrl);
    });
  });

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
  var largeInfowindow = new google.maps.InfoWindow();
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
        console.log("INFO: Google Places API succeeded for " + filter);
        for (var ii = 0; ii < results.length; ii++) {
          if (ii > 4) {
            // only handle at most the first 5 entries
            break;
          }
          // check to see if the place already exists in the locations array
          if (locations.find(function(currentValue) {
            return currentValue.place.name == this;
          }, results[ii].name)) {
            console.log("WARN: " + results[ii].name + " already exists in locations");
            continue;
          }
          // Get the position from the location array.
          var position = results[ii].geometry.location;
          var title = results[ii].name;

          // Style the markers a bit based on the filter.
          // Also set the default displayContent.
          var defaultIcon;
          var defaultDisplayContent;
          switch (filter) {
            case "Golf Courses":
              defaultIcon = makeMarkerIcon('000099');
              defaultDisplayContent = '<div><h3>' + title + '</h3>' +
                  '<img style="width:100px" src="media/defaultPark.jpeg"></div>'
              break;
            case "Donuts":
              defaultIcon = makeMarkerIcon('ff4d94');
              defaultDisplayContent = '<div><h3>' + title + '</h3>' +
                  '<img style="width:100px" src="media/defaultFood.png"></div>'
              break;
            case "Breweries":
              defaultIcon = makeMarkerIcon('663300');
              defaultDisplayContent = '<div><h3>' + title + '</h3>' +
                  '<img style="width:100px" src="media/defaultFood.png"></div>'
              break;
            case "Mexican Restaurants":
              defaultIcon = makeMarkerIcon('ff9900');
              defaultDisplayContent = '<div><h3>' + title + '</h3>' +
                  '<img style="width:100px" src="media/defaultFood.png"></div>'
              break;
            case "Parks":
              defaultIcon = makeMarkerIcon('33cc33');
              defaultDisplayContent = '<div><h3>' + title + '</h3>' +
                  '<img style="width:100px" src="media/defaultPark.jpeg"></div>'
              break;
          }

          // Create a "highlighted location" marker color for when the user
          // mouses over the marker.
          var highlightedIcon = makeMarkerIcon('FFFF24');


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
            marker: marker,
            displayContent: defaultDisplayContent
          };
          locations.push(locObj);
          console.log("INFO: " + locObj.place.name + " added to locations");
          makeFourSquareImg(position, title);
        }
        myModel.viewablePlaces(locations);
      } else {
        console.log("ERROR: Google Places API call failed for " + filter +
                    " filter");
        console.log("ERROR: " + status);
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
    else {
      console.log("ERROR: Google Geocoder API failed for " + address);
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

    var loc = locations.find(function(someLoc) {
      return someLoc.place.name == marker.title;
    });
    if(loc) {
      infowindow.setContent(loc.displayContent);
    }
    else {
      infowindow.setContent('<div>' + marker.title + '</div>');
    }

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
};

/**
 * [gm_authFailure description]
 * Global function that is called by default by the Google Maps API when it
 * encounters a failure.
 */
function gm_authFailure() {
  // update the map div with content that indicates an error ocurred
  console.log("ERROR: Google maps API call failed");
  alert("Google Maps API failed.\n" +
        "Please check your connection and refresh the page.");
}
