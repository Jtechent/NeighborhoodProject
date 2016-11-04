function hamburgClick() {
  if (controls.textQuerior) {
    controls.textQuerior.dispatchClick();
  }
}

var controls = function() {
  //sets up the opening and closing feature of my side menu.
  var tbr = {};

  //textQuerior setup
  var textQuerior = document.getElementById('textQuerior'); //side bar menu/hamburger icon
  var children = textQuerior.getElementsByTagName('div');
  var content = children[0];
  var textBox = document.getElementById('textQueriorInput');
  var hamburger = children[1];
  var offset = 0;
  var toggled = false;
  var stayOpen = false;

  function setupTextQuerior(setup) {
    //I know this is a write read but I want to do it
    //calling this the first time sets everything up,
    //calling it subsequent times will call the hamburgHandle function
    textQuerior.classList.remove('invis');
    offset = textQuerior.clientWidth - hamburger.clientWidth;
    textQuerior.style.left = (0 - offset) + 'px';


    //setup handlers
    var hamburgHandle = (function hamburgerClick() {
      var open = function() {
        return 'translateX(' + offset + 'px)';
      }
      var close = 'translateX(0)';
      var menu = textQuerior;
      var tbr = function(noChange) {
        if (!noChange) {
          toggled = !toggled;
        }
        if (stayOpen) {
          toggled = true;
        }
        toggled ? menu.style.transform = open() : menu.style.transform = close;
      };
      return tbr;
    })();

    if (setup) {
      hamburgHandle(true);
    }
    return setup ? null : hamburgHandle;
  }


  var textQueriorControls = {};
  textQueriorControls.setup = function() {
    setupTextQuerior(true)
  };
  textQueriorControls.dispatchClick = setupTextQuerior();
  tbr.textQuerior = textQueriorControls;
  //textQuerior setup ends

  //got the intel on how to use this from sitepoint's article on how to use media queries in Javascript
  //https://www.sitepoint.com/javascript-media-queries/
  var mq = window.matchMedia('(min-width: 950px)');
  mqHandler = function(mq) {
    if (mq.matches) {
      stayOpen = true;
      document.getElementsByClassName('iconic')[0].click();
    } else {
      stayOpen = false;
    };
  }
  mq.addListener(mqHandler);
  mqHandler(mq);
  //media query ends


  return tbr;

};
