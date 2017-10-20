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


/**
* ViewModel definitions
**/
var ViewModel = function () {
  var self = this;

  this.filterList = ko.observableArray([]);

  filters.forEach(function(filter) {
    self.filterList.push(filter);
  });

  this.currentFilter = ko.observable( this.filterList()[0] );
  this.locationList = ko.observableArray([]);
};

/*
* Activate Knockout for the Application
**/
ko.applyBindings(new ViewModel());
