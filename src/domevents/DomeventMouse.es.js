import getRelativeMouseXY from "../PointerTools.es.js";

const CLICK_TIMEOUT = 500;

const _onMouseDown	= function( event ){
    this.stateMouse.mousedown = true;

    if ( event.buttons && event.buttons > 1 ) {
        if ( event.button === 1 ) {
            return _onMouseEvent.call(this, 'mousemiddledown', event);
        }
        if ( event.button === 2 ) {
            //rightdown
            return _onMouseEvent.call(this, 'mouserightdown', event);
        }
    }
    this.timeStamp = event.timeStamp;

    return _onMouseEvent.call(this, 'mousedown', event);
};

const _onMouseUp	= function( event ){
    this.stateMouse.mousedown = false;

    if ( event.buttons && event.buttons > 1 ) {
        if ( event.button === 1 ) {
            return _onMouseEvent.call(this, 'mousemiddleup', event);
        }
        if ( event.button === 2 ) {
            //rightdown
            return _onMouseEvent.call(this, 'mouserightup', event);
        }
    }
    return _onMouseEvent.call(this, 'mouseup'	, event);
};


const _onClick = function( event )
{
    // TODO handle touch ? 
    if ( this.timeStamp !== null && (event.timeStamp - this.timeStamp) > CLICK_TIMEOUT ){
        return;
    }
    this.timeStamp = null;
    _onMouseEvent.call(this, 'click', event );
};

const _onDblClick = function( event )
{
    // TODO handle touch ?
    _onMouseEvent.call(this, 'dblclick', event);
};


/************************************************/
/*		handle mouse events						*/
/************************************************/
// # handle mouse events

const _onMouseEvent	= function( eventName, domEvent )
{
    let mouseCoords = getRelativeMouseXY( domEvent );
    this._onEvent(eventName, mouseCoords.x, mouseCoords.y, domEvent);
    //console.log("RH", eventName, mouseCoords.x, mouseCoords.y, domEvent);
};

const _onMouseMove	= function( domEvent )
{
    let mouseCoords = getRelativeMouseXY( domEvent );
    
    this._onMove('mousemove', mouseCoords.x, mouseCoords.y, domEvent);
    this._onMove('mouseover', mouseCoords.x, mouseCoords.y, domEvent);
    this._onMove('mouseout' , mouseCoords.x, mouseCoords.y, domEvent);
};


const _onContextmenu = function( event )
{
    //TODO don't have a clue about how this should work with touch..
    _onMouseEvent.call(this, 'contextmenu', event);
};





const DomeventClick = {

    eventNames : [
        "mousedown",
        "mouseup",

        "mousemove",
	    "contextmenu",
        
        "click",
        "dblclick",
        
        "drag"
    ],

    eventMapping : {
        "mousedown" : "onMousedown",
        "mouseup" 	: "onMouseup",
        "mousemove" : "onMousemove",
        "click" : "onClick"
    },

    initialize : function( ){
        let _this = this; 

        this.stateMouse = this.stateMouse || {};
        this.stateMouse.mousedown = false;
    

        this._$onMouseDown	= function(){ _onMouseDown.apply( _this, arguments ); };
	    this._$onMouseUp	= function(){ _onMouseUp.apply( _this, arguments );	};

        this._$onDblClick	= function(){ _onDblClick.apply( _this, arguments);	};
        this._$onClick		= function(){ _onClick.apply( _this, arguments); };

        this._$onMouseMove	= function(){ _onMouseMove.apply(_this, arguments);	};
        this._$onContextmenu	= function(){ _onContextmenu.apply(_this, arguments);	};
    },

    enable : function(){ 
        this._domElement.addEventListener( 'mousedown'	, this._$onMouseDown	, false );
        this._domElement.addEventListener( 'mouseup'	, this._$onMouseUp		, false );
        
        this._domElement.addEventListener( 'click'		, this._$onClick		, false );
        this._domElement.addEventListener( 'dblclick'	, this._$onDblClick		, false );  

        this._domElement.addEventListener( 'mousemove'	, this._$onMouseMove	, false );
        this._domElement.addEventListener( 'contextmenu', this._$onContextmenu	, false );
    },

    disable : function(){
        this._domElement.removeEventListener( 'mousedown'	, this._$onMouseDown	, false );
        this._domElement.removeEventListener( 'mouseup'		, this._$onMouseUp		, false );
        
        this._domElement.removeEventListener( 'click'		, this._$onClick		, false );
        this._domElement.removeEventListener( 'dblclick'	, this._$onDblClick		, false );
        
        this._domElement.removeEventListener( 'mousemove'	, this._$onMouseMove	, false );
        this._domElement.removeEventListener( 'contextmenu', this._$onContextmenu	, false );
    }
};

export default DomeventClick;
export { DomeventClick };