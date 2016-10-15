var myViewModel = {
  querior: document.getElementById('querior'),
  cityQuery: ko.observableArray([]),
  citySearch: function(data) {
    var returnedCities = [];
    var city = data.getElementsByClassName('citySelect')[0].value;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': city}, function(results) {
      for (var i = 0; i < results.length; i++) {
        if (results[i].types.includes('locality') && results[i].types.includes('political')) {
          var loc = {lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng()};
          returnedCities.push([results[i].formatted_address, loc])
        }
      }
      console.log(returnedCities);
    myViewModel.cityQuery(returnedCities);
    });
  },
  mapLogic: function (data, e) {
    //starter code
    //this is going to be the sneakly little guy who actually inits maps
    //find the appropriate value in the returnedCities appropriat
    this.querior.classList.add('invis');
    document.getElementById('map').classList.remove('invis');
    function initMap(city) {
      console.log(city);
      var map = new google.maps.Map(document.getElementById('map'),{
        center: city,
        zoom: 13
      });
    }
    var target = e.target.textContent;
    var cities = this.cityQuery();
    for (var i = 0; i < cities.length; i++) {
      if (cities[i][0] === target) {
        initMap(cities[i][1]);
      }
    }
  }
}
ko.applyBindings(myViewModel);
