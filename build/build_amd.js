const rollup  = require('rollup');
const resolve = require('@rollup/plugin-node-resolve');

const replace = require("./replace.js");
const async = require("async");


const build_domeventsPack = function( done ){
    rollup.rollup({
        input : 'src/domevents.pack.es.js',
        external: ['three'],
        
        plugins:[

            resolve()
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/domevents.pack.amd.js',


            plugins:[
                replace({
                    "../../node_modules/three/build/three.module" : "three",
                    "../node_modules/three/build/three.module" : "three"
                })
            ],
            
            format: 'amd',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          done( );
    }).catch(
        ( err ) => {
            done( err );
        }
    );
};

const build_domeventsAMD = function( done ){
   
    rollup.rollup({
        input : 'src/Domevents.es.js',
        external: ['three'],
        
        plugins:[

            resolve()
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/domevents.amd.js',


            plugins:[
                replace({
                    "../node_modules/three/build/three.module" : "three"
                })
            ],
            
            format: 'amd',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          done( );
    }).catch(
        ( err ) => {
            done( err );
        }
    );
};

const build_domeventsDrag = function( done ){
   
    rollup.rollup({
        input : 'src/domevents/DomeventDrag.es.js',
        external: ['three'],
        
        plugins:[

            resolve()
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/DomeventDrag.amd.js',


            plugins:[
                replace({
                    "../node_modules/three/build/three.module" : "three"
                })
            ],
            
            format: 'amd',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          done();
    }).catch(
        ( err ) => {
            done( err );
        }
    );
};

const build_domevents = function( done ){
    async.series([
        build_domeventsAMD,
        build_domeventsPack,
        build_domeventsDrag 
    
    ], function( err, data ){
        done();
    });
};

module.exports = build_domevents;