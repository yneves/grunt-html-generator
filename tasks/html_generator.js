/*
 * grunt-html-generator
 * https://github.com/yneves/grunt-html-generator
 *
 * Copyright (c) 2013 Yuri Neves
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

	grunt.registerMultiTask('html-generator', 'Grunt task to generate html files.', function() {

		var path = this.data.path,
			files = this.data.files;

		function makeHTML(config) {
			var parts = [];
			if (typeof config == "string") {
				var file = path+"/"+config+".html";
				if (grunt.file.exists(file)) {
					var content = grunt.file.read(file,"utf8");
					content = content.replace(/{[a-z\-]+}/g,function(part) {
						part = part.replace(/^{|}$/g,"");
						return makeHTML(part);
					});
					parts.push(content);
				}
			} else if (typeof config == "object") {
				for (var part in config) {
					var file = path+"/"+part+".html";
					if (grunt.file.exists(file)) {
						var content = grunt.file.read(file,"utf8");
						var macros = config[part];
						if (typeof macros == "object") {
							for (var macro in macros) {
								content = content.replace(
									new RegExp("{"+macro+"}","g"),
									makeHTML(macros[macro])
								);
							}
						}
						parts.push(content);
					}
				}
			}
			var content = parts.join("");
			var entity = {
				"º": "&deg;",		"ã": "&atilde;",	"õ": "&otilde;",
				"Ã": "&Atilde;",	"Õ": "&Otilde;",	"â": "&acirc;",
				"ê": "&ecirc;",		"î": "&icirc;",		"ô": "&ocirc;",
				"û": "&ucirc;",		"Â": "&Acirc;",		"Ê": "&Ecirc;",
				"Î": "&Icirc;",		"Ô": "&Ocirc;",		"Û": "&Ucirc;",
				"á": "&aacute;",	"é": "&eacute;",	"í": "&iacute;",
				"ó": "&oacute;",	"ú": "&uacute;",	"Á": "&Aacute;",
				"É": "&Eacute;",	"Í": "&Iacute;",	"Ó": "&Oacute;",
				"Ú": "&Uacute;",	"ç": "&ccedil;",	"Ç": "&Ccedil;",
			};
			for (var key in entity) {
				content = content.replace(new RegExp(key,"g"),entity[key]);
			}
			return content;
		}

		for (var file in files) {
			grunt.file.write(file,makeHTML(files[file]));
			grunt.log.writeln('File "' + file + '" created.');
		}

	});

};