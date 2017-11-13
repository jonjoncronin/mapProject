/**
* @file app.js
* @description The app.js file defines the Model and ViewModel for a Model -
* View - ViewModel based Single Page Application that features a map of a
* neighborhood. This SPA includes highlighted locations, and utilizes
* third-party data about those locations and various ways to browse the content.
* @author Jon Cronin
**/
"use strict";

/**
* Model Definitions
**/
var filters = ['All Locations',
               'Golf Courses',
               'Donuts',
               'Breweries',
               'Mexican Restaurants',
               'Parks'];
var locations = [];
var placeMarkers = [];
var map;
// expected latLong for Rocklin is lat: 38.7907339, long: -121.23578279999998
var defaultMapCenter = "Rocklin, CA";

function getLocations(someFilter) {
  console.log("Filter All locations for " + someFilter);
  var filtered;
  if(someFilter == "All Locations") {
    filtered = locations;
  }
  else {
    filtered = locations.filter(function(local) {
      return local.type == someFilter;
    });
  }
  console.log(filtered);
  return filtered;
};

function clearAllMarkersFromView() {
  locations.forEach(function(place) {
    place.marker.setMap(null);
  }, self);
};

function updateMarkerViewability(someFilter) {
  locations.forEach(function(place) {
    if(place.type == someFilter ||
       someFilter == "All Locations") {
      place.marker.setMap(map);
    }
  }, self);
};
/**
* ViewModel definitions
**/
var ViewModel = function () {
  var self = this;

  self.filterList = ko.observableArray(filters);
  self.selectedFilter = ko.observable( self.filterList()[0] );
  self.viewablePlaces = ko.observableArray([]);
  self.updatePlaces = ko.computed(function() {
    console.log("Updating viewable places")
    var list = getLocations(this.selectedFilter());
    self.viewablePlaces(list);
    clearAllMarkersFromView();
    updateMarkerViewability(this.selectedFilter());
  }, self);
};

/*
* Activate Knockout for the Application
**/
var myModel = new ViewModel();
ko.applyBindings(myModel);

/*
* Google Maps work
**/
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function populateLocationsAndMarkers(map) {
  filters.forEach(function(filter) {
    if(filter == "All Locations") {
      return;
    }
    var request = {
      location: {lat: 38.7907339, lng: -121.23578279999998},
      radius: '8000',
      keyword: filter
    };
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results,status) {
      if(status == 'OK') {
        console.log("Places API call worked");
        for(var ii = 0;ii<results.length;ii++)
        {
          if(ii>4) {
            // only handle at most the first 5 entries
            break;
          }
          // console.log(results[ii]);

          var largeInfowindow = new google.maps.InfoWindow();
          // Style the markers a bit. This will be our listing marker icon.
          var defaultIcon;
          switch(filter) {
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
          // Create a marker per location, and put into markers array.
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
          var locObj = {type: filter,
                        place: results[ii],
                        marker: marker};
          locations.push(locObj);
        }
      }
      else {
        console.log("Places API call didn't like you");
        console.log(status);
      }
    });
  });
};

function geocodeBaseCity(address, map) {
  var geocoder = new google.maps.Geocoder();
  var latLong;
  geocoder.geocode({'address': defaultMapCenter}, function(results, status) {
    if (status == 'OK') {
      latLong = results[0].geometry.location;
      map.setCenter(latLong);
    }
  });
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div>' + marker.title + '</div>');
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
}

// Initialize the google map.
// Set the center to Rocklin
function initMap() {
  var mapOptions = {
    zoom: 12,
    center: {lat: 0, lng: 0}
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  geocodeBaseCity(defaultMapCenter, map);
  populateLocationsAndMarkers(map);
};
