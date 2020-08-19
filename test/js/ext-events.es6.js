
import * as THREE from '../../node_modules/three/build/three.module.js';
import DomEvents from "../../src/ExtendedDomevents.es.js";
import Viewport from "../../node_modules/three-viewport/dist/viewport.es.js";
import WoodBox from "../WoodBox.js";

var VP;
var DEH;

init();

function init() {
    
    
    VP = new Viewport();

    VP.init();
    VP.start();

    VP.camera.position.z = 400;

    DEH = new DomEvents( VP.camera, VP.renderer.domElement, {trigger:true} );
    
    
    let mesh1 = new WoodBox(100,100,100);
    mesh1.name = "box_klein";
    mesh1.position.set(-200,-50,0);
    
    mesh1.onDrag = function(){
        console.log("** dragging");
    }; 
    mesh1.onDragend = function(){
        console.log("** dragging end");
    }; 
    mesh1.onDragstart = function(){
        console.log("** dragging start");
    }; 

    VP.scene.add( mesh1 );
    
    console.log( "mesh1", DEH.hasListener(mesh1, "click") );

    DEH.activate( VP.scene );

    console.log( "mesh1", DEH.hasListener(mesh1, "click") );



    let mesh = new WoodBox(200,200,200);
    mesh.name = "box_gross";

    mesh.onClick = function( ev ){
        console.log("mesh onclick", ev );
        VP.scene.remove(mesh);
        setTimeout(function(){ VP.scene.add(mesh); }, 6000);
    };

    let box = new THREE.Mesh( new THREE.BoxGeometry(20,20,20) );
    box.name = "mini_1";
    box.position.set(100,100,100);

    let box2 = new THREE.Mesh( new THREE.BoxGeometry(20,20,20) );
    box2.name = "mini_2";
    box2.position.set(100,-100,100);
    box2.onClick = function( ev ){
        console.log("*** mini2 onclick", ev );
        ev.stopPropagation();
    };
    box2.onDrag = function(){
        console.log("** dragging");
    };

    VP.scene.add( mesh );

    mesh.add(box);
    mesh.add(box2);
}
