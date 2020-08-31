import Domevents from "./Domevents.es.js";

const defaults = {

};

const StatedDomevents = function( camera, domElement ){
    Domevents.apply( this, arguments );
};

StatedDomevents.prototype = Object.assign( Object.create( Domevents.prototype ), {

    constructor : StatedDomevents,

    _notify : function( eventName, object3d, origDomEvent, intersect ){
        Domevents.prototype._notify.apply( this, arguments );
    }
});

export default StatedDomevents;
export { StatedDomevents, Domevents };