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

    
    //call parent constructor
    DomEvents.apply( this, arguments );
};

ExtendedDomEvents.prototype = Object.assign( Object.create( DomEvents.prototype ), {

    constructor : ExtendedDomEvents,

    addEventListener : function( object3d, eventName, callback, opt ){ 
        let scope = this;

        if ( eventName === "drag" ){
            object3d.addEventListener("mousedown", function( event ){
                scope.stateMouse.mousedown = true;
            });
            object3d.addEventListener("mousemove", function( event ){
			
				if ( scope.stateMouse.mousedown === event.target.id ) {
					if ( !scope.stateMouse.dragging ) {
						scope.stateMouse.dragging = event.target.id;
						scope._onMouseEvent('dragstart', event.origDomEvent);
					}
					scope._onMouseEvent('drag', event.origDomEvent);
				}
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

    _onMouseMove : function( event ){
        DomEvents.prototype._onMouseMove.call( this, event );
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
