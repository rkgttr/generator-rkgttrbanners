'use strict';
var util = require( 'util' );
var path = require( 'path' );
var yeoman = require( 'yeoman-generator' );
var yosay = require( 'yosay' );
var chalk = require( 'chalk' );
var pkgName = require( 'pkg-name' );
var multiline = require( 'multiline' );
var compareVersion = require( 'compare-version' );

module.exports = yeoman.generators.Base.extend( {
  constructor: function () {
    yeoman.generators.Base.apply( this, arguments );
    this.option( 'add' );
  },
  init: function () {
    this.pkg = require( '../package.json' );

    this.on( 'end', function () {
      if ( !this.options[ 'skip-install' ] && !this.options.add ) {
        this.installDependencies();
      }
    } );
  },

  askFor: function () {
    var done = this.async();
    this.banners = [];
    this.currentYear = ( new Date() ).getFullYear();
    if ( !this.options.add ) {
      // Have Yeoman greet the user.
      this.log( yosay( 'Welcome to the marvelous RKGTTR HTML5 Banners generator!' ) );

      var prompts = [ {
        name: 'name',
        message: 'Project Name',
        default: this.appname
      }, {
        name: 'title',
        default: 'Awesome New Banners'
      }, {
        name: 'description',
        default: 'The best banners ever.'
      }, {
        name: 'version',
        default: '0.1.0'
      }, {
        name: 'author_name',
        store: true
      }, {
        name: 'author_email',
        store: true
      }, {
        name: 'client',
        message: 'Client Name',
        default: 'Longtail'
      }, {
        type: 'checkbox',
        name: 'features',
        message: 'What more would you like?',
        choices: [ {
            name: 'Use SCSS (default is LESS)',
            value: 'includeSCSS',
            checked: false
          }, {
            name: 'Will you embed a custom font?',
            value: 'includeFont',
            checked: false
          }, {
            name: 'Will this be an Ad System template?',
            value: 'isAdSystem',
            checked: false
          }
        ]
      }, {
        type: 'list',
        name: 'system',
        message: 'Which ad serving platform will you use?',
        choices: [ 'Sizmek', 'DoubleClick' ]
      }, {
        type: 'checkbox',
        name: 'sizmekOptions',
        message: 'Choose your option for a Sizmek ad',
        choices: [ {
          name: 'Use Smart Versioning (SVP)',
          value: 'includeSVP',
          checked: false
        } ],
        when: function(answers) {
          return answers.system === 'Sizmek';
        }
      } ];

      var nameToMessage = function ( name ) {
        return name.split( '_' ).map(
          function ( x ) {
            return this._.capitalize( x );
          }.bind( this )
        ).join( ' ' ) + ':';
      }.bind( this );

      // Generate prompt messages if only the name is defined.
      prompts.map( function ( entry ) {
        if ( entry.message === undefined ) {
          entry.message = nameToMessage( entry.name );
        }
        return entry;
      }.bind( this ) );
      this.prompt( prompts, function ( props ) {
        var features = props.features;
        var sizmekOptions = props.sizmekOptions || [];

        function hasFeature( feat ) {
          return features.indexOf( feat ) !== -1;
        }
        function hasSizmekOption( opt ) {
          return sizmekOptions.indexOf( opt ) !== -1;
        }
        this.slugname = this._.slugify( props.name );
        this.camelname = this._.camelize( this.slugname );
        this.slugclient = this._.slugify( props.client );
        this.camelclient = this._.camelize( this.slugclient );
        this.isDoubleClick = props.system.toLowerCase() === 'doubleclick';
        this.isSizmek = props.system.toLowerCase() !== 'doubleclick';
        this.includeSCSS = hasFeature( 'includeSCSS' );
        this.includeSVP = hasSizmekOption( 'includeSVP' );
        this.isAdSystem = hasFeature( 'isAdSystem' );
        this.includeFont = hasFeature( 'includeFont' );
        this.name = props.name;
        this.title = props.title;
        this.description = props.description;
        this.version = props.version;
        this.author_name = props.author_name;
        this.author_email = props.author_email;
        console.log( chalk.bold.yellow( 'Now we will start creating banners! Check your deliverables list.' ) );
        done();
      }.bind( this ) );
    }
    if ( this.options.add ) {
      done();
    }
  },
  askForBanner: function () {
    var done = this.async();
    if ( this.options.add ) {
      var path = this.destinationRoot() + '/package.json';
      var jsonstr = this.read( path );
      this.json = JSON.parse( jsonstr );
      this.camelclient = this.json.client;
      this.includeSCSS = this.json.scss === 'true';
      this.includeSVP = this.json.svp === 'true';
      this.isAdSystem = this.json.adsys === 'true';
      this.isDoubleClick = this.json.doubleclick === 'true';
      this.isSizmek = this.json.sizmek === 'true';
      this.includeFont = this.json.font === 'true';
      this.camelname = this.json.project;
    }
    var blist = [ {
      name: 'width',
      message: 'Banner Width',
      default: '300'
    }, {
      name: 'height',
      message: 'Banner Height',
      default: '250'
    }, {
      name: 'specificity',
      message: 'Banner Specificity (i.e keyword to describe the banner specificity)',
      default: ''
    }, {
      type: 'confirm',
      name: 'end',
      message: 'Add another banner?',
      default: true
    } ];
    this.prompt( blist, function ( props ) {
      var camel = ''
      if ( props.specificity.length > 0 ) {
        var slug = this._.slugify( props.specificity );
        camel = '_' + this._.camelize( slug );
      }
      this.banners.push( props.width + 'x' + props.height + '_' + this.camelclient + '_' + this.currentYear + '_' + this.camelname + camel );
      if ( props.end ) {
        this.askForBanner();
      } else {
        done();
      }
    }.bind( this ) );
  },

  app: function () {

    var ignores = [
      '.git',
      '.svn',
      '_package.json',
      '_bower.json',
      'Gruntfile.js',
      'gitignore',
      'editorconfig',
      'jshintrc',
      'index.jade',
      'template.jade',
      'content.jade',
      'main.less',
      'main.scss',
      'config.js',
      'config.json',
      'adtemplate.json',
      'launchgrunt.command',
      'launchgrunt.bat',
      'main.js'
    ];
    var xindex, usindex, width, height, bname;
    for ( var i = 0; i < this.banners.length; ++i ) {
      xindex = this.banners[ i ].indexOf( 'x' );
      usindex = this.banners[ i ].indexOf( '_' );
      width = this.banners[ i ].substr( 0, xindex );
      height = this.banners[ i ].substr( xindex + 1, usindex - xindex - 1 );
      bname = this.banners[ i ];
      this.mkdir( 'src/' + this.banners[ i ] );
      this.mkdir( 'build/' + this.banners[ i ] );
      this.mkdir( 'build/' + this.banners[ i ] + '/img' );
      if ( this.includeFont ) {
        this.mkdir( 'build/' + this.banners[ i ] + '/fonts' );
        if ( !this.options.add ) {
          this.mkdir( 'src/fonts' );
        }
      }
      this.mkdir( 'build/' + this.banners[ i ] + '/css' );
      this.mkdir( 'build/' + this.banners[ i ] + '/js' );
      this.mkdir( 'src/' + this.banners[ i ] + '/img' );
      if ( this.isDoubleClick ) {
        this.directory( 'sprite', 'src/' + this.banners[ i ] + '/sprite' );
      }
      if ( this.includeSCSS ) {
        this.directory( 'scss', 'src/' + this.banners[ i ] + '/scss' );
        this.template( 'main.scss', 'src/' + this.banners[ i ] + '/scss/main.scss', {
          width: width,
          height: height,
          isDoubleClick: this.isDoubleClick
        } );
      } else {
        this.directory( 'less', 'src/' + this.banners[ i ] + '/less' );
        this.template( 'main.less', 'src/' + this.banners[ i ] + '/less/main.less', {
          width: width,
          height: height,
          isDoubleClick: this.isDoubleClick
        } );
      }
      this.directory( 'css', 'src/' + this.banners[ i ] + '/css' );
      this.directory( 'js', 'src/' + this.banners[ i ] + '/js' );
      this.directory( 'alt', 'src/' + this.banners[ i ] + '/alt' );
      this.directory( 'jade', 'src/' + this.banners[ i ] + '/jade' );
      this.template( 'index.jade', 'src/' + this.banners[ i ] + '/jade/index.jade' );
      this.template( 'content.jade', 'src/' + this.banners[ i ] + '/jade/includes/content.jade' );
      if ( this.isAdSystem ) {
        this.template( 'template.jade', 'src/' + this.banners[ i ] + '/jade/template.jade' );
        this.template( 'config.json', 'src/' + this.banners[ i ] + '/config/config.json' );
        this.template( 'adtemplate.json', 'src/' + this.banners[ i ] + '/adtemplate.json', {
          width: width,
          height: height,
          bname: bname,
          camelclient: this.camelclient,
          slugclient: this.slugclient
        } );
      }
      if ( this.includeSVP && !this.options.add ) {
        this.mkdir( 'src/svp-config' );
        this.template( 'config.js', 'src/svp-config/config.js' );
      }
      this.template( 'main.js', 'src/' + this.banners[ i ] + '/js/main.js' );
      this.expandFiles( '*', {
        cwd: this.sourceRoot(),
        dot: true
      } ).forEach( function ( el ) {
        if ( ignores.indexOf( el ) === -1 ) {
          this.copy( el, 'src/' + this.banners[ i ] + '/' + el );
        }
      }, this );
    }
    if ( !this.options.add ) {
      this.mkdir( '__ZIP_FILES' );
      this.copy( '_bower.json', 'bower.json' );
      this.copy( 'launchgrunt.command' );
      this.copy( 'launchgrunt.bat' );
      this.template( '_package.json', 'package.json' );
    }
  },

  projectfiles: function () {
    if ( !this.options.add ) {
      this.copy( 'editorconfig', '.editorconfig' );
      this.copy( 'jshintrc', '.jshintrc' );
      this.copy( 'gitignore', '.gitignore' );
      this.template( 'Gruntfile.js' );
    }
  }
} );
