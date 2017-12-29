/**
 * @file app.js
 * @description The app.js file defines the Model and ViewModel for a Model -
 * View - ViewModel based Single Page Application that features a map of a
 * neighborhood. This SPA includes highlighted locations, and utilizes
 * third-party data about those locations and various ways to browse the
 * content.
 * @author Jon Cronin
 */

"use strict";

/**
 * filters is a list of the "filters" that will be displayed for the user as the
 * options in a select input field.
 * @type {Array}
 */
var filters = [
  'All Locations',
  'Golf Courses',
  'Donuts',
  'Breweries',
  'Mexican Restaurants',
  'Parks'
];

/**
 * locations Array is an array of custom objects that maintains the list
 * of locations that will be retrieved from the Google Places API.
 * These locations/Places will then be used to populate a menu as well as their
 * associated Google Markers that will be displayed on the map.
 * Objects in the locations array look like this -
 * {type: String that matches one of the filters from the filterList,
 *  place: Google Place that is retrieved by a Google Places nearbySearch,
 *  marker: Google Marker associated with the Place on the map
 * }
 * @type {Array} of custom "location" objects
 *               location = {type: filter from filters Array,
                             place: Google Location,
                             marker: Google Marker,
                             displayContent: HTML content in the form of
                                             '<div>' + title + '</div>'
                            }
 */
var locations = [];

/**
 * getLocations -
 * A function to return an array of filtered locations. The source array is the
 * locations[] array defined above. It is expected that the caller will supply
 * a valid filter.
 * @param  {String} someFilter a string containing a filter value
 * @return {Array} an Array of filtered locations
 */
function getLocations(someFilter) {
  console.log("INFO: Filter All locations for " + someFilter);
  var filtered;
  if (someFilter == "All Locations") {
    filtered = locations;
  } else {
    filtered = locations.filter(function(local) {
      return local.type == someFilter;
    });
  }
  return filtered;
}

/**
 * The constructor for a custom ViewModel object that Knockout JS will manage.
 *
 * Obervables -
 *
 * filterList:
 * An observableArray that contains the list of filters that can be selected
 * by the user. This filterList will populate the options of a select input
 * field. When an option is selected it will update the selectedFilter
 * observable.
 *
 * selectedFilter:
 * An observable that contains the currently selected option from the
 * filterList.
 *
 * viewablePlaces:
 * An observableArray that contains the list of places or locations filtered
 * from the locations array that is populated by the Google Places API. The
 * objects in this array are custom objects that contain a Google Marker
 * associated with a specific location retrieved from the Google Places API.
 * This viewablePlaces list will be displayed as a list of links that the user
 * can click to trigger the Google InfoWindow on the Google Map associated with
 * the specific Google Marker.
 *
 * updatePlaces:
 * A computed observable that will react to changes the selectedFilter
 * observable. This updatePlaces computer observable will update the
 * viewablePlaces observableArray when the user selects a filter. It will also
 * trigger updates to the Google Map by updating the Google Markers to only
 * show the markers for the newly determined viewablePlaces.
 *
 * Functions -
 * toggleMarkerWindow:
 * A function to react to user clicks on entries on the viewablePlaces.
 * This function will trigger a 'click' event on the Google Infowindow
 * associated on a specific Google Marker being tracked in the viewablePlaces
 * observableArray.
 *
 * @return {ViewModel} a Knockout JS ViewModel
 */
var ViewModel = function() {
  var self = this;

  self.filterList = ko.observableArray(filters);
  self.selectedFilter = ko.observable();
  self.viewablePlaces = ko.observableArray();
  self.updatePlaces = ko.computed(function() {
    console.log("INFO: Updating viewable places")
    var list = getLocations(this.selectedFilter());
    self.viewablePlaces(list);
    clearAllMarkersFromView();
    updateMarkerViewability(this.selectedFilter());
  }, self);

  self.toggleMarkerWindow = function(object) {
    console.log("INFO: " + object.place.name + " selected");
    google.maps.event.trigger(object.marker, 'click');
  };

  self.toggleMenu = function(object) {
    console.log("INFO: SideMenu toggled");
    var panel = document.getElementById("sideMenu");
    if (panel.style.display == "block") {
      panel.style.display = "none";
      panel.className = panel.className.replace(" w3-animate-left", "")
    } else {
      panel.className += " w3-animate-left"
      panel.style.display = "block";
    }
  };
};


/**
 * Activate Knockout for the Application
 */
var myModel = new ViewModel();
ko.applyBindings(myModel);
