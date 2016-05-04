module.exports = function( grunt ) {
  var pkg = grunt.file.readJSON( 'package.json' ),
    fs = require( 'fs' ),
    path = require( 'path' ),
    mozjpeg = require('imagemin-mozjpeg'),
    pngquant = require('imagemin-pngquant'),
    banners = fs.readdirSync( 'src/' ).filter( function( file ) {
      return fs.statSync( path.join( 'src/', file ) ).isDirectory() && file.match( /^\d+?x\d+?_/ );
    } ),
    uglifyfiles = {},
    compressfiles = {},
    spriteFiles = {},
    zitifiles = {},
    copyfiles = {},
    folderMount = function folderMount( connect, point ) {
      return connect.static( path.resolve( point ) );
    },
    setupFiles = function() {
      for ( var i = 0; i < banners.length; ++i ) {
        <% if (includeSVP) { %>
        copyfiles[ 'CONFIG' + banners[ i ] ] = {
          expand: true,
          cwd: 'src/svp-config/',
          src: [ 'config.js' ],
          dest: 'build/' + banners[ i ] + '/'
        };
        <% } %>
        zitifiles[ 'build/' + banners[ i ] + '/fonts/font.ttf' ] = [
          'build/' + banners[ i ] + '/index.html',
          'src/fonts/*.ttf'
        ];
        spriteFiles[ 'sprites' + i ] = {
          src: 'src/' + banners[ i ] + '/sprite/*.png',
          cssFormat: <% if (includeSCSS) { %>
          'scss',
          <% } else { %>
          'less',
          <% } %>
          dest: 'src/' + banners[ i ] + '/img/sprite.png',
          imgPath: '../img/sprite.png',
          destCss: 'src/' + banners[ i ] + <% if (includeSCSS) { %>
          '/scss/_sprite.scss'
          <% } else { %>
          '/less/sprite.less'
          <% } %>
        };
        <% if (isAdSystem) { %>
        copyfiles[ 'CONF' + banners[ i ] ] = {
          expand: true,
          cwd: 'src/' + banners[ i ] + '/config/',
          src: [ '*.json' ],
          dest: 'build/' + banners[ i ] + '/config/'
        };
        copyfiles[ 'TEMPLATE' + banners[ i ] ] = {
          expand: true,
          cwd: 'src/' + banners[ i ] + '/',
          src: [ '*.json' ],
          dest: 'build/' + banners[ i ] + '/'
        };
        <% } %>
        <% if (includeFont && isSizmek) { %>
        copyfiles[ 'FONT' + banners[ i ] ] = {
          expand: true,
          cwd: 'src/fonts/',
          src: [ '*.{eot,svg,ttf,woff,woff2}' ],
          dest: 'build/' + banners[ i ] + '/fonts/'
        };
        <% } %>
        uglifyfiles[ 'build/' + banners[ i ] + '/js/global.min.js' ] = [ 'src/' + banners[ i ] + '/js/plugins.js', 'src/' + banners[ i ] + '/js/main.js' ];
        compressfiles[ 'Z' + banners[ i ] ] = {
          options: {
            archive: '__ZIP_FILES/' + banners[ i ] + '.zip'
          },
          files: [ {
            expand: true,
            cwd: 'build/' + banners[ i ] + '/',
            src: [ '**', '!**/Thumbs.db', '!**/template.html', '!**/adtemplate.json', '!**/css/**', '!**/js/**'
              <% if (isDoubleClick) { %>, '!**/fonts/**'
              <% } %>
            ],
            dest: ''
          } ]
        };
      }
    };
  setupFiles();
  // Project configuration.
  grunt.initConfig( {
    pkg: pkg,
    banner: '/*! <%%= pkg.name %> - v<%%= pkg.version %> - <%%= grunt.template.today("yyyy-mm-dd") %>\nAuthor: <%%= pkg.author.name %> - <%%= pkg.author.email %> */\n',
    connect: {
      server: {
        options: {
          port: 8080,
          base: 'build/',
          directory: '',
          hostname: '*',
          livereload: true,
          middleware: function( connect ) {
            return [
              require( 'connect-livereload' )(),
              folderMount( connect, 'build' ),
              require( 'serve-index' )( 'build', {
                'icons': true
              } )
            ];
          }
        }
      }
    },
    <% if (includeSCSS) { %>
    // process + minify SCSS into CSS
    sass: {
      files: {
        expand: true,
        cwd: 'src/',
        src: [ '**/scss/main.scss' ],
        rename: function( base, src ) {
          return 'src/' + src.replace( 'scss/', 'css/' ).replace( 'main.scss', 'styles.css' );
        }
      }
    },
    <%  } else  { %>
    // process + minify LESS into CSS
    less: {
      files: {
        expand: true,
        cwd: 'src/',
        src: [ '**/less/main.less' ],
        rename: function( base, src ) {
          return 'src/' + src.replace( 'less/', 'css/' ).replace( 'main.less', 'styles.css' );
        }
      }
    },
    <%  } %>
    // combine mediaqueries
    cmq: {
      multiple_files: {
        expand: true,
        cwd: 'src/',
        dest: 'src/',
        src: '**/css/*.css'
      }
    },
    // auto browserprefix for CSS
    autoprefixer: {
      options: {
        browsers: [ 'last 2 version', 'ie 9' ]
      },
      multiple_files: {
        expand: true,
        cwd: 'src/',
        dest: 'src/',
        src: '**/css/*.css'
      }
    },
    // minify CSS
    csso: {
      files: {
        expand: true,
        cwd: 'src/',
        src: [ '**/css/styles.css' ],
        dest: 'build/',
        ext: '.min.css',
        extDot: 'first'
      }
    },
    // minify and concat JS
    uglify: {
      site: {
        options: {
          mangle: true,
          beautify: false
        },
        files: uglifyfiles
      }
    },
    // process jade
    jade: {
      options: {
        pretty: false
      },
      files: {
        expand: true,
        cwd: 'src/',
        src: [ '**/jade/*.jade' ],
        rename: function( base, src ) {
          return 'build/' + src.replace( 'jade/', '' ).replace( '.jade', '.html' );
        }
      }
    },
    <% if ((includeSVP || includeFont || isAdSystem)) { %>
    // copy config.js if SVP, fonts if custom fonts
    copy: copyfiles,
    <%  } %>
    // optimize images
    imagemin: {
      imgs: {
        options: {
          svgoPlugins: [ {
            removeUselessStrokeAndFill: true
          }, {
            removeDoctype: true
          }, {
            removeComments: true
          }, {
            removeEditorsNSData: true
          }, {
            convertColors: true
          }, {
            convertStyleToAttrs: false
          }, {
            cleanupIDs: false
          }, {
            convertShapeToPath: true
          }, {
            cleanupEnableBackground: true
          }, {
            cleanupNumericValues: true
          }, {
            collapseGroups: true
          }, {
            convertPathData: true
          }, {
            removeUselessStrokeAndFill: true
          } ],
          use: [ mozjpeg(), pngquant( {
            quality: '20-80',
            speed: 1
          } ) ]
        },
        files: [ {
          expand: true,
          cwd: 'src/',
          src: [ '**/img/**/*.{png,jpg,gif,svg}' ],
          dest: 'build/'
        } ]
      },
      alts: {
        options: {
          use: [ mozjpeg(), pngquant( {
            quality: '20-80',
            speed: 1
          } ) ]
        },
        files: [ {
          expand: true,
          cwd: 'src/',
          src: [ '**/alt/**/*.{png,jpg,gif}' ],
          rename: function( base, src ) {
            var t = src.split( '/' ),
              adname = t[ 0 ],
              altname = t[ t.length - 1 ].split( '.' )[ 0 ];
            <% if (!isDoubleClick) { %>
            return 'build/' + src.replace( 'alt/', '' ).replace( altname, adname );
            <% } else { %>
            return '__ZIP_FILES/' + src.replace( adname + '/alt/', '' ).replace( altname, adname );
            <% } %>
          }
        }]
      }
    },
    // grunt-contrib-compress
    compress: compressfiles,
    <% if (isDoubleClick && !isAdSystem) { %>
    sprite: spriteFiles,
    ziti: {
      index: {
        options: {
          html: {
            pattern: '\\.html?$',
            classes: [],
            attributes: [],
            // if your html contains elements that are not here, add them
            elements: [ 'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'a', 'article', 'section', 'br' ],
            comments: []
          },
          font: {
            pattern: '\\.ttf$'
          },
          subset: true,
          optimize: true,
          convert: true,
          deleteCharsFile: true
        },
        // please add your font name just in case
        files: zitifiles
      }
    },
    // embed url in css
    imageEmbed: {
      files: {
        expand: true,
        cwd: 'build/',
        src: '**/css/styles.min.css',
        dest: 'build/',

      },
      options: {
        maxImageSize: 0,
        deleteAfterEncoding: false,
        regexInclude: /\.(woff)/gi,
        regexExclude: /\.(jpg|png|svg|gif)/gi,
        preEncodeCallback: function( filename ) {
          return true;
        }
      }
    },
    <% } %>

    inline: {
      dist: {
        src: 'build/**/index.html'
      }
    },
    // watch for changes in files
    watch: {
      // watch for change in grunt file then reload if necessary
      configFiles: {
        files: [ 'Gruntfile.js' ],
        tasks: [ 'css', 'uglify', 'images', <% if ((includeSVP || includeFont || isAdSystem)) { %>
          'copy', <% } %>
          'postCompile'
        ],
        options: {
          reload: true
        }
      },
      // watch for changes in CSS
      styles: {
        files: [ <% if (includeSCSS) { %>
          "**/*.scss", <% } else { %>
          "**/*.less"
          <% } %>
        ],
        tasks: [ 'css', 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      },
      // watch for changes in script
      scripts: {
        files: [ 'src/**/js/**/*.js' ],
        tasks: [ 'newer:uglify', 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      },
      // watch for updates in images
      images: {
        files: [ 'src/**/*.{png,jpg,gif,svg}' ],
        tasks: [ 'images', 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      },
      <% if (includeFont) { %>
      // watch for updates in fonts
      fonts: {
        files: 'src/fonts/**/*.{ttf,eot,woff,woff2,svg}',
        tasks: [ 'copy', 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      },
      <% } %>
      <% if (isAdSystem) { %>
      // watch for updates in config.json
      json: {
        files: 'src/**/*.json',
        tasks: [ 'copy', 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      },
      <% } %>
      <% if (includeSVP) { %>
      // watch for updates in config.js
      svpjs: {
        files: [ <% if (includeSVP) { %>
          'src/svp-config/config.js'
          <% }%>
        ],
        tasks: [ 'copy', 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      },
      <% } %>
      // watch for updates in jades
      jades: {
        files: [ "src/**/*.jade" ],
        tasks: [ 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      }
      <% if (isDoubleClick && !isAdSystem) { %>,

      sprites: {
        files: [ "src/**/sprite/*.png" ],
        tasks: [ 'images', 'css', 'postCompile' ],
        options: {
          livereload: true,
          event: [ 'added', 'deleted', 'changed' ]
        }
      }
      <% } %>
    }
  } );


  grunt.loadNpmTasks( 'grunt-contrib-uglify' );
  <% if (includeSCSS) { %>
  grunt.loadNpmTasks( 'grunt-sass' );
  <% } else { %>
  grunt.loadNpmTasks( 'grunt-contrib-less' );
  <% } %>
  grunt.loadNpmTasks( 'grunt-contrib-imagemin' );
  grunt.loadNpmTasks( 'grunt-contrib-watch' );
  grunt.loadNpmTasks( 'grunt-combine-media-queries' );
  grunt.loadNpmTasks( 'grunt-autoprefixer' );
  grunt.loadNpmTasks( 'grunt-csso' );
  grunt.loadNpmTasks( 'grunt-contrib-connect' );
  grunt.loadNpmTasks( 'grunt-newer' );
  grunt.loadNpmTasks( 'grunt-contrib-jade' );
  <% if ((isAdSystem || includeSVP || includeFont )) { %>
  grunt.loadNpmTasks( 'grunt-contrib-copy' );
  <% } %>
  grunt.loadNpmTasks( 'grunt-contrib-compress' );
  <% if (isDoubleClick) { %>
  grunt.loadNpmTasks( 'grunt-spritesmith' );
  grunt.loadNpmTasks( 'grunt-ziti' );
  grunt.loadNpmTasks( 'grunt-image-embed' );
  <% } %>
  grunt.loadNpmTasks( 'grunt-inline' );

  grunt.registerTask( 'images', [
    <% if (isDoubleClick) { %>
    'sprite', <% } %>
    'newer:imagemin'
  ] );

  grunt.registerTask( 'css', [
    <% if (includeSCSS) { %>
    'sass', <% } else { %>
    'less', <% } %>
    'cmq',
    'autoprefixer',
    'csso'
  ] );

  grunt.registerTask( 'postCompile', [
    'jade',
    <% if (isDoubleClick && !isAdSystem) { %>
    'ziti',
    'imageEmbed', <% } %>
    'inline',
    'compress'
  ] );

  // Default task(s).
  grunt.registerTask( 'default', [
    'images',
    'css',
    <% if ((isAdSystem || includeSVP || includeFont )) { %>
    'copy', <% } %>
    'uglify',
    'postCompile',
    'connect',
    'watch'
  ] );
};
