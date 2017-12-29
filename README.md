<!-- TOC depthFrom:1 depthTo:6 withLinks:1 updateOnSave:1 orderedList:0 -->

- [Summary](#summary)
- [Requirements](#requirements)
	- [Interface Design](#interface-design)
	- [App Functionality](#app-functionality)
	- [App Architecture](#app-architecture)
	- [Asynchronous Data Usage](#asynchronous-data-usage)
	- [Location Details Functionality](#location-details-functionality)
	- [Documentation](#documentation)
- [High Level Design](#high-level-design)
- [Resources](#resources)
	- [js/lib/jquery-3.2.1.min.js](#jslibjquery-321minjs)
	- [js/lib/knockout-3.4.2.js](#jslibknockout-342js)
	- [app/app.js](#appappjs)
	- [app/map.js](#appmapjs)
	- [index.html](#indexhtml)
- [Usage](#usage)

<!-- /TOC -->
# Summary
The Map App is a Single Page Application that utilizes the Knockout JavaScript
Library as well as the Google Maps JavaScript Library, Google Maps API and the
FourSquare API in order to display a map of my current neighborhood or a place
I'd like to visit. For this project as I currently live in Rocklin, CA, I've
decided to show places that exist in and around this area.

The Map App is the 5th project laid out in the curriculum for the Udacity Full
Stack web developer Nanodegree.

# Requirements
## Interface Design
* Responsiveness
	- All application components render on-screen in a responsive manner.
* Usability
	- All application components are usable across modern desktop, tablet, and
		phone browsers.

## App Functionality
* Filter Locations
	- Includes a text input field or dropdown menu that filters the map markers
		and list items to locations matching the text input or selection.
	- Filter function runs error-free.
* List View
	- A list-view of location names is provided which displays all locations by
		default, and displays the filtered subset of locations when a filter is
		applied.
	- Clicking a location on the list displays unique information about the
	  location, and animates its associated map marker (e.g. bouncing, color
	  change).
	- List functionality is responsive and runs error free.
* Map and Markers
	- Map displays all location markers by default, and displays the filtered
		subset of location markers when a filter is applied.
	- Clicking a marker displays unique information about a location in either
	  an infoWindow or DOM element.
	- Markers should animate when clicked (e.g. bouncing, color change.)
	- Any additional custom functionality provided in the app functions
		error-free.

## App Architecture
* Proper Use of Knockout
	- Code is properly separated based upon Knockout best practices (follow an
		MVVM pattern, avoid updating the DOM manually with jQuery or JS, use
		observables rather than forcing refreshes manually, etc).
	- Knockout should not be used to handle the Google Map API.

## Asynchronous Data Usage
* Asynchronous API Requests
	- Application utilizes the Google Maps API and at least one non-Google
		third-party API.
	- All data requests are retrieved in an asynchronous manner.
* Error Handling
	- Data requests that fail are handled gracefully using common fallback
		techniques (i.e. AJAX error or fail methods).
	- 'Gracefully' means the user isn’t left wondering why a component isn’t
		working. If an API doesn’t load there should be some visible indication
		on the page (an alert box is ok) that it didn’t load. Note: You do not
		need to handle cases where the user goes offline.

## Location Details Functionality
* Additional Location Data
	- Functionality providing additional data about a location is provided and
		sourced from a 3rd party API. Information can be provided either in the
		marker’s infoWindow, or in an HTML element in the DOM (a sidebar, the
		list view, etc.).
	- Provide attribution for the source of additional data. For example, if
		using Foursquare, indicate somewhere in your UI and in your README that
		you are using Foursquare data.
* Error Free
	- Application runs without errors.
* Usability
	- Functionality is presented in a usable and responsive manner.

## Documentation
* README
	- A README file includes details of all the steps required to successfully
		run the application.
* Comments
	- Comments are present and effectively explain longer code procedures.
* Code Quality
	- Code is formatted with consistent, logical, and easy-to-read formatting
		as described in the Udacity JavaScript Style Guide.

# High Level Design
To meet the specifications laid out above, this Single Page Application uses
the Knockout JavaScript library to follow a Model-View-ViewModel pattern to
quickly and efficiently display dynamic content and react to user input without
redirecting to multiple pages.

This application further utilizes Google APIs and FourSquare APIs to retrieve
information about locations in and around the Rocklin, CA area that match a
set of filter "types". The types hardcoded into the application are the only
important types of locations that should ever be considered -
* Golf Courses
* Donuts
* Breweries
* Mexican Restaurants
* Parks

The application attempts to retrieve no more than 5 unique locations for each
filter type and will display these locations on a Google Map rendered on the
page. These locations can be selected either directly from the markers on the
map or through a menu on the left side of the page. Selecting a location will
display for the User more detail about the location which at this time is simply
a single photo retrieved from the FourSquare API.

A dropdown filter menu will allow the User to filter the larger menu list of
locations down to the locations that match the specific filter type.
Additionally filter selection will only show those specific locations on the
rendered map.

The site has a responsive design and utilizes the W3.CSS framework to relieve
the developer from having to craft all the CSS stylesheet classes that allow
a responsive design.

# Resources
## js/lib/jquery-3.2.1.min.js
The JQuery JavaScript library is used to issue an AJAX HTTP request to the
FourSquare API. This feels a bit like overkill to take in the entire library
for a single call to the library. Including this library allows for future
proofing this project and makes the call to the FourSquare API very easy to
deal with.

## js/lib/knockout-3.4.2.js
The Knockout JavaScript library is used to implement the
Model-View-ViewModel pattern that is a requirement for this project. This
library allows the implementation to utilize the concept of observables such
that changes to observable variables in the JavaScript will quickly translate
into visible changes for the User interacting with the UI of the
application/website as well as quickly handle user interactions with the
controls on a webpage to be translated into changes to JavaScript observable
variables.

## app/app.js
The app.js file is the base file for the Knockout MVVM pattern utilized by this
project. This file handles some of the Model and ModelView portions of the
pattern by setting up the observable variables utilized by the View and reacting
to User interactions with the View.

There is an array of filters defined in this file that is used as the source for
a dropdown control in the View. This dropdown will control what list of
locations will be viewable on the map for the User.

There is a core piece of the Model that is defined in this file and that is the
"locations" array. This array will eventually contain custom "location" objects
that are used to represent the locations that we pull from the Google API, the
Google Marker associated with a location that is displayed on the Map, and the
displayed HTML content that exists within the Google InfoWindow associated with
a specific locations Google Marker.

`location = {type: filter from filters Array,  
						 place: Google Location,  
						 marker: Google Marker,  
						 displayContent: HTML content in the form of  
														 '<div>' + title + '</div>'  
						}`

The locations array is defined in this app.js file because it is a core piece of
the Model and is required in order to view the navigation list menu on the
left side of the site for all the locations retrieved from the Google API.
This list can be filtered down by the dropdown control that lists the types of
places that have been retrieved and which are viewable by the User.

## app/map.js
The map.js file is the core file for the Google and FourSquare API interactions.
This file contains quite of bit code that handles updating elements in the
locations array defined in the app.js file. These files are currently highly
coupled and is not really a great design but I'm still learning on JavaScript
modularity best practices.

The implementation in this file will initialize the Google Map variable which
will end up getting rendered as a viewable map with Google Markers and Google
InfoWindows in the "map" HTML div that lives on the index.html file the User
interacts with.

This implementation in this file will attempt to retrieve 5 places for each
filter "type" listed in the filter array defined in app.js. The Google Maps
Places API will be utilized to retrieve these "types" of places and store the
resultant Google Location object with each location in the locations array.

Along with the declaration of the Google Map object and the retrieval of
Google Locations for specific types of places, this file defines the
functionality for creating Google Markers for each location and an associated
Google InfoWindow for each Marker. These Markers are stored with each location
in the locations array.

This file also defines the functionality that retrieves a photo from the
FourSquare API for a specific location. As the elements in the locations array
contain a Google Location which itself contains a Google LatLng (latitude,
longitude pair), the location's LatLng can be used to retrieve venue information
and photo information for that venue from the FourSquare API. Once a single
photo is retrieved (if one exists) the URL for that image can be stored with
each location in the locations array. This information is stored as what will
be the HTML for content for the Google InfoWindow associated with the
Google Marker associated with the specific location.

**NOTE! -
There is a key assumption here that the Google API and the FourSquare API have
consistent data represented for a specific LatLng. If they are not consistent
then photos may not be accurate for a location.**

## index.html
The index.html file defines a portion of the View in the Model-View-ViewModel
pattern demonstrated by this application. This file defines the skeleton for the
content that is dynamically displayed for the User while the W3.CSS framework
defines the style that User sees.

# Usage
This Single Page Application can be deployed very simply on any web server.
Pull the entirety of the repo and the directory structure to the root directory
that the web server expects to serve to HTTP port 80 page requests. Typically
index.html is the default home page that a web server will render/return for a
the top level URL that a User may attempt to browse to. As the JavaScript to
handle dynamic rendering of content and responding to User input is all included
in the folders of the repo, a User only needs to be using a web browser that
supports JavaScript.

Additionally if one wanted to sample and open the app locally you could pull the
entirety of the repo to your local machine and open the index.html with your
favorite browser.
