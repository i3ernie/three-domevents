import { Vector3 } from '../../three/build/three.module.js';

var getRelativeMouseXY = function( domEvent ) {

	var element = domEvent.target || domEvent.srcElement;

	if (element.nodeType === 3) {
		element = element.parentNode; // Safari fix -- see http://www.quirksmode.org/js/events_properties.html
	}

	//get the real position of an element relative to the page starting point (0, 0)
	//credits go to brainjam on answering http://stackoverflow.com/questions/5755312/getting-mouse-position-relative-to-content-area-of-an-element
	var elPosition	= { x : 0 , y : 0};
	var tmpElement	= element;
	//store padding
	var style	= getComputedStyle(tmpElement, null);
	elPosition.y += parseInt(style.getPropertyValue("padding-top"), 10);
	elPosition.x += parseInt(style.getPropertyValue("padding-left"), 10);

	//add positions
	do {
		elPosition.x	+= tmpElement.offsetLeft;
		elPosition.y	+= tmpElement.offsetTop;
		style		= getComputedStyle(tmpElement, null);

		elPosition.x	+= parseInt(style.getPropertyValue("border-left-width"), 10);
		elPosition.y	+= parseInt(style.getPropertyValue("border-top-width"), 10);

		tmpElement = tmpElement.offsetParent;
	} while( tmpElement );

	var elDimension	= {
		width	: (element === window) ? window.innerWidth	: element.offsetWidth,
		height	: (element === window) ? window.innerHeight	: element.offsetHeight
	};

	if ( domEvent.type === "touchend" || domEvent.type === "touchstart" ){
		return {
			x : +((domEvent.changedTouches[ 0 ].pageX - elPosition.x) / elDimension.width ) * 2 - 1,
			y : -((domEvent.changedTouches[ 0 ].pageY - elPosition.y) / elDimension.height) * 2 + 1
		};
	}
	else {
		return {
			x : +((domEvent.pageX - elPosition.x) / elDimension.width ) * 2 - 1,
			y : -((domEvent.pageY - elPosition.y) / elDimension.height) * 2 + 1
		};
	}
};

var CLICK_TIMEOUT = 500;

var _onMouseDown	= function( event ){
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

var _onMouseUp	= function( event ){
    
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

/********************************************************************************/
/*		onMove								*/
/********************************************************************************/

// # handle mousemove kind of events

var _onMove = function( eventName, mouseX, mouseY, origDomEvent )
{
    //console.log('eventName', eventName, 'boundObjs', this._boundObjs[eventName])
    // get objects bound to this event
    var boundObjs	= this._boundObjs[eventName];
    if( boundObjs === undefined || boundObjs.length === 0 )	{ return; }

    // compute the intersection
    var vector = new Vector3( mouseX, mouseY, 0.5 );
    this._ray.setFromCamera( vector, this._camera );

    var intersects = null;
    try {
        intersects  = this._ray.intersectObjects( boundObjs );
    } catch( e ){
        this.clean();
        this._onMove( eventName, mouseX, mouseY, origDomEvent );
        return;
    }

    var oldSelected	= this._selected;
    var notifyOver, notifyOut, notifyMove;
    var intersect;
    var newSelected;
    var i = 0;
    var doIntersect = true;

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
            doIntersect = this._notify('mousemove', newSelected, origDomEvent, intersect);
        }
        // notify mouseEnter - done at the end with a copy of the list to allow callback to remove handlers
        if (notifyOver) {
            this._notify('mouseover', newSelected, origDomEvent, intersect);
        }
        // notify mouseLeave - done at the end with a copy of the list to allow callback to remove handlers
        if (notifyOut) {
            this._notify('mouseout' , oldSelected, origDomEvent, intersect);
        }
       
    }
};


var _onClick = function( event )
{
    // TODO handle touch ? 
    if ( this.timeStamp !== null && (event.timeStamp - this.timeStamp) > CLICK_TIMEOUT ){
        return;
    }
    this.timeStamp = null;
    _onMouseEvent.call(this, 'click', event );
};

var _onDblClick = function( event )
{
    // TODO handle touch ?
    _onMouseEvent.call(this, 'dblclick', event);
};


/************************************************/
/*		handle mouse events						*/
/************************************************/
// # handle mouse events

var _onMouseEvent	= function( eventName, domEvent )
{
    var mouseCoords = getRelativeMouseXY( domEvent );
    this._onEvent(eventName, mouseCoords.x, mouseCoords.y, domEvent);
};

var _onMouseMove	= function( domEvent )
{
    var mouseCoords = getRelativeMouseXY( domEvent );
    
    _onMove.call(this, 'mousemove', mouseCoords.x, mouseCoords.y, domEvent);
    _onMove.call(this, 'mouseover', mouseCoords.x, mouseCoords.y, domEvent);
    _onMove.call(this, 'mouseout' , mouseCoords.x, mouseCoords.y, domEvent);
};


var _onContextmenu = function( event )
{
    //TODO don't have a clue about how this should work with touch..
    _onMouseEvent.call(this, 'contextmenu', event);
};





var DomeventClick = {

    eventNames : [
        "mousedown",
        "mouseup",


        "mousemove",
	    "contextmenu",
        
        "click",
        "dblclick"
    ],

    eventMapping : {
        "mousedown"     : "onMousedown",
        "mouseup" 	    : "onMouseup",

        "mousemove"     : "onMousemove",
        "click"         : "onClick"
    },

    initialize : function( ){
        var _this = this; 

        
        this.stateMouse = this.stateMouse || {};
        this.stateMouse.mousedown = false;
    
        this._onMove = function(){ _onMove.apply( _this, arguments ); };  
        this._onMouseEvent = function(){ _onMouseEvent.apply( _this, arguments ); };

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
//# sourceMappingURL=DomeventMouse.es.js.map
