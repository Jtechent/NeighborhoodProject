var jsonpDropoff = (function() {
  //needed this IIFE because jsonp requires use of the global namespace and so I stick all of my handlers in here
  //so that can do that with a little more safety
  var tbr = {};
  var registry = {};

  tbr.create = (function() {
    var i = 0;

    function registerer(value) {
      var key = 'dropoff' + i++;
      registry[key] = value;
      return key;
    }

    return registerer;
  })();

  tbr.read = function(key) {
    return registry[key];
  };

  tbr.delete = function(key) {
    registry[key] = null;
  };

  return tbr;
})();

function JsonpRequest(config) {
  //function which has the capability to fire off jsonp requests as well as do error handling

  //takes a config object requiring fields url, success and optional fail handler
  // if fields in config object not present it can be added at a later date
  if (!config) {
    pseudoConfig = {}; //if no config is given that is alright
  } else {
    pseudoConfig = config;
  }
  var readyToSend = false; //flag which will make premature requests fail without wasting time

  this.internalConfig = {};
  this.twoHundredReturn = false; //flag used to tell if the request was a success
  this.addURL(pseudoConfig.url);
  this.addSuccess(pseudoConfig.success);
  this.addFailure(pseudoConfig.failure);

}

JsonpRequest.prototype.addURL = function(url) {
  if (url) {
    this.internalConfig.url = url;
    if (this.internalConfig.success) {
      readyToSend = true;
    }
  }
};
JsonpRequest.prototype.addSuccess = function(handler) {
  var self = this;
  if (handler) {
    var augmented = (function() {
      //augment the passed in handler to also set a flag saying the request succeeded
      that = self;
      var tbr = function(data) {
        that.twoHundredReturn = true;
        handler(data);
      };
      return tbr;
    })();
    this.internalConfig.success = jsonpDropoff.create(augmented); //I need to have the function in the global space for
    //jsonp to work
    if (this.internalConfig.url) {
      readyToSend = true;
    }
  }
};
JsonpRequest.prototype.addFailure = function(handler) {
  var self = this;
  if (handler) {
    var augmented = (function() {
      //augment handler to call handler where the request failed
      var that = self;
      var tbr = function() {
        if (!that.twoHundredReturn) {
          handler();
        }
      };

      return tbr;
    })();

    this.internalConfig.failure = augmented;
  }
};
JsonpRequest.prototype.send = function(timeout) {
  var offset;
  timeout ? offset = timeout : offset = 6000;
  if (readyToSend) {
    //create script, set src and set time out to be called in the event that the request fails
    var script = document.createElement('script');
    script.async = true;
    script.src = this.internalConfig.url + '&callback=jsonpDropoff.read("' + this.internalConfig.success + '")';
    document.getElementsByTagName('head')[0].appendChild(script);
    this.internalConfig.failure ? window.setTimeout(this.internalConfig.failure, offset) : null;

  } else {
    throw "ERROR: incomplete required fields in jsonp request";
  }
};

function NetworkErrorManager(config) {
  this.action;
  this.conditional;
  if (config) {
    this.action = config.action;
    this.conditional = config.conditional;
  }
}
