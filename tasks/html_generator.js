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

	// - -------------------------------------------------------------------- - //
	// - Stuff

	var path = {};

	function template(content) {
		if (content.indexOf("<%") > -1) {
			return grunt.template.process(content);
		} else {
			return content;
		}
	}

	function replace() {

		var args = arguments,
			file = path.root+"/"+path.html+"/"+args[0]+".html",
			content = grunt.file.exists(file) 
				? grunt.file.read(file,"utf8") 
				: template(args[0]);

		if (args.length === 3) {

			content = content.replace(
				new RegExp("{"+args[1]+"}","g"),
				args[2]
			);

		} else if (args.length === 2) {

			if (typeof args[1] === "function") {
				content = content.replace(/{[a-z\-]+}/g,function(name) {
					name = name.replace(/^{|}$/g,"");
					return args[1].apply(this,[name]);
				});

			} else if (typeof args[1] === "object") {
				content = content.replace(/{[a-z\-]+}/g,function(name) {
					name = name.replace(/^{|}$/g,"");
					return args[1][name] || "";
				});

			}

		}

		return content;
	}

	function recurse(config) {
		var parts = [];
		if (typeof config === "string") {
			parts.push( replace(config,recurse) );
		} else if (config instanceof Array) {
			for (var c = 0; c < config.length; c++) {
				parts.push( recurse(config[c]) );
			}
		} else if (typeof config === "object") {
			for (var part in config) {
				parts.push( replace(part,config[part]) );
			}
		}
		return parts.join("");
	}

	function entity(content) {
		var map = {
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
		for (var key in map) {
			content = content.replace(new RegExp(key,"g"),map[key]);
		}
		return content;
	}

	function tag(name,props,value) {
		var content = "<"+name;
		if (props) {
			for (var prop in props) {
				content += " "+prop+"=\""+props[prop]+"\"";
			}
		}
		if (value) {
			content += ">"+value+"</"+name+">";
		} else {
			content += " />";
		}
		return content;
	}

	function files(params,type) {
		var list = grunt.file.expand({ cwd: path.root+"/"+path[type] }, params[type]);
		for (var l = 0; l < list.length; l++) {
			list[l] = path[type]+"/"+list[l];
		}
		return list;
	}

	function html(params) {

		var head = [];

		if (params.title) {
			head.push(tag("title",null,recurse(params.title)));
		}

		if (params.head) {
			head.push(recurse(params.head));
		}

		if (params.css) {
			files(params,"css").forEach(function(href) {
				head.push(tag("link",{
					type: "text/css",
					rel: "stylesheet",
					href: href
				}));
			});
		}

		if (params.js) {
			files(params,"js").forEach(function(src) {
				head.push(tag("script",{
					type: "text/javascript",
					src: src
				}));
			});
		}

		var body = [];
		if (params.body) {
			body.push(recurse(params.body));
		}

		var doc = [];
		if (params.html) {
			doc.push(recurse(params.html));
		} else {
			doc = [
				"<!DOCTYPE html>",
				"<html>",
					"<head>", "\t"+head.join("\n\t"), "</head>",
					"<body>", "\t"+body.join("\n\t"), "</body>",
				"</html>"
			];
		}

		return entity(doc.join("\n"));
	}

	// - -------------------------------------------------------------------- - //
	// - Task

	grunt.registerMultiTask("html-generator","Grunt task to generate html files.",function() {

		var options = this.options({
			root: ".",
			html: "html",
			js: "js",
			css: "css"
		});

		path = options;

		var files = this.data.files;
		for (var file in files) {
			grunt.file.write(file,html(files[file]));
			grunt.log.writeln('File "' + file + '" created.');
		}

	});

};