# grunt-html-generator

> Grunt task to generate html files.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-html-generator --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-html-generator');
```

## The "html-generator" task

### Overview
In your project's Gruntfile, add a section named `html-generator` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
 "html-generator": {
    target: {
      path: "./html",
      files: {
        "./output.html": "html-main-file"
      }
    },
  },
})
```

The above code create a file named "output.html" with the content of "./html/html-main-file.html" after replacing "{html-other-files}" with respective content. It's recursive, so be careful.