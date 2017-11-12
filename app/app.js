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

var golfLocations = [];
var donutLocations = [];
var brewLocations = [];
var mexicanLocations = [];
var parkLocations = [];
var allLocations = []
var locations;

function getLocations(someFilter) {
  switch(someFilter){
    case "Golf Courses":
      return golfLocations;
    break;
    case "Donuts":
      return donutLocations;
    break;
    case "Breweries":
      return brewLocations;
    break;
    case "Mexican Restaurants":
      return mexicanLocations;
    break;
    case "Parks":
      return parkLocations;
    break;
    default:
      return allLocations;
    break;
  }
  return [];
};

/**
* ViewModel definitions
**/
var ViewModel = function () {
  var self = this;

  self.filterList = ko.observableArray([]);

  filters.forEach(function(filter) {
    self.filterList.push(filter);
  });

  self.selectedFilter = ko.observable( self.filterList()[0] );

  self.locationList = ko.computed(function () {
    console.log("Changing locations list for - ");
    console.log(this.selectedFilter());
    return getLocations(this.selectedFilter());
  }, self);

};

/*
* Activate Knockout for the Application
**/
ko.applyBindings(new ViewModel());

/*
* Google Maps work
**/
var map;
// expected latLong for Rocklin is lat: 38.7907339, long: -121.23578279999998
var defaultMapCenter = "Rocklin, CA";

function populateLocations(map) {
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
          console.log(results[ii]);
          // take the result and store it in the applicable location array
          var locObj = {name: results[ii].name,
                        url: 'http://example.com'};
          switch(filter) {
            case "Golf Courses":
              golfLocations.push(locObj);
            break;
            case "Donuts":
              donutLocations.push(locObj);
            break;
            case "Breweries":
              brewLocations.push(locObj);
            break;
            case "Mexican Restaurants":
              mexicanLocations.push(locObj);
            break;
            case "Parks":
              parkLocations.push(locObj);
            break;
            default:
            break;
          }
        }
        // now populate all locations array
        allLocations = golfLocations.concat(donutLocations,
                                            brewLocations,
                                            mexicanLocations,
                                            parkLocations);
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

function initMap() {
  var mapOptions = {
    zoom: 12,
    center: {lat: 0, lng: 0}
  };
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
  geocodeBaseCity(defaultMapCenter, map);
  populateLocations(map);
};
