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

    DEH.activate( activeWorld ); //or for global ( VP.Scene )
```



### Examples

... [example](https://i3ernie.github.io/three-domevents/example).

### Support or Contact

..
