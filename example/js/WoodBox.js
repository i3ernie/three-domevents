import {TextureLoader, BoxBufferGeometry, MeshBasicMaterial, Mesh} from "three";

const texture = new TextureLoader().load( 'textures/crate.gif' );

class WoodBox extends Mesh{ 
    constructor ( w,h,d ) {
        let geo = new BoxBufferGeometry( w || 200, h || 200, d || 200 );
        let mat = new MeshBasicMaterial( { map: texture } );

        super( geo,mat );
    }
}

export default WoodBox;