/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
var plugins = require('gulp-load-plugins')(); // Load all gulp plugins
                                              // automatically and attach
                                              // them to the `plugins` object
const build_domeventsES = require("./build/build_es");
const build_domevents = require("./build/build_amd");

var pkg = require('./package.json');


gulp.task('init', ( done ) => {
    
    done();
    
});

gulp.task("build", ( done ) => {
    "use strict";
    build_domevents( ()=>{
        build_domeventsES( ()=>{
            done();
        });
    });
});

gulp.task("buildAMD", ( done )=>{
    "use strict";
    build_domevents( done );
});

gulp.task("buildES", ( done ) => {
    build_domeventsES( done );
});

gulp.task('default', gulp.series('init', 'buildAMD', 'buildES') );