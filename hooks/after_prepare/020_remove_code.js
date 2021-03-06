#!/usr/bin/env node
"use strict";
var gulp = require('gulp');
var path = require("path");
var removeCode = require('gulp-remove-code');
var removeHtml = require('gulp-html-remove');
var es = require('event-stream');
var ngAnnotate = require('gulp-ng-annotate');
var htmlmin = require('gulp-htmlmin');

var rootdir = process.argv[2];

if (rootdir) {

  // go through each of the platform directories that have been prepared
  var platforms = (process.env.CORDOVA_PLATFORMS ? process.env.CORDOVA_PLATFORMS.split(',') : []);

  for(var x=0; x<platforms.length; x++) {

    var platform = platforms[x].trim().toLowerCase();

    var wwwPath;
    if(platform == 'android') {
      wwwPath = path.join(rootdir, 'platforms', platform, 'assets', 'www');
    } else {
      wwwPath = path.join(rootdir, 'platforms', platform, 'www');
    }

    var pluginPath = path.join(wwwPath, 'plugins') + '/es';

    // Log
    //console.log('['+process.mainModule.filename+'] Removing code for platform '+platform+'\n');

    // Compute options {device-<platform>: true}
    var platformRemoveCodeOptions = {};
    platformRemoveCodeOptions[platform] = true; // = {<platform>: true}

    var htmlminOptions = {removeComments: true, collapseWhitespace: true};

    // Removing unused code for device...
    es.concat(
      // Remove unused HTML tags
      gulp.src(path.join(wwwPath, 'templates', '**', '*.html'))
        .pipe(removeCode({device: true}))
        .pipe(removeCode(platformRemoveCodeOptions))
        .pipe(removeHtml('.hidden-xs.hidden-sm'))
        .pipe(removeHtml('.hidden-device'))
        .pipe(removeHtml('[remove-if][remove-if="device"]'))
        .pipe(htmlmin(htmlminOptions))
        .pipe(gulp.dest(wwwPath + '/templates')),

      gulp.src(path.join(pluginPath, '**', '*.html'))
        .pipe(removeCode({device: true}))
        .pipe(removeCode(platformRemoveCodeOptions))
        .pipe(removeHtml('.hidden-xs.hidden-sm'))
        .pipe(removeHtml('.hidden-device'))
        .pipe(removeHtml('[remove-if][remove-if="device"]'))
        .pipe(htmlmin(htmlminOptions))
        .pipe(gulp.dest(pluginPath)),

      gulp.src(path.join(wwwPath, 'index.html'))
        .pipe(removeCode({device: true}))
        .pipe(removeCode(platformRemoveCodeOptions))
        .pipe(removeHtml('.hidden-xs.hidden-sm'))
        .pipe(removeHtml('.hidden-device'))
        .pipe(removeHtml('[remove-if][remove-if="device"]'))
        .pipe(htmlmin(/*no options, to build comments*/))
        .pipe(gulp.dest(wwwPath)),

      // Remove unused JS code + add ng annotations
      gulp.src(path.join(wwwPath, 'js', '**', '*.js'))
        .pipe(removeCode({device: true}))
        .pipe(removeCode(platformRemoveCodeOptions))
        .pipe(ngAnnotate({single_quotes: true}))
        .pipe(gulp.dest(wwwPath + '/dist/dist_js/app')),

        gulp.src(path.join(pluginPath, 'js', '**', '*.js'))
        .pipe(removeCode({device: true}))
        .pipe(removeCode(platformRemoveCodeOptions))
        .pipe(ngAnnotate({single_quotes: true}))
        .pipe(gulp.dest(wwwPath + '/dist/dist_js/plugins'))
     );

  }
}

