var googleCheck = {
  //checks if google maps loaded successfully and acts if that is not the case
  flag: false,
  setFlag: function() {
    //flag set when google loads through the script tag whcih loads googles onload attribute
    googleCheck.flag = true;
  },
  failCheck: function() {
    //uses a timer to check if google loaded properly
    window.setTimeout(function() {
      if (!googleCheck.flag) {
        alert("We couldn't get in contact with our friends at Google for some reason. Try reloading the page");
      }
    }, 5000);
  }
};

function MapAddressMarker() {
  //maps addresses listed in drop down menu of Foursquare received addresses to the markers corresponding to those
  //locations on the map
  var that = this;
  this.mappings = {};
  this.addMapping = function(address, marker) {
    this.mappings[address] = marker;
  };
  this.mapAddress = function(address) {
    return this.mapping[address];
  };

  this.filter = (function() {
    //filter displays or hides foursquare results depending on user query
    var mapping = that.mappings; //this.mapping is an object with keys corresponding to the addresses of the marker they point location property
    var tbr = function() {
      var value = document.getElementById('textQueriorInput').value; //user query
      var addressItems = document.getElementsByClassName('venueItem'); //foursquare venue addresses
      for (var i = 0; i < addressItems.length; i++) {
        //test each venue address against the query and display matches in both the list of addresses and on the map
        // in the form of markers
        var addressClasses = addressItems[i].classList;
        if (addressItems[i].textContent.search(value) > -1) {
          addressClasses.remove('invis');
          //I use the child of the element for styling/convience purposes
          mapping[addressItems[i].children[0].textContent].setVisible(true);
        } else {
          addressClasses.add('invis');
          mapping[addressItems[i].children[0].textContent].setVisible(false);
        }
      }
    };

    return tbr;
  })();

  this.mapAction = function(action) {
    //generates a function which maps an event to the corrisponding other elements event
    if (action === "click") {
      gMap = map;
      mappings = this.mappings;
      var click = (function() {
        var tbr = function(address) {
          gMap.setCenter({
            lat: mappings[address].position.lat(),
            lng: mappings[address].position.lng()
          });
          google.maps.event.trigger(mappings[address], 'click', {});
          controls.textQuerior.dispatchClick();
        }
        return tbr;
      })();
      return click;
    }
  };
}

