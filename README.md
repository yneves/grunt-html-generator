# grunt-html-generator

> Grunt task to generate html files.

## Getting Started
This plugin requires Grunt `~0.4.5`

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
    options: {
      root: ".",
      output: "index.html",
      minify: false,
      meta:[{
        charset="utf-8"
      }]
    },
    target: {
      files: {
        "./output-file.html": {
          js: [ "js/lib/*.js", "js/*.js" ],
          css: "css/css/*.css",
          title: "<% pkg.name %>",
          head  : ["html/head/*.html"],
          body  : ["html/body/*.html"]
        },
      },
    },
  },
})
```

The above code create a html document named "output-file.html" with the content bellow.

```html
<!DOCTYPE html>
<html>

<head>
    <title>grunt-html-generator</title>
    <meta charset="utf-8" />
    <link type="text/css" rel="stylesheet" href="css/a.css" />
    <link type="text/css" rel="stylesheet" href="css/b.css" />
    <link type="text/css" rel="stylesheet" href="css/c.css" />
    <script type="text/javascript" src="js/lib/a.js"></script>
    <script type="text/javascript" src="js/lib/b.js"></script>
    <script type="text/javascript" src="js/lib/c.js"></script>
    <script type="text/javascript" src="js/a.js"></script>
    <script type="text/javascript" src="js/b.js"></script>
    <script type="text/javascript" src="js/c.js"></script>
    <!-- ./www/html/head.html -->
    <style>
        html {
            font-family: Arial, Verdana;
            font-size: 16px;
        }
        body {
            color: lightgray;
            background-color: black;
        }
    </style>
    <script>
        console.log("Awesome");
    </script>
</head>

<body>
    <h1>./www/html/body-1.html</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
        dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
</body>

</html>
```