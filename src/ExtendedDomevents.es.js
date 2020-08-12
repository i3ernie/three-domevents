import DomEvents from "./Domevents.es.js";

DomEvents.eventNames.push("drag");
DomEvents.eventNames.push("dragstart");
DomEvents.eventNames.push("dragend");

DomEvents.eventMapping.dragstart = "onDragstart";
DomEvents.eventMapping.dragend = "onDragend";
DomEvents.eventMapping.drag = "onDrag";


const ExtendedDomEvents = function( camera, domElement, opt ){

    this.stateMouse = {
        mousedown : false,
        dragging : false
    };

    this._draggingObj = null;

    domElement.addEventListener("mousemove", function( ev ){
		if ( this._draggingObj ){
			ev.preventDefault();
			ev.stopPropagation();
		}
	}.bind( this ) );
    
    //call parent constructor
    DomEvents.apply( this, arguments );
};

ExtendedDomEvents.prototype = Object.assign( Object.create( DomEvents.prototype ), {

    constructor : ExtendedDomEvents,

    addEventListener : function( object3d, eventName, callback, opt ){ 
        let scope = this;

        if ( eventName === "drag" ){
            object3d.addEventListener("dragstart", function( event ){
                scope._draggingObj = event.target;
            });
            object3d.addEventListener("dragend", function( event ){
                scope._draggingObj = null;
            });
        }
        DomEvents.prototype.addEventListener.call(this, object3d, eventName, callback, opt);
    },

    _onMouseDown : function( event ){
        
        this.stateMouse.mousedown = true;
        DomEvents.prototype._onMouseDown.call( this, event );
    },

    _onMouseMove : function( event ){
        DomEvents.prototype._onMouseMove.call( this, event );

        if ( this.stateMouse.mousedown ){
            if ( !this.stateMouse.dragging ) {
                this.stateMouse.dragging = true;
                this._onMouseEvent('dragstart', event);
            }
            this._onMouseEvent('drag', event);
        }
    },

    _onMouseUp : function( event ){
        
        DomEvents.prototype._onMouseUp.call( this, event );

        if ( this.stateMouse.dragging ){ 

            this.stateMouse.dragging = false;
            
            if ( this._draggingObj ) {

                this._notify ( "dragend", this._draggingObj, event, {object:this._draggingObj} );

            } else {
                
                this._onMouseEvent('dragend', event);
            }
        }
        this.stateMouse.mousedown = false;
        
    },

    _stopDragging : function() {
        
    }
});

export default ExtendedDomEvents;
export { DomEvents, ExtendedDomEvents };
