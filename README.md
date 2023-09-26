## three-domevents

...
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
