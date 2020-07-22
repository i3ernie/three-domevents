import {Mesh} from "../node_modules/three/build/three.module.js";
import interactive from "./interactive";
import DomEvents from "./Domevents.es";

const ActiveMesh = function( geo, mat, DEH ){
    
    Mesh.call( geo, mat );

    Object.defineProperty(this, DEH, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: DEH
    }); 

    this.addEventListener("added", function() {
        this.DEH.activate( this );
    });

    this.addEventListener("removed", function() {
        this.DEH.removeMappedListener( this );
    });
};

ActiveMesh.prototype = Object.assign( Object.create( Mesh.prototype ), interactive, {

    constructor : ActiveMesh,

    add : function( child ){

        this.DEH.activate( child );
        Mesh.add.call( this, child );
    },

    remove : function( child ){

        this.DEH.removeMappedListener( child );
        Mesh.remove.call( this, child );
    }
});