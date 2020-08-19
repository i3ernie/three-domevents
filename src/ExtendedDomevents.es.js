import DomEvents from "./Domevents.es.js";
import DomeventDrag from "./domevents/DomeventDrag.es.js";

DomEvents.extend( DomeventDrag );

const ExtendedDomEvents = function( camera, domElement, opt ){

    //call parent constructor
    DomEvents.apply( this, arguments );
};

const _onMouseup = function( event ){

    if ( this.stateMouse.dragging ){ 
      
        this.stateMouse.dragging = false;


        if ( this._draggingObj ) {

            this._notify ( "dragend", this._draggingObj, event, {object:this._draggingObj} );
            this._draggingObj = null;

        } else {
            
            this._onMouseEvent('dragend', event);
        }
    }
    this.stateMouse.mousedownd = false;
};

const onMousemove = function( event ){
    if ( scope.stateMouse.mousedownd === event.target.id ) {
        if ( !scope.stateMouse.dragging ) {
            scope.stateMouse.dragging = event.target.id;
            scope._onMouseEvent('dragstart', event.origDomEvent);
        }
        scope._onMouseEvent('drag', event.origDomEvent);
    }
};

ExtendedDomEvents.prototype = Object.assign( Object.create( DomEvents.prototype ), {

    constructor : ExtendedDomEvents,

    addEventListener : function( object3d, eventName, callback, opt ){ 
        let scope = this;

        if ( eventName === "drag" ){ console.log( object3d );
            if( !this.hasListener(object3d, "mousedown") ){
                this.addEventListener( object3d, "mousedown", "mousedown" );
            }
            object3d.addEventListener("mousedown", function( event ){ 
                scope.stateMouse.mousedownd = event.target.id;
            });

            if( !this.hasListener(object3d, "mouseup") ){
                this.addEventListener( object3d, "mouseup", "mouseup" );
            }
            object3d.addEventListener("mouseup", _onMouseup.bind(this) );

            if( !this.hasListener(object3d, "mousemove") ){
                this.addEventListener( object3d, "mousemove", "mousemove" );
            }
            object3d.addEventListener("mousemove", function( event ){
			
				
			});
            object3d.addEventListener("dragstart", function( event ){
                scope._draggingObj = event.target;
            });
            object3d.addEventListener("dragend", function( event ){
                scope._draggingObj = null;
            });
        }
        DomEvents.prototype.addEventListener.call(this, object3d, eventName, callback, opt);
    },

    _stopDragging : function() {
        
    }
});

export default ExtendedDomEvents;
export { DomEvents, ExtendedDomEvents };
