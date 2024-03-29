## three-domevents
[![DeepScan grade](https://deepscan.io/api/teams/22235/projects/25559/branches/801467/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=22235&pid=25559&bid=801467)
...

#### JavaScript library for three.js

The aim of the project is to create an easy to use dom-event handling for three.js scene objects.

### useage

easy-to-use

```javascript
    DEH = new DomEvents( VP.camera, VP.renderer.domElement );

    let activeWorld = new THREE.Object3D();
    activeWorld.name = "active_world";
    VP.scene.add( activeWorld );


    let world = new THREE.Object3D();
    world.name = "world";
    VP.scene.add( world );

    DEH.activate( activeWorld ); //or for global: DEH.activate( VP.Scene )

    //add activeWorld child
    let mesh = new THREE.Mesh( new THREE.BoxGeomtry, new THREE.StandardMeshMaterial() );
    mesh.onClick = function(){
        alert("click");
    };

    VP.scene.add( mesh );
```

minimal config in one line 
this will activate the whole scene node and all added childs

```javascript
    //activate scene graph
    new DomEvents( VP.camera, VP.renderer.domElement ).activate( VP.scene );

    //active scene child
    let mesh = new THREE.Mesh( new THREE.BoxGeomtry, new THREE.StandardMeshMaterial() );
    mesh.onClick = function(){
        alert("click");
    };

    VP.scene.add( mesh );
```



### Examples

... [example](https://i3ernie.github.io/three-domevents/example).

### Support or Contact

..
