# RKGTTR Frontend Setup for HTML5 Banners

This guide will help you through the process of setting up static frontend projects for HTML5 banners. This is a simple framework based on [NodeJS][0], [Yeoman][1], [Bower][2] and [Grunt][3] that automate a lot of tasks such as preprocessing your files and minify them. The framework includes:

* A convenient folder structure.
* A HTML template based on [HTML5 Boilerplate][4].
* An optional set of [Jade][5] templates based on HTML5 Boilerplate to generate your pages.
* Several [LESS][6] files that compile in a single autoprefixed minified CSS files.
* Option to use [SCSS][11], but that bit is a work in progress.
* An image minifier.
* A simple webserver that reloads automatically when you make changes.
* A [Grunt][3] observer that automatically compile your changes on LESS and JavaScript files, and compress banners ZIP packages ready to upload on the Sizmek platform.

For editing code, I suggest that you use [Sublime Text][14] with [Package Control][15] to extends its functionalies. This is the best and most extensible editor at the moment, simple as that.

## Global Configuration

The following needs to be done once.

[Install GIT][16]  

Important for Windows users, you must install msysgit correctly. Be sure to check the option shown below:  
![](http://demo.longtail.com.au/frontend/img/build/mysgit.png)

[Install NodeJs][0]

Open a console (Windows: `Win+R` then type `cmd` then press Enter, Mac: `Command+Space` then type `terminal` then press Enter)

Install Grunt by entering the following command:

    npm install -g grunt-cli

 And press Enter

Install Bower by entering the following command:

    npm install -g bower

 And press Enter

Install Yeoman by entering the following command:

    npm install -g yo

 And press Enter

Install the project generator by entering the following command:

    npm install -g generator-rkgttrbanners

And press Enter

## Project Configuration

The following needs to be done per project.


Create a folder


Move into this folder then `shift + right click` and select "Open command window here", on Mac open a Terminal and move to this folder (`cd \[your-path\]`) or go to `System Preferences \> Keyboard \> Keyboard Shortcuts \> Services` and enable `New Terminal at Folder` and the service will appear by `right click` or `Control + click` on the folder.


In the console that opens, type:

	yo rkgttrbanners

Press Enter and answer the few questions about the project name, description and version. If you want to use the [Jade templating engine][5], answer **yes** to the `Use Jade templating engine` question. I strongly recommend using Jade as it's a very powerful templating engine. Once you've adopted it, standard HTML coding looks like stone age.

You can choose to use [SCSS][11] instead of [LESS][6].

You can choose the ad serving system: Sizmek or DoubleClick Campaign.

You can choose to create a standard ads suite, or an Ad System template.

If you answer **yes** to the `Use Smart Versioning (SVP)` question, what the template does is adding what is needed for the Sizmek Smart Versioning system.

If you answer **yes** to the `Will you embed a custom font?` question, it means that you plan to add your font files as external assets (woff, woff2, ttf, svg, eot) and won't use a service such as Google Webfonts. Use this if there are no other alternative.

Then comes the time for you to add banners in your projects. There are a suite of questions about each banner you want to create:

1. Your banner width, mandatory.
2. Your banner height, mandatory.
3. Your banner specificity, optional. This is a sort of meaningful unique identifier for this particular banner, useful if you have several banners of the same size in your suite. It could be a number, a keyword, whatever.
4. The last question asks you if you want to create another banner. If you answer `yes` then you will go back to the first step in order to create this new banner.

Each banner will then be created following this naming convention:

        WIDTHxHEIGHT_CLIENT_YEAR_PROJECT_SPECIFICITY

For example:

        300x250_lotterywest_2015_MarchSuperdraw_NoSparkle

If for any reason, you want to add another banner afterward, just use the command:

    yo rkgttrbanners --add

It will ask you info about the additional banners. When your done, it will ask you if you really want to overwrite `package.json`, answer `y` (yes).

When all this is done, all your templates files will be under the `src` folder into one folder per banner. You will always work into the `src` folder. Normally you don't have to work within the `build` folder. If you do, you'll get cursed and will suffer great pain.

`launchgrunt` first compiles all your files (js + less, etc.), launches a web server, watches any changes you make to re-compile on the fly, refreshes the server, and generate a ready-to-upload package for each of your banner into the `__ZIP_FILES` folder.

Open [http://localhost:8080/][17] to see this in action.

##Animation

There is no built-in JavaScript animation engine. However, there is a handy JavaScript timeline engine, that works with CSS classes. For example:

###SCSS

    .thing {
      opacity: 0; // initial state
      transition: opacity .3s ease;
      &.step-1 {
        opacity: 1; // first step, fade in transition
      }
      &.step-2 {
        opacity: 0;  // second step, fade out transition
      }
      &.step-3 {
        opacity: .5;  // third step, half fade in transition
      }
    }

###JS

    new Timeline() // create the timeline
      .add('.thing', 0, 'step-1') // add a step at time 0 second
      .add('.thing', 1, 'step-2') // add a step at 1 second
      .add('.thing', '+2', 'step-3', function() { console.log('ha!');}) // add a step 2 seconds after the previous step and call the function in the third arguments
      .play(); // play the animation

The timeline engine has the following methods:

* `add`: add a step to the timeline, it takes 4 arguments:
    - `selector` (String): a valid selector (tag name, class name, id) to select the DOM element you want to animate.
    - `time` (Number or String): if time is a number, then it represents the time in seconds at which the animation will occur relatively to the start time of the timeline; if time is a string such as '+1' or '-.5' then it represents the time in seconds at which the animation will occur relatively to the previous timeline step.
    - `cssClass` (String): the class to add to the DOM element.
    - `cb` (Function)[optional]: a function to call at the given time. This doesn't reset whatever your function did when you reset your timeline by seeking a moment in time that happened before the function call.
* `play`: play the timeline
* `pause`: pause the timeline
* `seek`: jumps to a specific time, takes one argument:
    - `time` (Number): the time in seconds 

##JQuery

For file size reasons, we should not embed [JQuery][8] in our banners. We should use vanilla JavaScript only. As the main purpose of JQuery is to deal with browser compatibility, getting rid of it is not a big deal as HTML5 banners won't display on older browsers. However, the JQuery syntax is somewhat quite handy. It's indeed easier to write:

    $('.my-selector').show();

Than:

    Array.prototype.forEach.call(document.querySelectorAll('.my-selector'), function(el, i) {
      el.style.display = 'block';
    }); 

So the generator includes a custom lightweight subset of JQuery to help you deal with the syntax. Supported methods are:

* `$.each(obj, callback);`
* `$('selector').each(callback);`
* `$('selector').addClass('className');`
* `$('selector').removeClass('className');`
* `$('selector').hasClass('className');`
* `$('selector').css('rule', 'value');` or `$('selector').css({rule: 'value', rule: 'value'});` or `$('selector').css('rule');`
* `$('selector').attr('attributeName', 'value');` or `$('selector').css({attributeName: 'value', attributeName: 'value'});` or `$('selector').attr('attributeName');`
* `$('selector').prop('property', 'value');` or `$('selector').prop('property');`
* `$('selector').data('key', 'value');` or `$('selector').data('key');`
* `$('selector').removeData('key');`
* `$('selector').html('html');` or `$('selector').html();`
* `$('selector').text('text');` or `$('selector').text();`
* `$('selector').hide();`
* `$('selector').show();`
* `$('selector').remove();`
* `$('selector').before(DOM element|JQuery object|'text');`
* `$('selector').after(DOM element|JQuery object|'text');`
* `$('selector').prepend(DOM element|JQuery object|'text');`
* `$('selector').append(DOM element|JQuery object|'text');`
* `$('selector').eq(index);`
* `$('selector').on('eventType', callback);` or `$('selector').on('eventType', 'childSelector', callback);`
* `$('selector').off('eventType');` or `$('selector').off('eventType', 'childSelector');`
* `$('selector').trigger('eventType', data);`

Also, JQuery events such as `click, dblclick, mouseover, mouseout, mousedown,mouseup, mousemove, keydown, keypress, keyup, focus, blur, change, select, error, load, unload, scroll, resize, touchstart, touchend, touchmove'` are natively supported, such as in:

      $('selector').click(function(event){});


##Ad System template creation

The generator allows you to generate a basic boilerplate to create an Ad System template. New files are generated:

* `jade/template.jade` is just like `jade/index.jade` except it doesn't embed the Sizmek API. It generates a `template.html` file that is the one loaded by the Ad System for previewing the ad. You have nothing to do with this particular file.
* `config/config.json` which is the default json file used by an ad. it contains the ad content, its slides, its images, some animation instructions, depending on the nature of your ad.
* `adtemplate.json` that is used by Ad System to generate the forms to fill an ad. This re-use all the data in `config.json` and other generic information.

Also, `js/main.js` has specific content related to the Ad System.

###adtemplate.json

This json file contains a template definition. It contains properties and objects that are common to all templates such as the client name, template name, ad dimensions, default ad files list, weither the ad use Google Webfonts, an optional file blacklist (that contains the name of file type property objects which value you want to exclude from the package), without their extension), and additional fields if the template is for an SVP ad (more on that later). The `config.json` that is loaded by the ad itself depends on what is defined into this file.

####Property object

Template definition happens through property objects. A property object looks like this:

      "property": {
        "label": "[Property label](mandatory)",
        "type": "[text,file,textarea,select,color,radio,h2,subset,number,range](mandatory)",
        "options": "[property options]",
        "default": "[default value, if any]",
        "slide": "[slide to display when changing this property, don't use this field inside a slide object]",
        "inconfig": "[true or false, if false the property won't appear in config.json]"
      }

The `type` property define the type of control that will appear in the Ad System. If the type is `h2` then you must define `inconfig` to `false`, it will display a title in the Ad System. The `subset` type is when you want to nest objects.
The `options` property preset some options for the property, depending on the `type`. For basic types, this property can remain empty. But it should be filled if for the following types:

* `range`: options will be `["[min]", "[max]"]` where `[min]` and `[max]` are the min and max values for the range
* `radio`: options will be `[["true", "Yes"], ["false", "No"]]`
* `select`: options will be for example `[["value", "label"], ["value", "label"], ["value", "label"], ... ]`

####The global object

This object contains default property objects such as the ad name, the alt image, the clickthrough url. You're free to ad any other fields that are generic to the template, and don't relate to a slide.

####The slides array

This array contains slide object that contains property objects. We can have as many slides as needed. Only property object that is mandatory in a slide object is the `duration` property. The generator prefills one of these so you just have to duplicate it on all your slides.


####SVP templates

SVP Ad System templates work in a different way as when we create an ad, we just upload `config.json` and optional additional assets on an existing workspace on Sizmek. It means that you should upload your ad on Sizmek, then grab the `config` folder id, and the `img` folder id, and ad them into `adtemplate.json` as follow:

    "config_folder_id": "3274992",
    "assets_folder_id": "3274995"

###Main.js

The main javascript file contains additional methods when building an Ad System templates. Most of them are used to refresh the ad content, and seeking to moments in the ad timeline. There are two things to keep in mind:

* The `setContentAndStyle` method is used to set the content and css of your ad depending on the dynamic configuration. As this configuration often changes when using the Ad System interface, each time you set some dynamic content or style, don't forget to reset it before.
* If your ad is a SVP ad, the URL of `config/config.json` must be a dynamic SVP variable, that you'll call using `request.open( 'GET', 'config/' + adkit.getSVData( "config" ), true );` for example.

Any bug? [Let me know][18].



[0]: http://nodejs.org/
[1]: http://yeoman.io/
[2]: http://bower.io/
[3]: http://gruntjs.com/
[4]: http://html5boilerplate.com/
[5]: http://jade-lang.com/
[6]: http://lesscss.org/
[7]: http://purecss.io/
[8]: https://jquery.org/
[10]: http://learnboost.github.io/stylus/
[11]: http://sass-lang.com/
[13]: #npm
[14]: http://www.sublimetext.com/2
[15]: https://sublime.wbond.net/
[16]: http://git-scm.com/downloads
[17]: http://localhost:8080/
[18]: mailto:rkgttr@gmail.com

