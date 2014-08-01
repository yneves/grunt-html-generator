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
var path = require('path');

module.exports = function(grunt) {
  
  var _debug = grunt.log.debug;
  
  // - -------------------------------------------------------------------- - //
  // - Stuff

  function isString(something){
    return Object.prototype.toString.call( something ) === '[object String]';
  }
  
  function isArray(something){
    return Object.prototype.toString.call( something ) === '[object Array]';
  }
  
  function isObject(something){
    return Object.prototype.toString.call( something ) === '[object Object]';
  }
  
  function isFile(something){
    if(isString(something)){
      return grunt.file.exists(something);
    }
    else{
      return false;
    }
  }
  
  function entity(content) {
    var map = {
      "º": "&deg;",    "ã": "&atilde;",  "õ": "&otilde;",
      "Ã": "&Atilde;",  "Õ": "&Otilde;",  "â": "&acirc;",
      "ê": "&ecirc;",    "î": "&icirc;",    "ô": "&ocirc;",
      "û": "&ucirc;",    "Â": "&Acirc;",    "Ê": "&Ecirc;",
      "Î": "&Icirc;",    "Ô": "&Ocirc;",    "Û": "&Ucirc;",
      "á": "&aacute;",  "é": "&eacute;",  "í": "&iacute;",
      "ó": "&oacute;",  "ú": "&uacute;",  "Á": "&Aacute;",
      "É": "&Eacute;",  "Í": "&Iacute;",  "Ó": "&Oacute;",
      "Ú": "&Uacute;",  "ç": "&ccedil;",  "Ç": "&Ccedil;",
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
    }
    else if (name === 'script'){
      content += "></"+name+">";
    }
    else {
      content += " />";
    }
    return content;
  }

  function html(params){
    //Create head
    var head = [];

    if (params.title) { //String or Array
      _debug("Head -> title",params.title);
      var title = isString(params.title) ? params.title : params.title.join(" ");
      head.push(tag("title",null,title));
    }
    
    if(params.meta){
      _debug("Head -> META",params.meta);
      params.meta.forEach(function(metaAttributes) {
        head.push(tag("meta",metaAttributes));
      });
    }
    
    if (params.css) { //File or String or Array of Files or Strings
      _debug("Head -> CSS",params.css);
      params.css.forEach(function(href) {
        head.push(tag("link",{
          type: "text/css",
          rel: "stylesheet",
          href: href
        }));
      });
    }

    if (params.js) { //File or String or Array of Files or Strings
      _debug("Head -> JS",params.js);
      params.js.forEach(function(src) {
        head.push(tag("script",{
          type: "text/javascript",
          src: src
        }));
      });
    }

    if (params.head) { //File or String or Array of Files or Strings
      _debug("Head -> head",params.head);
      head = head.concat(params.head);
      _debug("Now Head -> head",params.head);
    }
    
    //Create Body
    var body = [];
    if (params.body) { //File or String or Array of Files or Strings
      _debug("BODY",params.body);
      body = body.concat(params.body);
    }
    
    //Create Doc
    var doc = [];
    if (params.html) {
      _debug("DOC",params.html);
      ///doc.push(recurse(params.html));
    } else {
      doc = [
        "<!DOCTYPE html>\n",
        "<html>\n",
        "<head>\n\t", head.join("\n\t"), "\n</head>\n",
        "<body>\n\t", body.join("\n\t"), "\n</body>\n",
        "</html>"
      ];
    }
    var output = entity(doc.join(""));
    
    if(params.minify===true){ //if minify
      var minifyCfg = {
        removeComments:true, 
        minifyJS:true, 
        minifyCSS:true, 
        collapseWhitespace:true,
        conservativeCollapse:true
      };
      var minify = require('html-minifier').minify;
      output = minify(output,minifyCfg);
    }
    else{ //else beautify
      var beautify_js = require('js-beautify');
      output = beautify_js.html_beautify(output);
    }
    
    return output;
  }
  
  /**
   * Expand file, by converting in an array of strings
   * @param file Object as returned by task.files
   * @param root String root directory where paths refer to
   * @return Array of strings
   */
  function expand(file, root){
    var items = file.orig.src;
    var category = file.dest;
    _debug("Expanding "+category+": ",items,"\n");
    var expanded;
    switch(category){
      case 'meta': //bypass expanding that would break
        expanded = items;
        break;
      case 'head':
      case 'body':
        //expand + retrieve file content
        expanded = grunt.file.expand({cwd:root,nonull:true},items);
        expanded = expanded.map(function(item){
          var filePath = path.join(root,item);
          if(isFile(filePath)){
            return grunt.file.read(filePath,{encoding:'utf8'});
          }
          else{
            _debug("File ",filePath," does not exist");
            return item;
          }
        });
        break;
      default:
        //expand
        expanded = grunt.file.expand({cwd:root,nonull:true},items);
        break;
    }
    
    _debug("Expanded "+category+": ",expanded,"\n");
    return expanded;
  }
  
  // - -------------------------------------------------------------------- - //
  // - Task
  
  grunt.registerMultiTask("html-generator","Grunt task to generate html files.",function() {
    var options = this.options({
      root: ".",
      output: "index.html",
      minify: false,
      meta:[]
    });

    //A fake file object, because file won't accept an array of objects
    var metaFileObject = {
      dest:'meta',
      orig:{
        src:options.meta,
        dest:'meta'
      }
    };
    
    var files = this.files;
    files.push(metaFileObject);
    _debug("OPTIONS",options);
    _debug("FILES",files,"\n\n");
    
    var output =path.join(options.root,options.output);
    var config = {
      minify: options.minify
    };
    
    (function(config){
      var count = files.length;
      files.forEach(function(file) {
        var src = file.orig.src;
        var dest = file.dest;       
        var htmlItems = expand(file, options.root);
        
        if(htmlItems.length === 0){
          htmlItems = src; //it's not an array of real files - should never happen
        }

        config[file.dest]=htmlItems;
        count--;
        if(count === 0){
            grunt.file.write(output,html(config));
            grunt.log.writeln('File "' + output + '" created.');
        }
      });
    })(config);

  });

};