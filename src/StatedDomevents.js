import Domevents from "./Domevents.es.js";

const defaults = {
    states : []
};

const StatedDomevents = function( camera, domElement ){
    Domevents.apply( this, arguments );
    this.options = Object.assign( {}, defaults );
};

StatedDomevents.prototype = Object.assign( Object.create( Domevents.prototype ), {

    constructor : StatedDomevents,

    setState : function( state ) {
        this.aktState = state;
    },

    addState : function( state ){
        if ( this.options.states.indexOf( state ) < 0 ) {
            this.options.states.puch( state );
        }
    },

    getStates : function( ){
        return this.options.states;
    },

    _notify : function( eventName, object3d, origDomEvent, intersect ){
        Domevents.prototype._notify.apply( this, arguments );
    }
    
});

export default StatedDomevents;
export { StatedDomevents, Domevents };