import DomEvents from "./Domevents.es.js";

const ExtendedDomEvents = function( camera, domElement ){
    
    //call parent constructor
    DomEvents.call( this, camera, domElement );
};

ExtendedDomEvents.prototype = Object.assign( Object.create( DomEvents.prototype ), {
    constructor : ExtendedDomEvents
});

export default ExtendedDomEvents;
export { DomEvents, ExtendedDomEvents };
