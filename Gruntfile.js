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
				root: "./www"
			},
			site: {
				files: {
					"www/index.html": {
						js		: ["js/lib/*.js","js/*.js"],
						css		: "css/*.css",
						title	: "<%= pkg.name %>",
						head	: "head",
						body	: "body"
					} 
				}
			},
		},

  });

  grunt.loadTasks("tasks");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.registerTask("default", ["jshint", "html-generator"]);

};
