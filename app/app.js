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

function getLocations(someFilter) {
  switch(someFilter){
    case "Golf Courses":
    locations = ['Golf Courses',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations'];
    break;
    case "Donuts":
    locations = ['Donuts',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations'];
    break;
    case "Breweries":
    locations = ['Breweries',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations'];
    break;
    case "Mexican Restaurants":
    locations = ['Mexican Restaurants',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations'];
    break;
    case "Parks":
    locations = ['Parks',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations'];
    break;
    default:
    locations = ['All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations',
                 'All Locations'];
    break;
  }
  return locations;
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
var defaultMapCenter = "Rocklin, CA";

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
  populateLocations(filters);
};
