define(['exports', 'three'], function (exports, three_module_js) { 'use strict';

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
	    var vector = new three_module_js.Vector3( mouseX, mouseY, 0.5 );
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

	    if( intersects.length > 0 ){
	        intersect	= intersects[ 0 ];
	        newSelected	= intersect.object;

	        this._selected	= newSelected;
	        // if newSelected bound mousemove, notify it
	        notifyMove	= this._bound('mousemove', newSelected);

	        if( oldSelected !== newSelected ){
	            // if newSelected bound mouseenter, notify it
	            notifyOver	= this._bound('mouseover', newSelected);
	            // if there is a oldSelect and oldSelected bound mouseleave, notify it
	            notifyOut	= oldSelected && this._bound('mouseout', oldSelected);
	        }
	    }else {
	        // if there is a oldSelect and oldSelected bound mouseleave, notify it
	        notifyOut	= oldSelected && this._bound('mouseout', oldSelected);
	        this._selected	= null;
	    }

	    // notify mouseMove - done at the end with a copy of the list to allow callback to remove handlers
	    notifyMove && this._notify('mousemove', newSelected, origDomEvent, intersect);
	    // notify mouseEnter - done at the end with a copy of the list to allow callback to remove handlers
	    notifyOver && this._notify('mouseover', newSelected, origDomEvent, intersect);
	    // notify mouseLeave - done at the end with a copy of the list to allow callback to remove handlers
	    notifyOut  && this._notify('mouseout' , oldSelected, origDomEvent, intersect);
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
	        var _this = this; 

	        
	        this.stateMouse = this.stateMouse || {};
	        this.stateMouse.mousedown = false;
	    
	        this._onMove = function(){ _onMove.apply( _this, arguments ); };  

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

	/** @namespace */
	var TOUCH_TIMER;
	var TOUCH_BEGIN, TOUCH_LATEST = 0;
	var TOUCH_POSX, TOUCH_POSY;

	var TOUCH_duration = 500;
	var TOUCH_MS = 200;

	var _onTouchEnd = function( event ) {
	    var TOUCH_END = new Date().getTime();
	    var time = TOUCH_END - TOUCH_BEGIN;
	    var timesince = TOUCH_END - TOUCH_LATEST;
	    var evt;

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

	var _onTouchStart	= function( event ){

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


	var _onTouchMove = function( domEvent )
	{
	    if( domEvent.touches.length !== 1 )	{ return; }

	    domEvent.preventDefault();
	    var mouseX	= +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
	    var mouseY	= -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;

	    this._onMove('mousemove', mouseX, mouseY, domEvent);
	    this._onMove('mouseover', mouseX, mouseY, domEvent);
	    this._onMove('mouseout' , mouseX, mouseY, domEvent);
	};

	var _onTouchEvent = function( eventName, domEvent )
	{
	    if( domEvent.touches.length !== 1 )	{ return; }

	    domEvent.preventDefault();

	    var mouseX	= +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
	    var mouseY	= -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;
	    this._onEvent(eventName, mouseX, mouseY, domEvent);
	};

	var onlongtouch = function() {
	    //console.log("longtouch");
	};



	var DomeventTouch = {
	    
	    eventNames : [
	        "touchstart",
		    "touchend"
	    ],

	    eventMapping : {
	        
	    },

	    initialize : function( ){
	        var _this = this; 

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

	/** This THREEx helper makes it easy to handle the mouse events in your 3D scene

	   * CHANGES NEEDED
	   * handle drag/drop
	   * notify events not object3D - like DOM
	   * so single object with property

	// # Lets get started
	//
	// First you include it in your page
	//
	// ```<script src='threex.domevent.js'></script>```
	//
	// # use the object oriented api
	//
	// You bind an event like this
	//
	// ```mesh.on('click', function(object3d){ ... })```
	//
	// To unbind an event, just do
	//
	// ```mesh.off('click', function(object3d){ ... })```
	//
	// As an alternative, there is another naming closer DOM events.
	// Pick the one you like, they are doing the same thing
	//
	// ```mesh.addEventListener('click', function(object3d){ ... })```
	// ```mesh.removeEventListener('click', function(object3d){ ... })```
	//
	// # Supported Events
	//
	// Always in a effort to stay close to usual pratices, the events name are the same as in DOM.
	// The semantic is the same too.
	// Currently, the available events are
	// [click, dblclick, mouseup, mousedown](http://www.quirksmode.org/dom/events/click.html),
	// [mouseover and mouse out](http://www.quirksmode.org/dom/events/mouseover.html).
	//
	//
	// First, you instanciate the object
	//
	// ```var domEvent = new DomEvent();```
	//
	// Then you bind an event like this
	//
	// ```domEvent.bind(mesh, 'click', function(object3d){ object3d.scale.x *= 2; });```
	//
	// To unbind an event, just do
	//
	// ```domEvent.unbind(mesh, 'click', callback);```
	//
	//
	// # Code

	 */

		/** @namespace */
	var extensions = [];


	// # Constructor
	var DomEvents = function( camera, domElement )
	{
		this._camera		= camera || null;
		this._domElement 	= domElement || document;
		this._ray 			= new three_module_js.Raycaster();
		this._selected		= null;
		this._boundObjs		= {};
		this.enabled = false;
		// Bind dom event for mouse and touch
		var _this			= this;
		this.firstClick 	= false;
		this.delay = 300;

		this.timeStamp = null;

		
		this.onRemove = function(){ _this.removeFromDom.apply( _this, arguments ); };
		this.onAdd = function(){ _this.addToDom.apply( _this, arguments ); };

		extensions.forEach(function( ext ){
			ext.initialize.apply( _this, arguments );
		});
		DomEvents.eventNames.forEach(function( eventName ){
			_this._boundObjs[eventName]	= [];
		});
		

		this.enable();
	};

	DomEvents.eventNames = [
		"mouseover",
		"mouseout",
		
	    "mousemiddledown",
	    "mouserightdown",
	    "mousemiddleup",
	    "mouserightup"
	];

	DomEvents.eventMapping = {
		"mouseover" : "onMouseover",
		"mouseout" 	: "onMouseout",
		"dblclick"  : "onDblclick"
	};

	DomEvents.extend = function( obj ) {
		extensions.push( obj );

		Object.assign( DomEvents.eventMapping, obj.eventMapping );
		DomEvents.eventNames = DomEvents.eventNames.concat( obj.eventNames );
	};

	DomEvents.extend( DomeventClick );
	DomEvents.extend( DomeventTouch );
	//

	DomEvents.hasEvent = function( eventName ) {
		return DomEvents.eventNames.indexOf( eventName ) !== -1;
	};

	Object.assign( DomEvents.prototype,  {

		enable : function() {

			var scope = this;

			extensions.forEach(function( ext ) {
				ext.enable.apply( scope, arguments );
			});

			this.enabled = true;
		},

		disable : function(){

			extensions.forEach(function( ext ) {
				ext.disable.apply( this, arguments );
			});

			this.enabled = false;
		},

		// # Destructor
		destroy	: function()
		{
			// unBind dom event for mouse and touch
			this.disable();
		},


		/********************************************************************************/
		/*		domevent context						*/
		/********************************************************************************/

		// handle domevent context in object3d instance

		_objectCtxInit	: function( object3d ) {
			object3d._3xDomEvent = {};

			DomEvents.eventNames.forEach(function( eventName ){
				object3d._3xDomEvent[eventName]	= [];
			});
		},
		_objectCtxDeinit : function( object3d ) {
			delete object3d._3xDomEvent;
		},
		_objectCtxIsInit : function( object3d ) {
			return !!object3d._3xDomEvent;
		},
		_objectCtxGet : function( object3d ) {
			return object3d._3xDomEvent;
		},
		/********************************************************************************/
		/*										*/
		/********************************************************************************/


		/**
		 * Getter/Setter for camera
		 */
		camera : function( value )
		{
			if( value )	{ this._camera = value; }
			return this._camera;
		},

		addEventListener : function( object3d, eventName, callback, opt ) {
			opt = opt || {};

			var _this = this;

			var useCapture = opt.useCapture || false;
			var scope = this;

			extensions.forEach(function( ext ){ 
				if ( ext.addEventListener ) { ext.addEventListener.call( _this, object3d, eventName, callback, opt ); }
			});

			if ( typeof eventName === "object" ) {
				for ( var i = 0; i < eventName.length; i++ ){
					this.bind( object3d, eventName[i], callback, useCapture );
				}
			} else {
				this.bind( object3d, eventName, callback, useCapture );
			}

			if ( opt.recursive ) {
				_.each( object3d.children, function( object3d ){
					scope.addEventListener( object3d, eventName, callback, opt );
				});
			}
		},

		hasListener : function( object3d, eventName ) {
			var objectCtx = this._objectCtxGet( object3d );
			if ( !objectCtx ) { return false; }
			
			var listener = objectCtx[eventName+'Handlers'];
			if ( !listener ) { return false; }

			return (listener.length > 0);
		},

		bind : function( object3d, eventName, callback, useCapture )
		{
			if ( !DomEvents.hasEvent( eventName ) ) {
				console.warn( "not available events: "+eventName, object3d );
				return;
			}

			if( !this._objectCtxIsInit( object3d ) ){	
				this._objectCtxInit( object3d );
			}

			var objectCtx = this._objectCtxGet( object3d );
			if( !objectCtx[eventName+'Handlers'] )	{ objectCtx[eventName+'Handlers']	= []; }

			objectCtx[eventName+'Handlers'].push({
				callback	: callback,
				useCapture	: useCapture
			});

			// add this object in this._boundObjs
			if( this._boundObjs[eventName] === undefined ){
				this._boundObjs[eventName]	= [];
			}
			if ( this._boundObjs[eventName].indexOf( object3d ) === -1 ){
				this._boundObjs[eventName].push( object3d );
			}
		},

		removeEventListener	: function( object3d, eventName, callback, useCapture ) {
			
			if ( eventName === null || eventName === undefined ){
				eventName = DomEvents.eventNames;
				return;
			}
			if ( typeof eventName == "object"){
				for ( var i = 0; i<eventName.length; i++){
					this.unbind(object3d, eventName[i], callback, useCapture);
				}
				return;
			}
			this.unbind (object3d, eventName, callback, useCapture);
		},

		unbind : function( object3d, eventName, callback, useCapture )
		{
			if ( typeof eventName !== "string" ) {
				console.error( "ERROR: DomEvents:unbind eventName must be a string" );
				return;
			}

			console.assert( DomEvents.hasEvent( eventName ), "not available events:"+eventName );

			var boundObjs = this._boundObjs[eventName];
			if (boundObjs == undefined) {
				return;
			}

			if( !this._objectCtxIsInit(object3d) )	{ this._objectCtxInit(object3d); }

			var objectCtx	= this._objectCtxGet( object3d );
			if( !objectCtx[eventName+'Handlers'] )	{ return; }

			var handlers = objectCtx[eventName+'Handlers'];

			if ( typeof callback !== "function" ) {   // kill all events of this type
				objectCtx[eventName+'Handlers'] = [];

				var index$1 = boundObjs.indexOf( object3d );
				if ( index$1 > -1 ) {
					boundObjs.splice( index$1, 1 );
				}
				return;
			}

			for( var i = 0; i < handlers.length; i++ ) {
				var handler	= handlers[i];

				if( callback !== handler.callback )	{ continue; }
				if( useCapture !== handler.useCapture )	{ continue; }
				handlers.splice(i, 1);
				break;
			}

			// from this object from this._boundObjs
			var index = boundObjs.indexOf( object3d );
			if ( index === -1 ) {
				return;
			}

			boundObjs.splice( index, 1 );
			this.clean();

		},

		removeFromDom : function( object3d, opt ) {

			var options = Object.assign({recursive : true}, opt);
			var scope = this;

			if ( !( object3d instanceof three_module_js.Object3D ) ){

				if ( object3d.target ) {
					object3d= object3d.target;
				} else {
					console.warn("object3d is not instance of THREE.Object3D");
					return;
				}
			}

			function _remove( obj ){

				if ( obj._3xDomEvent ) {
					scope._objectCtxDeinit( obj );
				}

				var index;
				var boundObjs;

				DomEvents.eventNames.forEach( function( eventName ) {

					boundObjs = scope._boundObjs[eventName];

					if( boundObjs ) {

						index = boundObjs.indexOf( obj );

						while ( index > -1 ) {

							boundObjs.splice( index, 1 );
							index = boundObjs.indexOf( obj );
						}
					}
				});
				
				//das ganze fuer alle kinder 
				if ( options.recursive && obj.children.length > 0 ) {

					obj.children.forEach( function( child ){
						_remove( child );
					});
				}
			}
			
			//und los gehts aufraeumen...
			_remove( object3d );
		
		},

		/**
		 * 
		 * @param {*} object3d 
		 * @param {recursive, useCapture} opt 
		 * all dom events like 'click' will be triggert to the object3d
		 * and can be catched with i.e.
		 * object3d.addEventListener('click', function( ev ){ ... });
		 * or just define a 'onClick' function in the object3d
		 * object3d.onClick = function( ev ){ ... };
		 * this function will be autom. bound to the 'click' event
		 */
		addToDom : function( object3d, opt ){

			var options = Object.assign({recursive : true, useCapture: false, bindFunctions : true}, opt);
			var scope = this;

			if ( object3d.type !== "Mesh" && object3d.type !== "Object3D" ){

				//event object?
				if ( object3d.target ) {
					object3d = object3d.target;
				} else {
					console.warn("object3d is nit instance of THREE.Object3D", object3d );
					return;
				}
			}

			function add ( obj ){

				if( obj.userData.preventDomevents ) { return; }

				DomEvents.eventNames.forEach( function( eventName ) {

					if( scope.hasListener( obj, eventName ) ) { return; }

					scope.bind( obj, eventName, eventName, false );
					
					if ( options.bindFunctions && 
						DomEvents.eventMapping[eventName] && 
						typeof obj[ DomEvents.eventMapping[eventName] ] === "function" ) 
					{	
						scope.bind( obj, eventName, obj[DomEvents.eventMapping[eventName]], options.useCapture );
					}

				});

				if ( options.recursive && obj.children.length > 0 ) {
					obj.children.forEach( function( child ){
						add( child );
					});
				}
			}

			//start register all known events
			add( object3d );
		},

		removeMappedListener :function ( object3d ){
			var scope = this;

			for ( var key in DomEvents.eventMapping ){
				this.removeEventListener( object3d, key);
			}
			if ( object3d.children.length > 0 ){
				object3d.children.forEach( function( el ){
					scope.removeMappedListener( el );
				});
			}
		},

		activate : function( object3d, opt ){
			var options = Object.assign({observe:true}, opt);

			
			this.addToDom( object3d, opt );
			
			if ( options.observe ) {
				this._observe( object3d );
			}
		},

		deactivate : function( object3d ) {
			var scope = this;

			if ( object3d._previousFunctions ){
				if ( typeof object3d._previousFunctions.add === "function") { 
					object3d.add = object3d._previousFunctions.add;
				}
				if ( typeof object3d._previousFunctions.remove === "function") {
					object3d.remove = object3d._previousFunctions.remove;
				}
			}

			if( object3d.children.length > 0 ){ 
				object3d.children.forEach( function( child ){ 
					scope.deactivate( child );
				});
			}
		},

		_observe : function( object3d ){

			var scope = this;

			if ( ! object3d._previousFunctions ) {
				object3d._previousFunctions = {};
			}

			object3d._previousFunctions.add = object3d.add;
			object3d.add = function( child ){

				scope.activate( child );
				
				object3d._previousFunctions.add.apply( object3d, arguments );
			};
			
			object3d._previousFunctions.remove = object3d.remove;
			object3d.remove = function( child ){

				scope.deactivate( child );

				scope.removeFromDom( child );

				object3d._previousFunctions.remove.apply( object3d, arguments );
			};

			//wenn kindelemente vorhanden
			if( object3d.children.length > 0 ){ 

				object3d.children.forEach(function( child ){ 
					scope._observe( child );
				});
			}
			
		},

		clean : function( )
		{
			var a;
			var eventName;
			var boundObjs;

			for( var i = 0; i < DomEvents.eventNames.length; i++ ) {
				eventName = DomEvents.eventNames[i];
				boundObjs = this._boundObjs[eventName];
				a = [];

				if (boundObjs){
					for ( var i$1 = 0, l = boundObjs.length; i$1 < l; i$1 ++ ) {

						if ( boundObjs[i$1].geometry ) { a.push(boundObjs[i$1]); }

					}
					this._boundObjs[eventName] = a;
				}
			}
		},

		_bound	: function( eventName, object3d )
		{
			var objectCtx = this._objectCtxGet( object3d );
			if( !objectCtx ) { return false; }
			return !!objectCtx[eventName+'Handlers'];
		},



		/********************************************************************************/
		/*		onEvent								*/
		/********************************************************************************/

		// # handle click kind of events

		_onEvent	: function( eventName, mouseX, mouseY, origDomEvent )
		{
		//console.log('eventName', eventName, 'boundObjs', this._boundObjs[eventName])
			// get objects bound to this event
			var boundObjs	= this._boundObjs[eventName];
			if( boundObjs === undefined || boundObjs.length === 0 )	{ return; }
			// compute the intersection
			var vector	= new three_module_js.Vector3( mouseX, mouseY, 0.5 );
			this._ray.setFromCamera( vector, this._camera );

			var intersects = null;
			try {
				intersects  = this._ray.intersectObjects( boundObjs );
			} catch( e ){
				this.clean();
				this._onMove( eventName, mouseX, mouseY, origDomEvent );
				return;
			}

			//console.log("RHinter ",eventName, " ", intersects );


			// if there are no intersections, return now
			if( intersects.length === 0 ) {
				return;
			}
			// init some vairables
			var intersect	= intersects[0];
			var object3d	= intersect.object;
			var objectCtx	= this._objectCtxGet(object3d);
			if( !objectCtx )	{ return; }

			// notify handlers
			if ( !object3d.geometry ){
				return;
			}

			this._notify(eventName, object3d, origDomEvent, intersect);
		},

		_notify	: function( eventName, object3d, origDomEvent, intersect )
		{
			var objectCtx	= this._objectCtxGet( object3d );
			var handlers	= objectCtx ? objectCtx[eventName+'Handlers'] : null;

			// parameter check
			console.assert( arguments.length === 4 );

			// if no handler do bubbling
			if( !objectCtx || !handlers || handlers.length === 0 ){ 
				if ( object3d.parent ) { this._notify( eventName, object3d.parent, origDomEvent, intersect ); }
				return;
			}

			// notify all handlers
			handlers = objectCtx[eventName+'Handlers'];
			var toPropagate	= true;
			var capture = false;

			var stopPropagation = function () {
				toPropagate = false;
			};
			var preventDefault = function() {
				capture = true;
			};
			
			for( var i = 0; i < handlers.length; i++ ) {

				var handler	= handlers[i];

				capture = handler.useCapture;
				if ( typeof handler.callback === "function") { 
					handler.callback({
						type: eventName,
						target: object3d,
						origDomEvent: origDomEvent,
						intersect: intersect,
						stopPropagation: stopPropagation,
						preventDefault : preventDefault
					});
				}
				else if ( typeof handler.callback === "string" && typeof object3d.dispatchEvent === "function" ) {
					object3d.dispatchEvent( {
						type: handler.callback,
						target: object3d,
						origDomEvent: origDomEvent,
						intersect: intersect,
						stopPropagation: stopPropagation,
						preventDefault : preventDefault
					});
				}
				
				if( capture ){ 
					break;
				}
			}

			// do bubbling
			if( toPropagate && object3d.parent ) {
				this._notify( eventName, object3d.parent, origDomEvent, intersect );
			}
		}

	});

	exports.DomEvents = DomEvents;
	exports.default = DomEvents;

	Object.defineProperty(exports, '__esModule', { value: true });

});
//# sourceMappingURL=domevents.amd.js.map
