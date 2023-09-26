import {TextureLoader, BoxGeometry, MeshBasicMaterial, Mesh} from "../node_modules/three/build/three.module.js";

const texture = new TextureLoader().load( 'textures/crate.gif' );

class WoodBox extends Mesh { 

    constructor ( w,h,d ) {

        super( 
            new BoxGeometry( w || 200, h || 200, d || 200 ), 
            new MeshBasicMaterial( { map: texture } ) 
        );
    }
}

export default  WoodBox;