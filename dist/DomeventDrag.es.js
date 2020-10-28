/*const _onMousedown = function( event ){ console.log("down");
    if ( event.intersect.object.id === event.target.id ){
        this._mousedownd[event.target.id] = event.target;
    }
}; */

var _onMousedown = function( ev ) { 
    this.stateMouse.mousedown = true;
    console.log("down", ev);
    //this._mousedownd[ ev.target.id ] = ev.target;
    
};

var _onMouseupDrag = function( event ){

    if ( this.stateMouse.dragging ) { 
        
        this.stateMouse.dragging = false;
        this._onMouseEvent( "dragend", event );

        
        for ( var key in this._draggingObjs ) { 
            this._notify( "dragend", this._draggingObjs[key], event, null );
        }
        
    }
    this._draggingObjs = {};
    this._mousedownd = {};
};

var _onMousemove = function( event ){ 
    if ( this.stateMouse.mousedown && !this.stateMouse.dragging ) { 
        
        this.stateMouse.dragging = true;
        this._onMouseEvent('dragstart', event);
        
    } 
    return;
};


var DomeventDrag = {

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
        var _this = this; 
        
        this.stateMouse = this.stateMouse || {};    
        this.stateMouse.dragging = false;

        this._mousedownd = {};
        this._draggingObjs = {};

        this._$onMouseDownDrag = function(){ _onMousedown.apply( _this, arguments ); };
        //this._$onDragStart	= function(){ _onMousedown.apply( _this, arguments ); };
        this._$onDragging	= function(){ _onMousemove.apply(_this, arguments);	};
        this._$onMouseUpDrag = function(){ _onMouseupDrag.apply( _this, arguments );	};
        this._$onMouseMoveDrag = function(){  _onMousemove.apply( _this, arguments ); };
        
        var addEventListener = this.addEventListener;
        this.addEventListener = DomeventDrag.addEventListener.call(this, addEventListener );
        var _notify = this._notify;
        this._notify = DomeventDrag._notify.call(this, _notify );
    },

    _notify : function( _notify ){ 

        var ret = null;

        return function( eventName, object3d, origDomEvent, intersect ){   
            if ( eventName === "dragstart" ) {
                console.log( eventName, object3d );
                this._draggingObjs[object3d.id] = object3d;
            }
            if ( eventName === "dragend" ){
                if ( this._draggingObjs[object3d.id] ) { 
                    delete this._draggingObjs[object3d.id];
                    return _notify.call(this, eventName, object3d, origDomEvent, intersect );
                }
                return false;
            }
            ret = _notify.call(this, eventName, object3d, origDomEvent, intersect );
            if ( this.stateMouse.mousedown && this.stateMouse.dragging && eventName === "mousemove" ) {
                if ( this._draggingObjs[object3d.id] ) { ret = _notify.call( this, 'drag', object3d, origDomEvent, intersect ); }
            }
            return ret;
        };
    },

    addEventListener : function( addEventListener ){ 
        return function( object3d, eventName, callback, opt ) { 
            var scope = this;

            if ( eventName === "drag" ) {
                if( !this.hasListener(object3d, "mousedown") ){
                    this.addEventListener( object3d, "mousedown", "mousedown" );
                }
                object3d.addEventListener("mousedown", scope._$onDragStart );

                if( !this.hasListener(object3d, "mousemove") ){
                    this.addEventListener( object3d, "mousemove", "mousemove" );
                }
                object3d.addEventListener("mousemove", scope._$onDragging );
            }

            addEventListener.call(scope, object3d, eventName, callback, opt );
        } 
    },

    enable : function() { 
        this._domElement.addEventListener( 'mousedown'	, this._$onMouseDownDrag	, false );
        this._domElement.addEventListener( 'mouseup'	, this._$onMouseUpDrag		, false );
        this._domElement.addEventListener( 'mousemove'	, this._$onMouseMoveDrag	, false );
        
    },

    disable : function() {
        this._domElement.removeEventListener( 'mousedown', this._$onMouseDownDrag	, false );
        this._domElement.removeEventListener( 'mouseup', this._$onMouseUpDrag		, false );
        this._domElement.removeEventListener( 'mousemove', this._$onMouseMoveDrag	, false );
        
    }
};

export default DomeventDrag;
export { DomeventDrag };
//# sourceMappingURL=DomeventDrag.es.js.map
