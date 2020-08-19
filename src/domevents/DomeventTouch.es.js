
/** @namespace */
let TOUCH_TIMER;
let TOUCH_BEGIN, TOUCH_LATEST = 0;
let TOUCH_POSX, TOUCH_POSY;

let TOUCH_duration = 500;
const TOUCH_MS = 200;

const _onTouchEnd = function( event ) {
    const TOUCH_END = new Date().getTime();
    const time = TOUCH_END - TOUCH_BEGIN;
    const timesince = TOUCH_END - TOUCH_LATEST;
    let evt;

    if (event.touches.length > 1) {
        return;
    }

    if (TOUCH_TIMER) {
        clearTimeout(TOUCH_TIMER);
    }

    if( timesince < 500 && timesince > 0 ){
        evt = new MouseEvent("dblclick", {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: TOUCH_POSX,
            clientY: TOUCH_POSY,
            offsetX: TOUCH_POSX,
            offsetY: TOUCH_POSY,
            pageX: TOUCH_POSX,
            pageY: TOUCH_POSY
        });
        event.target.dispatchEvent(evt);
        TOUCH_LATEST = new Date().getTime();
        return this._onMouseEvent('mouseup', event);
    } else {

        if (time <= TOUCH_MS) {
            evt = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: TOUCH_POSX,
                clientY: TOUCH_POSY,
                offsetX: TOUCH_POSX,
                offsetY: TOUCH_POSY,
                pageX: TOUCH_POSX,
                pageY: TOUCH_POSY
            });
            event.target.dispatchEvent(evt);
            TOUCH_LATEST = new Date().getTime();
            return this._onMouseEvent('mouseup', event);
        }
        else {
            TOUCH_LATEST = new Date().getTime();
            return _onTouchEvent.call(this, 'mouseup', event);
        }
    }
};

const _onTouchStart	= function( event ){

    TOUCH_BEGIN = new Date().getTime();

    TOUCH_POSX = event.touches[0].clientX;
    TOUCH_POSY = event.touches[0].clientY;

    TOUCH_TIMER = setTimeout(onlongtouch, TOUCH_duration);

    return _onTouchEvent.call(this, 'mousedown', event);
};




/************************************************/
/*		handle touch events						*/
/************************************************/
// # handle touch events


const _onTouchMove = function( domEvent )
{
    if( domEvent.touches.length !== 1 )	return;

    domEvent.preventDefault();
    let mouseX	= +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
    let mouseY	= -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;

    this._onMove('mousemove', mouseX, mouseY, domEvent);
    this._onMove('mouseover', mouseX, mouseY, domEvent);
    this._onMove('mouseout' , mouseX, mouseY, domEvent);
};

const _onTouchEvent = function( eventName, domEvent )
{
    if( domEvent.touches.length !== 1 )	return;

    domEvent.preventDefault();

    let mouseX	= +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
    let mouseY	= -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
    this._onEvent(eventName, mouseX, mouseY, domEvent);
};

const onlongtouch = function() {
    //console.log("longtouch");
};



const DomeventTouch = {
    
    eventNames : [
        "touchstart",
	    "touchend"
    ],

    eventMapping : {
        
    },

    initialize : function( ){
        let _this = this; 

        this._$onTouchStart	= function(){ _onTouchStart.apply(_this, arguments);	};
        this._$onTouchEnd = function(){ _onTouchEnd.apply(_this, arguments);	};
        
        this._$onTouchMove	= function(){ _onTouchMove.apply(_this, arguments);	};
    },

    enable : function(){ 
        this._domElement.addEventListener( 'touchstart'	, this._$onTouchStart	, false );
        this._domElement.addEventListener( 'touchend'	, this._$onTouchEnd		, false );
        this._domElement.addEventListener( 'touchmove'	, this._$onTouchMove	, false );
    },

    disable : function(){
        this._domElement.removeEventListener( 'touchstart'	, this._$onTouchStart	, false );
        this._domElement.removeEventListener( 'touchend'	, this._$onTouchEnd		, false );
        this._domElement.removeEventListener( 'touchmove'	, this._$onTouchMove	, false );
    }
};

export default DomeventTouch;
export { DomeventTouch };