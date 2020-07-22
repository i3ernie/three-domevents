import {Raycaster, Vector3, Mesh} from "../node_modules/three/build/three.module.js";
import DomEvents from "./domevents.es.js";

const Interactive = {

    registerDomevents : function( DEH, recursiv ){

        let scope = this;
        let rec = ( recursiv === undefined )? true : recursiv;

        this.addEventListener("added", function(){

            if ( rec ) DEH.activate();

            else {
                for ( let key in DomEvents.eventMapping ) {
                    if ( scope[ DomEvents.eventMapping[key] ] ) DEH.addEventListener(scope, key, scope[ DomEvents.eventMapping[key] ] );    
                }
            }
        });
        
        this.addEventListener("removed", function() {
            scope.removeDomevents.call( scope, DEH, rec );
        });
    },

    removeDomevents : function( DEH, recursiv ){

        let rec = ( recursiv === undefined )? true : recursiv;

        function remove ( obj ){
            for ( let key in DomEvents.eventMapping ) {
                if ( this[ DomEvents.eventMapping[key] ] ) DEH.removeEventListener(obj, key, this[ DomEvents.eventMapping[key] ] );    
            }

            if ( obj.children.length > 0 && rec ) {
                child.children.forEach( function( el ){
                    remove( el );
                });
            }
        } 
        
        remove( this );
    },

    onClick : function(){

    },
    onMouseDown : function(){

    },
    onMouseup : function(){

    },
    onMouseover : function(){

    },
    onMouseout : function(){

    },
    onMousemove : function(){

    }

};

export default Interactive;