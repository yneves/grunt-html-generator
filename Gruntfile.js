/*
 * grunt-html-generator
 * https://github.com/yneves/grunt-html-generator
 *
 * Copyright (c) 2013 Yuri Neves
 * Licensed under the MIT license.
 */

"use strict";

// - -------------------------------------------------------------------- - //
// - Exports

module.exports = function(grunt) {
 
  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON("package.json"),

    jshint: {
      all: [
        "Gruntfile.js",
        "tasks/*.js"
      ],
      options: {
        jshintrc: ".jshintrc",
      },
    },

    "html-generator": {
      options: {
        root: './www',
        meta: [ //meta go right after title
          {
            charset:"utf-8"
          },
          {
            name:"viewport",
            content:"width=device-width"
          }
        ]
      },
      site: {
        options:{
          output: 'index.html',
          minify: false
        },
        files:{
          js: ['js/lib/*.js','js/*.js'],
          css : "css/*.css",
          title : "<%= pkg.name %>", //shouldn't title be in options?
          head  : ["html/head/*.html"],
          body  : ["html/body/*.html"]
        }
      },
      "site-mini": {
        options:{
          output: 'minified.html',
          minify: true,
          meta: [ //change metas for this config
            {
              charset:"utf-8"
            },
            {
              name:"viewport",
              content:"width=device-width"
            },
            {
              name:"msapplication-tap-highlight",
              content:"no"
            }
          ]
        },
        files:{
          js: ['js/lib/*.js','js/*.js'],
          css : "css/*.css",
          title : "Minified",
          head  : ["html/head/*.html"],
          body  : ["html/body/*.html"]
        }
      }
    }
  });

  grunt.loadTasks("tasks");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.registerTask("default", ["jshint", "html-generator"]);

};
