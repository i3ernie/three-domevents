const rollup  = require('rollup');
const resolve =require('rollup-plugin-node-resolve');
const buble = require('rollup-plugin-buble');
const replace = require("./replace.js");
const async = require("async");

const build_domeventsES = function( done ){
   
    rollup.rollup({
        input : 'src/Domevents.es.js',
        external: ['../node_modules/three/build/three.module.js', '../../node_modules/three/build/three.module.js'],
        
        plugins:[
            
            resolve(),
            
            buble({
				transforms: {
					arrow: false,
					classes: true
				}
            })
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/domevents.es.js',
            plugins:[
                replace({
                    "../node_modules/three/" : "../../three/"
                })
            ],
            
            format: 'es',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          build_extDomeventsES( done );
    }).catch(
        (err)=>{console.error(err);}
    );
};

const build_extDomeventsES = function( done ){
   
    rollup.rollup({
        input : 'src/domevents/DomeventDrag.es.js',
        external: ['../../node_modules/three/build/three.module.js', '../node_modules/three/build/three.module.js'],
        
        plugins:[
            
            resolve(),
            
            buble({
				transforms: {
					arrow: false,
					classes: true
				}
            })
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/DomeventDrag.es.js',
            plugins:[
                replace({
                    "../node_modules/three/" : "../../three/"
                })
            ],
            
            format: 'es',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          done();
    }).catch(
        ( err ) => {
            console.error(err);
        }
    );
};

const build_DomeventMouseES = function( done ){
   
    rollup.rollup({
        input : 'src/domevents/DomeventMouse.es.js',
        external: ['../node_modules/three/build/three.module.js', '../../node_modules/three/build/three.module.js'],
        
        plugins:[
            
            resolve(),
            
            buble({
				transforms: {
					arrow: false,
					classes: true
				}
            })
        ]
    }).then(( bundle ) => { 
        bundle.write({
            file: './dist/DomeventMouse.es.js',
            plugins:[
                replace({
                    "../../node_modules/three/" : "../../three/",
                    "../node_modules/three/" : "../../three/"
                })
            ],
            
            format: 'es',
            name: 'three',
            exports: 'named',
            sourcemap: true
          });
          done( null );
    }).catch(
        ( err ) => {
            console.error(err);
        }
    );
};

module.exports = function( done ){
    async.series([
        build_domeventsES,
        build_extDomeventsES,
        build_DomeventMouseES
    ], function( err, data ){
        done();
    });
};