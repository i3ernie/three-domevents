import * as THREE from 'three';

import {Domevents, DomeventPointer } from "domevents.pack";


import Viewport from "viewport";
import WoodBox from "WoodBox";
import Grassground from "./Grassground.es.js";

//DomEvents.extend( DomeventPointer );
Domevents.extend( DomeventPointer.config({emulateClick : true}) );


var VP;

init();

function init() {
    
    
    VP = new Viewport();
    VP.init().start();

    VP.camera.position.z = 500;

    // add a ambient light
    VP.scene.add( new THREE.AmbientLight( 0x020202 ) );

    // add a light in front
    let light	= new THREE.DirectionalLight('white', 2);
    light.position.set(100, 100, 300);
    VP.scene.add( light );

   

    let activeWorld = new THREE.Object3D();
    activeWorld.name = "active_world";
    VP.scene.add( activeWorld );


    let world = new THREE.Object3D();
    world.name = "world";
    VP.scene.add( world );

    //or for global ( VP.Scene )
    new Domevents( VP.camera, VP.renderer.domElement ).activate( activeWorld ); 


    //box number one
    let mesh1 = new WoodBox(100, 100, 100);
    mesh1.name = "woodbox_1";
    mesh1.position.set(-200, 50, 0);


    let box = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),new THREE.MeshBasicMaterial({color:"yellow"}) );
    box.name = "box_yellow_1.1";
    box.position.set(0, 50, 0);
    mesh1.add( box );


    mesh1.addEventListener("click", logEvent );
    mesh1.onClick = logOnClick;

    mesh1.onPointerdown = function( ev ){
        console.log("down", ev.target.name, ev.intersect);
        ev.stopPropagation();
    };
    mesh1.onMousedown = function( ev ){
        console.log("onMousedown", ev.target.name, ev.intersect);
        ev.stopPropagation();
    };

    mesh1.onPointerup = function( ev ){
        console.log("onPointerup", ev.target.name, ev.intersect);
        ev.stopPropagation();
    };
    mesh1.onMouseup = function( ev ){
        console.log("onMouseup", ev.target.name, ev.intersect);
        ev.stopPropagation();
    };

    mesh1.onPointerout = function( ev ){
        console.log("out", ev.target.name, ev.intersect);
        ev.stopPropagation();
    };
    mesh1.onPointerover = function( ev ){
        console.log("over", ev.target.name, ev.intersect);
        ev.stopPropagation();
    };




    //box number two
    let mesh2 = new WoodBox( 150, 150, 150 );
    mesh2.name = "box_2";
    mesh2.position.set( -30, 75, 0 );

    mesh2.addEventListener("click", logEvent);
    mesh2.onClick = remove;


    //box number three
    let mesh3 = new WoodBox( 180, 180, 180 );
    mesh3.name = "box_3";
    mesh3.position.set( 150, 90, 0 );

    let box_green = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),new THREE.MeshBasicMaterial({color:"green"}) );
    box_green.name = "mini_3.1";
    box_green.position.set(90, 90, 90);
    box_green.addEventListener("click", logEvent );
    mesh3.add(box_green);

    box = new THREE.Mesh( new THREE.BoxGeometry(20,20,20),new THREE.MeshBasicMaterial({color:"green"}) );
    box.name = "mini_3.1b";
    box.position.set(20, 20, 20);
    box_green.add(box);

    let box_red = new THREE.Mesh( new THREE.BoxGeometry(40,40,40),new THREE.MeshBasicMaterial({color:"red"}) );
    box_red.name = "mini_3.2";
    box_red.position.set(90, 90, -90);
    box_red.onClick = function( ev ){
        console.log( ev.target.name + " stopped event propagation to " + ev.target.parent.name + " on " + ev.intersect.object.name );
        ev.stopPropagation();
    };

    box = new THREE.Mesh( new THREE.BoxGeometry(20, 20, 20),new THREE.MeshBasicMaterial({color:"red"}) );
    box.name = "box_red_3.2b";
    box.position.set(20, 20, -20);
    box_red.add(box);

    mesh3.add(box_red);


    mesh3.addEventListener("click", logEvent );

    mesh3.addEventListener("click", function(){ console.log("lalalaaaa"); } );

    mesh3.onClick = remove;



    let mesh4 = new WoodBox( 100, 100, 100 );
    mesh4.name = "box_4";
    mesh4.position.set( 150, 50, -200 );

    let ground = new Grassground({
        width		: 2000,
		height		: 2000,
		repeatX		: 10,
        repeatY		: 10,
        "image" : "big"
    });



    world.add( mesh4 );
    VP.scene.add( ground );


    activeWorld.add( mesh1 );
    activeWorld.add( mesh2 );
    activeWorld.add( mesh3 );

    let box_blue = new THREE.Mesh( new THREE.BoxGeometry(40, 40, 40),new THREE.MeshBasicMaterial({color:"blue"}) );
    box_blue.name = "box_blue_3.3";
    box_blue.position.set(90, 90, 0);
    box_blue.userData.preventDomevents = true;
    mesh3.add(box_blue);

    box = new THREE.Mesh( new THREE.BoxGeometry(30, 30, 30),new THREE.MeshBasicMaterial({color:"blue"}) );
    box.name = "box_blue_3.3b";
    box.position.set(20, 20, 0);
    box.userData.preventDomevents = true;
    box_blue.add(box);
}



function logEvent( ev ){
    console.log( "eventListener: " + ev.type + " for " + ev.target.name + " <--on-- ", ev.intersect.object.name );
}
function logOnClick( ev ){
    console.log("this: ", this, "target.name " + ev.target.name + " = this.name " + this.name );
    console.log( ev.target.name + ".onClick: " );
}



function remove( ev ){
    let obj = ev.target;
    let parent = obj.parent;

    console.log("remove " + obj.name + " <--on-- " + ev.intersect.object.name);
        
    parent.remove( obj );

    setTimeout(function(){ 
        parent.add(obj); 
    }, 5000);
}