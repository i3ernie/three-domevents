
import * as THREE from '../../node_modules/three/build/three.module.js';
import DomEvents from "../../src/ExtendedDomevents.es.js";
import Viewport from "../../node_modules/three-viewport/dist/viewport.es.js";
import WoodBox from "../WoodBox.js";

var VP;
var DEH;

const onDrag = function( ev ){
    //console.log("** dragging", ev.target.name);
}

const onDragstart = function( ev ){
    console.log("** dragging start", ev.target.name);
}

const onDragend = function( ev ){
    console.log("** dragging end", ev.target.name);
}

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
    
    mesh1.onDrag = onDrag; 
    mesh1.onDragend = onDragend; 
    mesh1.onDragstart = onDragstart; 
    VP.scene.name = "Scene";
    VP.scene.add( mesh1 );
    
 
    DEH.activate( VP.scene );


    let mesh = new WoodBox( 200, 200, 200 );
    mesh.name = "box_gross";

    mesh.onClick = function( ev ){
        console.log("mesh onclick", ev );
        VP.scene.remove(mesh);
        setTimeout(function(){ VP.scene.add(mesh); }, 6000);
    };

    mesh.addEventListener("drag", onDrag );
    mesh.onDragstart = onDragstart; 
    mesh.onDragend = onDragend;

    let box = new THREE.Mesh( new THREE.BoxGeometry(20,20,20),new THREE.MeshBasicMaterial({color:"green"}) );
    box.name = "mini_1";
    box.position.set(100,100,100);

    let box2 = new THREE.Mesh( new THREE.BoxGeometry(20,20,20),new THREE.MeshBasicMaterial({color:"red"}) );
    box2.name = "mini_2";
    box2.position.set(100,-100,100);
    box2.onClick = function( ev ){
        console.log("*** mini2 onclick", ev );
        ev.stopPropagation();
    };
    box2.onDrag = onDrag;
    box2.onDragstart = onDragstart; 
    box2.onDragend = onDragend;

    VP.scene.add( mesh );

    mesh.add(box);
    mesh.add(box2);
}
