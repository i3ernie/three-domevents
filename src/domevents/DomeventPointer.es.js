import {Vector3} from "three";


import getRelativeMouseXY from "../PointerTools.es.js";

const CLICK_TIMEOUT = 500;
let emulateMouse = false, emulateClick = false;

const _onPointerDown	= function( event ){
    
    this.pointerDownTimeStamp = event.timeStamp;

    _onMouseEvent.call(this, 'pointerdown', event);

    if ( emulateMouse && ( event.pointerType === "mouse" || event.pointerType === "touch") ) {
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
        _onMouseEvent.call(this, 'mousedown', event);
    }
};

const _onPointerUp	= function( event ){

    this.pointerUpTimeStamp = event.timeStamp;

    _onMouseEvent.call(this, 'pointerup', event);

    if ( emulateMouse && ( event.pointerType === "mouse" || event.pointerType === "touch") ) {
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
        _onMouseEvent.call(this, 'mouseup'	, event);

        if ( emulateClick ){
            this._$onClick( event );
        }
    }
};

/********************************************************************************/
/*		onMove								*/
/********************************************************************************/

// # handle mousemove kind of events

const _onMove = function( eventName, mouseX, mouseY, origDomEvent )
{
    //console.log('eventName', eventName, 'boundObjs', this._boundObjs[eventName])
    // get objects bound to this event
    let boundObjs	= this._boundObjs[eventName];
    if( boundObjs === undefined || boundObjs.length === 0 )	return;

    // compute the intersection
    let vector = new Vector3( mouseX, mouseY, 0.5 );
    this._ray.setFromCamera( vector, this._camera );

    let intersects = null;
    try {
        intersects  = this._ray.intersectObjects( boundObjs );
    } catch( e ){
        this.clean();
        this._onMove( eventName, mouseX, mouseY, origDomEvent );
        return;
    }

    let oldSelected	= this._selected;
    let notifyOver, notifyOut, notifyMove;
    let intersect;
    let newSelected;
    let i = 0;
    let doIntersect = true;

    while ( doIntersect ) {
        
        doIntersect = false;

        if ( intersects.length > 0 ){
            intersect	= intersects[ i ];
            newSelected	= intersect.object;

            this._selected	= newSelected;
            // if newSelected bound mousemove, notify it
            notifyMove	= this._bound('mousemove', newSelected);

            if ( oldSelected !== newSelected ) {
                // if newSelected bound mouseenter, notify it
                notifyOver	= this._bound('mouseover', newSelected);
                // if there is a oldSelect and oldSelected bound mouseleave, notify it
                notifyOut	= oldSelected && this._bound('mouseout', oldSelected);
            }

        } else {
            // if there is a oldSelect and oldSelected bound mouseleave, notify it
            notifyOut	= oldSelected && this._bound('mouseout', oldSelected);
            this._selected	= null;
        }
        i++;

        // notify mouseMove - done at the end with a copy of the list to allow callback to remove handlers
        if (notifyMove) {
            doIntersect = this._notify('mousemove', newSelected, origDomEvent, intersect, intersects);
        }
        // notify mouseEnter - done at the end with a copy of the list to allow callback to remove handlers
        if (notifyOver) {
            this._notify('mouseover', newSelected, origDomEvent, intersect, intersects);
        }
        // notify mouseLeave - done at the end with a copy of the list to allow callback to remove handlers
        if (notifyOut) {
            this._notify('mouseout' , oldSelected, origDomEvent, intersect, intersects);
        }
       
    }
};


const _onClick = function( event )
{
    // TODO handle touch ? 
    if ( this.pointerDownTimeStamp !== null && (event.timeStamp - this.pointerDownTimeStamp) > CLICK_TIMEOUT ){
        return;
    }
    this.pointerDownTimeStamp = null;
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
};

const _onPointerMove	= function( domEvent )
{
    let mouseCoords = getRelativeMouseXY( domEvent );

    _onMove.call(this, 'pointermove', mouseCoords.x, mouseCoords.y, domEvent);
    
    if ( emulateMouse ){
        _onMove.call(this, 'mousemove', mouseCoords.x, mouseCoords.y, domEvent);
    }
    
    //_onMove.call(this, 'mouseover', mouseCoords.x, mouseCoords.y, domEvent);
    //_onMove.call(this, 'mouseout' , mouseCoords.x, mouseCoords.y, domEvent);
};


const _onContextmenu = function( event )
{
    //TODO don't have a clue about how this should work with touch..
    _onMouseEvent.call(this, 'contextmenu', event);
};


const mouseEvents = [
    "mousedown",
    "mouseup",
    "mousemove",
    "contextmenu",

    "click",
    
    "dblclick"
];
const mouseEventMapping = {
    "mousedown"     : "onMousedown",
    "mouseup" 	    : "onMouseup",

    "click"         : "onClick",
    "mousemove"     : "onMousemove",
    "dblclick"      : "onDblclick"
};


const DomeventPointer = {

    eventNames : [

        "pointerover",
        "pointerenter",

        "pointerdown",
        "pointermove",
        "pointerup",
        "pointercancel",        
        "pointerout",
        "pointerleave"
    ],

    eventMapping : {
        "pointerover"   : "onPointerover",
        "pointerenter"  : "onPointerenter",
        "pointerdown"   : "onPointerdown",
        "pointermove"   : "onPointermove",
        "pointerup"     : "onPointerup",
        "pointercancel" : "onPointercancel"
    },

    config : function( opt ){
        if ( opt ){ 
            if( opt.emulateMouse ) {
                emulateMouse = true;
                emulateClick = true;
                DomeventPointer.eventNames = DomeventPointer.eventNames.concat( mouseEvents );
                Object.assign(DomeventPointer.eventMapping, mouseEventMapping);
            }
            if ( opt.emulateClick ) {
                emulateClick = true;
                DomeventPointer.eventNames.push("click");
                Object.assign(DomeventPointer.eventMapping, {"click":"onClick"});
            }
        }
        return DomeventPointer;
    },

    initialize : function( ){
        let _this = this; 

        this.stateMouse = this.stateMouse || {};
        this.stateMouse.mousedown = false;
    
        this._onMove            = function(){ _onMove.apply( _this, arguments ); };  
        this._onMouseEvent      = function(){ _onMouseEvent.apply( _this, arguments ); };

        this._$onPointerDown	= function(){ _onPointerDown.apply( _this, arguments ); };
	    this._$onPointerUp	    = function(){ _onPointerUp.apply( _this, arguments ); };
  

        this._$onPointerMove	= function(){ _onPointerMove.apply(_this, arguments);	};

        if ( emulateClick ){
            this._$onClick      = function(){ _onClick.apply( _this, arguments ); }
        }
    },

    enable : function(){ 

        this._domElement.addEventListener( 'pointerdown', this._$onPointerDown, false );
        this._domElement.addEventListener( 'pointerup', this._$onPointerUp, false );

        this._domElement.addEventListener( 'pointermove'	, this._$onPointerMove	, false );
    },

    disable : function(){
        
        this._domElement.removeEventListener( 'pointerdown'	, this._$onMouseDown	, false );
        this._domElement.removeEventListener( 'pointerup'	, this._$onMouseUp		, false );
        
        this._domElement.removeEventListener( 'pointermove'	, this._$onMouseMove	, false );
    }
};

export default DomeventPointer;
export { DomeventPointer };