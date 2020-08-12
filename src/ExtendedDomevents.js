import DomEvents from "./Domevents.es.js";

DomEvents.eventNames.push("drag");
DomEvents.eventNames.push("dragstart");
DomEvents.eventNames.push("dragend");

DomEvents.eventMapping.dragstart = "onDragstart";
DomEvents.eventMapping.dragend = "onDragend";
DomEvents.eventMapping.drag = "onDrag";


const ExtendedDomEvents = function( camera, domElement, opt ){

    this.state = {
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
        
        this.state.mousedown = true;
        DomEvents.prototype._onMouseDown.call( this, event );
    },

    _onMouseMove : function( event ){
        DomEvents.prototype._onMouseMove.call( this, event );

        if ( this.state.mousedown ){
            if ( !this.state.dragging ) {
                this.state.dragging = true;
                this._onMouseEvent('dragstart', event);
            }
            this._onMouseEvent('drag', event);
        }
    },
    _onMouseUp : function( event ){
        
        DomEvents.prototype._onMouseUp.call( this, event );

        if ( this.state.dragging ){ 
            console.log("mouseup", this.state.dragging);
            
            if ( this._draggingObj ) {
                this.state.dragging = false;
                this._notify ( "dragend", this._draggingObj, event, {object:this._draggingObj} );
	
            }
            this._stopDragging();
        }
        this.state.mousedown = false;
        
    },
    _stopDragging : function(){
        this.state.dragging = false;
        this._onMouseEvent('dragend', event);
    }
});

export default ExtendedDomEvents;
export { DomEvents, ExtendedDomEvents };
