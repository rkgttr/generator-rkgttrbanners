'use strict';
////////////////////////////////////////////////////////////////////////////////////////////
// IMPORTANT: SIZMEK API QUICK HELP
//
//  Standard or Polite banners: https://platform.mediamind.com/onlinehelp/MediaMind/External/#14535.asp
//
// 1. clickthrough
//      EB.clickthrough(intname, clickURL);
//      parameters:
//          intname (String) The name of the interaction to be tracked.
//              Note: If you are defining the ad's general click interaction, leave this parameter blank or empty to use (EB.Clickthrough).
//          clickURL (optional:String) The clickthrough URL that opens. If no URL is specified, the URL that is defined in the Sizmek
//              MDX platform for the specified interaction is used instead.
//
// 2. getAssetUrl()
//      Returns the URL of a valid asset file. Returns "" if the asset was not located.
//      EB.getAssetUrl('FolderName\\video.webm', 1);
//      parameters:
//          asset (String) File name, or URL of the asset to search for in urlParams, leave blank if you use the second parameter.
//          additional asset number (optional:Integer) The number of the additional asset as it was defined in the
//              Sizmek MDX platform.
//
//  SVP banners: https://platform.mediamind.com/onlinehelp/MediaMind/External/#20654.asp
//
// 1. getSVData()
//     adkit.getSVData("varName");
//      parameters:
//          varName (String) Retrieves the value of a Smart Versioning variable by svKey.
//
//
//////////////////////////////////////////////////////////////////////////////////////////
/**
 *
 * Main Application
 *
 **/

function App_<%= camelname %>() {
  if (App_<%= camelname %>.instance !== undefined) {
    return App_<%= camelname %>.instance;
  } else {
    App_<%= camelname %>.instance = this;
  }
  LTApp.call(this);
  return App_<%= camelname %>.instance;
}
App_<%= camelname %>.prototype = new LTApp();
App_<%= camelname %>.fn = App_<%= camelname %>.prototype;
/**
 *
 * Singleton thing
 *
 **/
App_<%= camelname %>.getInstance = function() {
  if (App_<%= camelname %>.instance === undefined) {
    new App_<%= camelname %>();
  }
  return App_<%= camelname %>.instance;
}

/**
 *
 * Initialize your app, surcharge with whatever needed
 *
 **/
App_<%= camelname %>.fn.init = function() {
  if (!this.INITED) {
    this.INITED = true;
    <% if(isAdSystem) { %>
    this.timelines = [];
    var request = new XMLHttpRequest();
    request.open('GET', 'config/config.json', true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        var resp = request.responseText;
        this.data = JSON.parse(resp);
        this.images = [];
        this.iterate(this.data);
        this.preload(this.images, this.display.bind(this));
      }
    }.bind(this);
    request.send();
    <% } else { %>
    /**
     * Add the images url you want to preload in the empty array on the first parameter
     */
    this.preload([], this.display.bind(this));
    <% } %>
  }
};
/**
 *
 * shows everything, start animating
 *
 **/
App_<%= camelname %>.fn.display = function() {
  $('body').removeClass('loading');
  $('body').addClass('loaded');
  <% if (isAdSystem) { %>
  this.setContentAndStyle();<% } %>
  this.setAnimation();<% if (isAdSystem) { %>
  this.ready();
  <% } %>
};

<% if (isAdSystem) { %>
/**
 * Set the style and content of the items, using the json data
 */
App_<%= camelname %>.fn.setContentAndStyle = function() {

};

<% } %>
/**
 * Create timelines according to the configuration
 */
App_<%= camelname %>.fn.setAnimation = function() {
  <% if (isAdSystem) { %>
  var tl = new Timeline();
  // you can add more timelines, then add them to the object below
  this.timelines = {
    tl: tl
  };
  <% } else { %>
  new Timeline()
    // .add('[selector]', [time], '[cssClass]')
    .play();
  <% } %>
};

<% if (isAdSystem) { %>
/**
 * Play the ad and register events for the ad system
 */
App_<%= camelname %>.fn.ready = function() {
  this.play();
  if (window['EB'] === undefined) {
    window.addEventListener('message', function(m) {
      if (typeof m.data === 'object') {
        if (m.data.json) {
          this.data = JSON.parse(m.data.json);
          this.refresh();
        } else if (m.data.pausetime) {
          this.pause(m.data.pausetime);
        } else if (m.data.preview) {
          this.play();
        }
      }
    }.bind(this));
    window.parent.postMessage('template ready', '*');
  }
}

/**
 * Play the ad
 */
App_<%= camelname %>.fn.play = function() {
  for (var i in this.timelines) {
    this.timelines[i].seek(0);
    this.timelines[i].play();
  }
};

/**
 * Pause the animation to a given time
 * @param  {Number} time Time to reach, in seconds
 */
App_<%= camelname %>.fn.pause = function(time) {
  for (var i in this.timelines) {
    this.timelines[i].pause();
    this.timelines[i].seek(time);
  }
}

/**
 * Refresh the ad style and asset, used by the ad system admin
 */
App_<%= camelname %>.fn.refresh = function() {
  for (var i in this.timelines) {
    this.timelines[i].seek(0);
    this.timelines[i].pause();
  }
  this.setContentAndStyle();
  this.setAnimation();
};

/**
 * Iterate the json object to find images
 * @param  {Object} o parsed json object
 */
App_<%= camelname %>.fn.iterate = function(o) {
  for (var i in o) {
    if (o.hasOwnProperty(i)) {
      if (typeof o[i] === "object") {
        this.iterate(o[i]);
      } else if ((/\.(?=gif|jpg|jpeg|png|svg)/gi).test(o[i])) {
        this.images.push(o[i]);
      }
    }
  }
};
<% } %>
