
import * as THREE from 'three';
import DomEvents from "../../src/Domevents.es.js";
import DomeventMouse from "../../src/domevents/DomeventMouse.es.js";
import DomeventTouch from "../../src/domevents/DomeventTouch.es.js";
import Viewport from "viewport";
import WoodBox from "./WoodBox.js";

DomEvents.extend( DomeventMouse );
DomEvents.extend( DomeventTouch );

init();

function init() {
    
    
    const VP = new Viewport();

    VP.init().start();

    VP.camera.position.z = 400;

    const DEH = new DomEvents( VP.camera, VP.renderer.domElement );
    
    
    let mesh1 = new WoodBox(100,100,100);
    mesh1.name = "box_klein";
    mesh1.position.set(-200,-50,0);
    VP.scene.add( mesh1 );

    mesh1.onClick=function(){ console.log("click"); };
    mesh1.addEventListener("mousedown", function( ev ){ console.log("down", ev); });
    mesh1.addEventListener("mouseup", function( ev ){ console.log("up", ev); });
    
    console.log( "mesh1 has ", DEH.hasListener(mesh1, "click") );

    DEH.activate( VP.scene );

    console.log( "mesh1 has ", DEH.hasListener(mesh1, "click") );

    let mesh = new WoodBox(200,200,200);
    mesh.name = "box_gross";

    mesh.onClick = function( ev ){
        console.log("mesh onclick", ev );
        VP.scene.remove(mesh);
        setTimeout(function(){ VP.scene.add(mesh); }, 6000);
    };

    let box = new THREE.Mesh( new THREE.BoxGeometry(20,20,20),new THREE.MeshBasicMaterial({color:"green"}) );
    box.name = "mini_1";
    box.position.set(100,100,100);

    let box2 = new THREE.Mesh( new THREE.BoxGeometry(20,20,20), new THREE.MeshBasicMaterial({color:"red"}) );
    box2.name = "mini_2";
    box2.position.set( 100, -100, 100 );
    
    box2.onClick = function( ev ){
        console.log("*** red box click", ev );
        ev.stopPropagation();
    };
    box.onClick = function( ev ){
        console.log("*** box click", ev );
    };

    VP.scene.add( mesh );

    mesh.add(box);
    mesh.add(box2);
}
