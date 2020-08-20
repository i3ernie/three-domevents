import getRelativeMouseXY from "../PointerTools.es.js";

const _onMousedown = function( event ){ 
    if ( event.intersect.object.id === event.target.id ){
        this._mousedownd[event.target.id] = event.target;
    }
};

const _onMouseupDrag = function( event ){

    if ( this.stateMouse.dragging ){ 
        this.stateMouse.dragging = false;
        
        for ( let key in this._draggingObjs ) { 
            this._notify ( "dragend", this._draggingObjs[key], event, {object:this._draggingObjs[key]} );
        }
    }
    this._draggingObjs = {};
    this._mousedownd = {};
}

const _onMousemove = function( event ){ 
    if ( this._mousedownd[event.target.id] ) {

        if ( !this._draggingObjs[event.target.id] ) {
            
            this.stateMouse.dragging = true;
            this._draggingObjs[event.target.id] = event.target;

            _onMouseEvent.call(this, 'dragstart', event.origDomEvent);
        }

        _onMouseEvent.call(this, 'drag', event.origDomEvent);
    }
};

const _onMouseEvent	= function( eventName, domEvent )
{
    let mouseCoords = getRelativeMouseXY( domEvent );
    this._onEvent(eventName, mouseCoords.x, mouseCoords.y, domEvent);
};


const DomeventDrag = {

    eventNames : [
        "drag",
        "dragstart",
        "dragend"
    ],

    eventMapping : {
        dragstart : "onDragstart",
        dragend : "onDragend",
        drag : "onDrag"
    },

    initialize : function( ){
        let _this = this; 

        this.stateMouse = this.stateMouse || {};    
        this.stateMouse.dragging = false;

        this._mousedownd = {};

        this._draggingObjs = {};

        this._$onDragStart	= function(){ _onMousedown.apply( _this, arguments ); };
        this._$onDragging	= function(){ _onMousemove.apply(_this, arguments);	};
        this._$onMouseUpDrag = function(){ _onMouseupDrag.apply( _this, arguments );	};
    },

    addEventListener : function( object3d, eventName, callback, opt ) { 
        let scope = this;

        if ( eventName === "drag" ){   
            if( !this.hasListener(object3d, "mousedown") ){
                this.addEventListener( object3d, "mousedown", "mousedown" );
            }
            object3d.addEventListener("mousedown", scope._$onDragStart );

            if( !this.hasListener(object3d, "mousemove") ){
                this.addEventListener( object3d, "mousemove", "mousemove" );
            }
            object3d.addEventListener("mousemove", scope._$onDragging );
        }
    },

    enable : function() { 
        //this._domElement.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
        this._domElement.addEventListener( 'mouseup'	, this._$onMouseUpDrag		, false );
        //this._domElement.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
        
    },

    disable : function() {
        //this._domElement.removeEventListener( 'mousedown', this._$onMouseDown	, false );
        this._domElement.removeEventListener( 'mouseup', this._$onMouseUpDrag		, false );
        //this._domElement.removeEventListener( 'mousemove', this._$onMouseMove	, false );
        
    }
};


export default DomeventDrag;
export { DomeventDrag };