function infoDisplay(content) {
  //takes data returned from Foursquare, extracts what I will be using and generates all corrisponding Google Map markers,
  //click handlers and pushes elements to be used into UI into their obserbables.
  var venue = content.response.venue; //ignore meta data
  if (!myViewModel.infoWindow) {
    //I am creating only one Info window so I check if it exists and where it does not... I create it
    //Why not just create it in my ViewMdoel... IDK
    myViewModel.infoWindow = new google.maps.InfoWindow({
      map: map
    });
    myViewModel.infoWindow.close(); //map was opening by default upon creation... that was not desirable
  }
  var genContent = function(content) {
    //generates content string to populate info window for a specific venue when marker of menu item corrisponding to
    //that venue is clicked
    //just check if fields exist in the passed content and where they do I use them to populate the info window
    var contentSTR = '';
    var appendee;
    if (content.name) {
      appendee = '<h1><a class="infoName" href="' + content.canonicalUrl + '">' + content.name + '</a></h1>'
      contentSTR += appendee;
    }
    if (content.location.address) {
      appendee = '<h2 class="infoAddress">' + content.location.address + '</h2>'
      contentSTR += appendee;
    }
    contentSTR += '<div class="rowFlex justifyAround">'
    if (content.photos.count > 0) {
      imgData = content.photos.groups[0].items[0];
      url = imgData.prefix + '110x110' + imgData.suffix;
      appendee = '<img src="' + url + '"/>'
      contentSTR += appendee;
    }
    var appendee = '<div class="columnFlex textRight justifyAround">';
    if (content.rating) {
      //lololol
      var appendeeee = '<h5>';
      var i;
      for (i = 1; i < content.rating; i++) {
        appendeeee += '&#9733;';
      }
      while (i < 10) {
        appendeeee += '&#9734;';
        i++;
      }
      //sorry
      appendeeee += '</h5>'
      appendee += appendeeee;
    }
    if (content.price) {
      var appendeeee = '<h5>';
      for (var i = 0; i < content.price.tier; i++) {
        appendeeee += '$';
      }
      appendeeee += '</h5>'
      appendee += appendeeee;
    }
    appendee += '</div>'
    contentSTR += appendee;
    contentSTR += '</div><p>Powered by Foursquare</p>';
    return contentSTR;
  };
  if (venue.rating && venue.location.lat) { //where there is no rating on an establishment or it is an ice cream truck.. idk
    var location = {
      lat: venue.location.lat,
      lng: venue.location.lng
    };
    var content = genContent(venue); //probably should change this variable name...
    var image = { //loading my ice cream cone image to be used as my icon... a nice touch I thought`
      url: 'imgs/ice_cream.svg',
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    var marker = new google.maps.Marker({
      position: location,
      icon: image,
      map: map
    });
    marker.addListener('click', (function() {
      //this IIFE encapsulates the data required to properly populate the info window upon clicking
      var myContent = content;
      var info = myViewModel.infoWindow;
      //Chuck Jones was an animator https://www.youtube.com/watch?v=kHpXle4NqWI
      //the function returned by this IIFE animates a google maps marker
      var chuckJones = (function() {
        //I wanted the clicked marker to bounce for a few seconds so this function
        //starts the animation and starts a timer which upon expiring stops the animation
        //got a little complex as I had to handle the possibility that the marker might be
        //clicked repeatedly
        var bounceStarts = 0; //should repr the amount of clicks that need to be terminated
        function bounceEnds() {
          //I only stop the animation where there have been no subsiquent clicks still animating
          bounceStarts--;
          if (!bounceStarts) {
            marker.setAnimation(null);
          }
        };

        function tbr() {
          bounceStarts++;
          marker.setAnimation(google.maps.Animation.BOUNCE);
          window.setTimeout(bounceEnds, 2000);
        }

        return tbr
          //chuckJones says: That's all folks!
      })();

      var tbr = function() {
        //set the content of the info window, opens it in the correct spot and calls the animating function
        info.setContent(myContent);
        info.open(map, marker);
        chuckJones();
      };
      return tbr;
    })());

    //push the address data to my observableArray so it will appear in the UI and make the mapping between that data
    //and the map marker
    myViewModel.venueList.push(venue.location.address);
    myViewModel.addressMarkerMapping.addMapping(venue.location.address, marker);
  }
  return controls.textQuerior.setup(); //side menu UI controls setup...
}

function foursquareCallback(data) {
  //handle when data is recieved from Foursquare
  //Foursquare when querying by some keyword sends back a list of venues
  //I make a request here for each of those venues and call infoDisplay when that request returns successfully


  //set up the open close feature for the side menu... was harder than expected because variable
  // lengths of the address strings changed the size of the menu which led to issues
  controls = controls();

  //functions
  function getVenue(id) {
    //makes a jsonp request for the individual venue data from foursquare
    var venueRequest = new JsonpRequest();
    var url = 'https://api.foursquare.com/v2/venues/' +
      id +
      '?client_id=YKHATSNI4PS0K4TQXIXNWD12B4YCUTDLJC3ECIQMJ5QQTBNK' +
      '&client_secret=DAB2LCKMTADFEDKXBCISFZD31OC5YFQK3GUZ5MAFOWJOA3H4' +
      '&v=20140806';
    /*
    + '&callback=myViewModel.infoDisplay';
    var script = document.createElement('script');
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
    */
    var success = (function() {
      //if the request is 200, I call infoDisplay with the returned content
      var viewModel = myViewModel;
      var tbr = function(content) {
        viewModel.infoDisplay(content);
      };

      return tbr;
    })();
    var failure = (function() {
      //if first you fail try again... and once more upon cloned failure for good measure
      var viewModel = myViewModel;
      var request = venueRequest;
      var i = 0;
      var tbr = function() {
        if (i < 0) {
          request.send();
          i--;
        }
      };

      return tbr;
    })();

    venueRequest.addURL(url);
    venueRequest.addSuccess(success);
    venueRequest.addFailure(failure);
    venueRequest.send();
  }
  //init the mapping object for addresses to venues
  var venues = data.response.venues;
  for (var i = 0; i < venues.length; i++) {
    getVenue(venues[i].id);
  }
}

var myViewModel = {
  querior: document.getElementById('querior'),
  venueList: ko.observableArray(),
  cityQuery: ko.observableArray(),
  addressMarkerMapping: new MapAddressMarker(),
  citySearch: function(data) {
    //given user input this function searches google for cities which match that input in some way
    //and returns them pushing them to the correct observableArray
    var returnedCities = [];
    var city = data.getElementsByClassName('citySelect')[0].value;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
      'address': city
    }, function(results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i].types.includes('locality') && results[i].types.includes('political')) {
          var loc = {
            lat: results[i].geometry.location.lat(),
            lng: results[i].geometry.location.lng()
          };
          returnedCities.push([results[i].formatted_address, loc])
        }
      }
      myViewModel.cityQuery(returnedCities); //throw all the cities which google suggested into the obserbableArray
      //to be displayed to the user
    });
  },
  mapLogic: function(data, e) {
    //removes the city query html from display, adds google map at the place specified by the user by
    //searching my observableArray for the array which contains the correct string and setting the map center
    //to latlng in that same array
    this.querior.style.display = 'none';
    //show the menu
    document.getElementById('map').classList.remove('invis');

    function initMap(city) {
      map = new google.maps.Map(document.getElementById('map'), {
        center: city,
        zoom: 13,
        mapTypeControl: false
      });
      //grab foursquare data
      //create a jsonp
      /*var jsonpTag = document.createElement('script');
       */
      var url = 'https://api.foursquare.com/v2/venues/search' +
        '?client_id=YKHATSNI4PS0K4TQXIXNWD12B4YCUTDLJC3ECIQMJ5QQTBNK' +
        '&client_secret=DAB2LCKMTADFEDKXBCISFZD31OC5YFQK3GUZ5MAFOWJOA3H4' +
        '&v=20130815' +
        '&near=' +
        city.lat + ',' + city.lng +
        '&query=Ice+Cream';
      /*
      + '&callback=myViewModel.foursquareCallback';
      document.getElementsByTagName('head')[0].appendChild(jsonpTag);
      */
      var success = (function() {
        var viewModel = myViewModel;
        var tbr = function(data) {
          viewModel.foursquareCallback(data);
        };

        return tbr;
      })();

      var failure = function() {
        alert("Something went wrong and we can't reach our friends at Foursquare at the moment. Try reloading the page");
      };

      var foursquareRequest = new JsonpRequest();
      foursquareRequest.addURL(url);
      foursquareRequest.addSuccess(success);
      foursquareRequest.addFailure(failure);
      foursquareRequest.send();
    }
    var target = e.target.textContent;
    var cities = this.cityQuery();
    for (var i = 0; i < cities.length; i++) {
      if (cities[i][0] === target) {
        initMap(cities[i][1]);
      }
    }
  },
  infoDisplay: infoDisplay,
  foursquareCallback: foursquareCallback
}
googleCheck.failCheck();
ko.applyBindings(myViewModel);
