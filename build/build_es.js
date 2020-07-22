const rollup  = require('rollup');
const resolve =require('rollup-plugin-node-resolve');
const buble = require('rollup-plugin-buble');
const replace = require("./replace.js");

const build_domeventsES = function( done ){
   
    rollup.rollup({
        input : 'src/Domevents.es.js',
        external: ['../node_modules/three/build/three.module.js'],
        
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
          done();
    }).catch(
        (err)=>{console.error(err);}
    );
};

module.exports = build_domeventsES;