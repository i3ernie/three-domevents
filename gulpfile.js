/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

const gulp = require('gulp');

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

gulp.task("buildAMD", build_domevents );

gulp.task("buildES", build_domeventsES );

gulp.task('default', gulp.series('init', 'buildAMD', 'buildES') );