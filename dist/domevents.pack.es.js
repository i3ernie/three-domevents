import { Raycaster, Object3D, Vector3 } from '../../three/build/three.module.js';

const defaults = {
	"defaultEventGroup" : "_default"
};

const Eventgroups = {
    interface : {
        addEventGroup : function( name ) {

            if ( defaults.defaultEventGroup === name ){
                console.warn( "no valid name!" );
                return this;
            }
            if ( this._boundDomEvents[name] ) {
                console.warn( "event group allready exists!" );
                return this;
            }
    
            this._boundDomEvents[name] = {};
            this._boundObjsGroup[name] = {};

            
            return this;
        },
        
        deleteEventGroup : function( name ){
            delete this._boundDomEvents[name];
        },
    
        switchEventGroup : function( name ) {
            if ( this._boundDomEvents[name] ) {
                this.aktEventGroupName = name;
                this.aktEventGroup = this._boundDomEvents[name];
                this._boundObjs = this._boundObjsGroup[name];
            }
            return this;
        },
        
        resetEventGroup : function() {
            let name = defaults.defaultEventGroup;
            
            this.aktEventGroupName = name;
            this.aktEventGroup = this._boundDomEvents[name];
            this._boundObjs = this._boundObjsGroup[name];
    
            return this;
        },
        
        hasEventGroup : function( name ){
            return this._boundDomEvents.hasOwnProperty( name );
        },
    
        getEventGroupName : function(){
            return this.aktEventGroupName;
        }
    },
    initialize : function( name ){
        name = name || defaults.defaultEventGroup;
        this._boundDomEvents = {};
        this._boundObjsGroup = {};
    
        this._boundDomEvents[name] = {};
        this._boundObjsGroup[name] = {};
    
        
        this.aktEventGroupName = name;

        this.aktEventGroup = this._boundDomEvents[name];
        this._boundObjs = this._boundObjsGroup[name];

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
const extensions = [];

const _addEvents = function ( obj, options ) {
	let scope = this;

	if( obj.userData.preventDomevents ) {
		return;
	}

	DomEvents.eventNames.forEach( function( eventName ) {

		if( scope.hasListener( obj, eventName ) ) {
			return;
		}

		scope.bind( obj, eventName, eventName, false );
		
		if ( options.bindFunctions && 
			DomEvents.eventMapping[eventName] && 
			typeof obj[ DomEvents.eventMapping[eventName] ] === "function" ) 
		{	
			scope.bind( obj, eventName, obj[DomEvents.eventMapping[eventName]].bind(obj), options.useCapture );
		}

	});

	if ( options.recursive && obj.children.length > 0 ) {
		obj.children.forEach( function( child ){
			_addEvents.call(scope, child, options );
		});
	}
};

const _removeEvents = function( obj, options ){

	let scope = this;

	if ( this._objectCtxIsInit( obj ) ) {
		this._objectCtxDeinit( obj );
	}

	let index;
	let boundObjs;

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

		obj.children.forEach( function( child ) {
			_removeEvents.call( scope, child, options );
		});
	}
};


// # Constructor
const DomEvents = function( camera, domElement )
{
	this._camera		= camera || null;
	this._domElement 	= domElement || document;
	this._ray 			= new Raycaster();
	this._selected		= null;
	this._boundObjs		= {};
	this.enabled = false;
	
	// Bind dom event for mouse and touch
	let _this			= this;
	this.firstClick 	= false;
	this.delay = 300;


	Eventgroups.initialize.call( this );

	this.timeStamp = null;
	
	this.onRemove = function(){ _this.removeFromDom.apply( _this, arguments ); };
	this.onAdd = function(){ _this.addToDom.apply( _this, arguments ); };

	//init extensions
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

//DomEvents.extend( DomeventClick );
//DomEvents.extend( DomeventTouch );
//

DomEvents.hasEvent = function( eventName ) {
	return DomEvents.eventNames.indexOf( eventName ) !== -1;
};

Object.assign( DomEvents.prototype, Eventgroups.interface, {

	enable : function() {

		let scope = this;

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
		let scope = this;
		this.aktEventGroup[object3d.id] = {};


		DomEvents.eventNames.forEach( function( eventName ){
			scope.aktEventGroup[object3d.id][eventName] = [];

		});
	},
	_objectCtxDeinit : function( object3d ) {
		delete this.aktEventGroup[object3d.id];
	},
	_objectCtxIsInit : function( object3d ) {
		return !!this.aktEventGroup[object3d.id];
	},
	_objectCtxGet : function( object3d ) { 
		return this.aktEventGroup[object3d.id];
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

		let _this = this;

		let useCapture = opt.useCapture || false;
		let scope = this;

		extensions.forEach(function( ext ){ 
			if ( ext.addEventListener ) { ext.addEventListener.call( _this, object3d, eventName, callback, opt ); }
		});

		if ( typeof eventName === "object" ) {
			for ( let i = 0; i < eventName.length; i++ ){
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
		let objectCtx = this._objectCtxGet( object3d );
		if ( !objectCtx ) { return false; }
		
		let listener = objectCtx[eventName+'Handlers'];
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

		let objectCtx = this._objectCtxGet( object3d );
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
			for ( let i = 0; i<eventName.length; i++){
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

		let boundObjs = this._boundObjs[eventName];
		if (boundObjs == undefined) {
			return;
		}

		if( !this._objectCtxIsInit(object3d) )	{ this._objectCtxInit(object3d); }

		let objectCtx	= this._objectCtxGet( object3d );
		if( !objectCtx[eventName+'Handlers'] )	{ return; }

		let handlers = objectCtx[eventName+'Handlers'];

		if ( typeof callback !== "function" ) {   // kill all events of this type
			objectCtx[eventName+'Handlers'] = [];

			let index = boundObjs.indexOf( object3d );
			if ( index > -1 ) {
				boundObjs.splice( index, 1 );
			}
			return;
		}

		for( let i = 0; i < handlers.length; i++ ) {
			let handler	= handlers[i];

			if( callback !== handler.callback )	{ continue; }
			if( useCapture !== handler.useCapture )	{ continue; }
			handlers.splice(i, 1);
			break;
		}

		// from this object from this._boundObjs
		let index = boundObjs.indexOf( object3d );
		if ( index === -1 ) {
			return;
		}

		boundObjs.splice( index, 1 );
		this.clean();

	},

	removeFromDom : function( object3d, opt ) {

		let defaults = {
			recursive : true
		};

		if ( !( object3d instanceof Object3D ) ){

			if ( object3d.target ) {
				object3d= object3d.target;
			} else {
				console.warn("object3d is not instance of THREE.Object3D");
				return;
			}
		}

		
		//und los gehts aufraeumen...
		_removeEvents.call(this, object3d, Object.assign({}, defaults, opt ) );
	
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

		const defaults = {
			recursive : true, 
			useCapture: false, 
			bindFunctions : true
		};

		if ( !( object3d instanceof Object3D ) ) {

			//event object?
			if ( object3d.target ) {
				object3d = object3d.target;
			} else {
				console.warn("object3d is nit instance of THREE.Object3D", object3d );
				return;
			}
		}

		//start register all known events
		_addEvents.call(this, object3d, Object.assign({}, defaults, opt ) );
	},

	removeMappedListener :function ( object3d ){
		let scope = this;

		for ( let key in DomEvents.eventMapping ){
			this.removeEventListener( object3d, key);
		}
		if ( object3d.children.length > 0 ){
			object3d.children.forEach( function( el ){
				scope.removeMappedListener( el );
			});
		}
	},

	activate : function( object3d, opt ){

		let options = Object.assign({observe:true}, opt);
		
		this.addToDom( object3d, opt );
		
		if ( options.observe ) {
			this._observe( object3d );
		}
	},

	deactivate : function( object3d ) {
		let scope = this;

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

		let scope = this;

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
		let a;
		let eventName;
		let boundObjs;

		for( let i = 0; i < DomEvents.eventNames.length; i++ ) {
			eventName = DomEvents.eventNames[i];
			boundObjs = this._boundObjs[eventName];
			a = [];

			if (boundObjs){
				for ( let i = 0, l = boundObjs.length; i < l; i ++ ) {

					if ( boundObjs[i].geometry ) { a.push(boundObjs[i]); }

				}
				this._boundObjs[eventName] = a;
			}
		}
	},

	_bound	: function( eventName, object3d )
	{
		let objectCtx = this._objectCtxGet( object3d );
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
		let boundObjs	= this._boundObjs[eventName];
		let i = 0;

		if( boundObjs === undefined || boundObjs.length === 0 )	{ return; }
		// compute the intersection
		let vector	= new Vector3( mouseX, mouseY, 0.5 );
		this._ray.setFromCamera( vector, this._camera );

		let intersects = null;
		try {
			intersects  = this._ray.intersectObjects( boundObjs );
		} catch( e ){
			this.clean();
			this._onMove( eventName, mouseX, mouseY, origDomEvent );
			return;
		}
		
		// if there are no intersections, return now
		if( intersects.length === 0 ) {
			return;
		}
		
		// init some vairables
		let intersect	= intersects[0];
		let object3d	= intersect.object;
		let objectCtx	= this._objectCtxGet(object3d);
		
		if( !objectCtx )	{ return; }

		// notify handlers
		if ( !object3d.geometry ){
			return;
		}

		let doIntersect = this._notify(eventName, object3d, origDomEvent, intersect);
		
		while ( doIntersect && intersects[i+1] ){
			i++;
			intersect = intersects[i];
			let object3d	= intersect.object;
			let objectCtx	= this._objectCtxGet(object3d);
			if( !objectCtx ) { 
				return;
			}
			doIntersect = this._notify(eventName, object3d, origDomEvent, intersect);
		}
	},

	_notify	: function( eventName, object3d, origDomEvent, intersect )
	{
		let objectCtx	= this._objectCtxGet( object3d );
		let handlers	= objectCtx ? objectCtx[eventName+'Handlers'] : null;

		// parameter check
		console.assert( arguments.length === 4 );
		
		// if no handler do bubbling
		if( !objectCtx || !handlers || handlers.length === 0 ){ 
			if ( object3d.parent ) { return this._notify( eventName, object3d.parent, origDomEvent, intersect ); }
			return false;
		}
		
		// notify all handlers
		handlers = objectCtx[eventName+'Handlers'];
		let toPropagate	= true;
		let toIntersect = false;
		let capture = false;

		const stopPropagation = function () {
			toPropagate = false;
		};
		const preventDefault = function() {
			capture = true;
		};
		const nextIntersect = function(){
			toIntersect = true;
		};
		
		for( let i = 0; i < handlers.length; i++ ) {

			let handler	= handlers[i];

			capture = handler.useCapture;
			if ( typeof handler.callback === "function") { 
				handler.callback({
					type: eventName,
					target: object3d,
					origDomEvent: origDomEvent,
					intersect: intersect,
					stopPropagation: stopPropagation,
					preventDefault : preventDefault,
					nextIntersect : nextIntersect
				});
			}
			else if ( typeof handler.callback === "string" && typeof object3d.dispatchEvent === "function" ) { 
					
				object3d.dispatchEvent( {
					type: handler.callback,
					target: object3d,
					origDomEvent: origDomEvent,
					intersect: intersect,
					stopPropagation: stopPropagation,
					preventDefault : preventDefault,
					nextIntersect : nextIntersect
				});
			}
			
			if( capture ){ 
				break;
			}
		}

		// do bubbling
		if( toPropagate && object3d.parent ) {
			toIntersect = this._notify( eventName, object3d.parent, origDomEvent, intersect );
		}
		return toIntersect;
	}

});

const getRelativeMouseXY = function( domEvent ) {

	let element = domEvent.target || domEvent.srcElement;

	if (element.nodeType === 3) {
		element = element.parentNode; // Safari fix -- see http://www.quirksmode.org/js/events_properties.html
	}

	//get the real position of an element relative to the page starting point (0, 0)
	//credits go to brainjam on answering http://stackoverflow.com/questions/5755312/getting-mouse-position-relative-to-content-area-of-an-element
	let elPosition	= { x : 0 , y : 0};
	let tmpElement	= element;
	//store padding
	let style	= getComputedStyle(tmpElement, null);
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

	let elDimension	= {
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

const CLICK_TIMEOUT = 500;
let emulateMouse = false;

const _onPointerDown	= function( event ){
    
    this.timeStamp = event.timeStamp;
    _onMouseEvent.call(this, 'pointerdown', event);

    if ( emulateMouse && event.pointerType === "mouse" ) {
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

    _onMouseEvent.call(this, 'pointerup', event);

    if ( emulateMouse && event.pointerType === "mouse" ) {
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
    if( boundObjs === undefined || boundObjs.length === 0 )	{ return; }

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


const _onClick = function( event )
{
    // TODO handle touch ? 
    if ( this.timeStamp !== null && (event.timeStamp - this.timeStamp) > CLICK_TIMEOUT ){
        return;
    }
    this.timeStamp = null;
    _onMouseEvent.call(this, 'click', event );
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
        if ( opt && opt.emulateMouse ) {
            emulateMouse = true;
            DomeventPointer.eventNames = DomeventPointer.eventNames.concat( mouseEvents );
            Object.assign(DomeventPointer.eventMapping, mouseEventMapping);
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

        if ( emulateMouse ){
            this._$onClick      = function(){ _onClick.apply( _this, arguments ); };
        }
    },

    enable : function(){ 

        this._domElement.addEventListener( 'pointerdown', this._$onPointerDown, false );
        this._domElement.addEventListener( 'pointerup', this._$onPointerUp, false );

        this._domElement.addEventListener( 'pointermove'	, this._$onPointerMove	, false );

        if ( emulateMouse ){ 
            this._domElement.addEventListener( 'click'	, this._$onClick	, false );
        }
    },

    disable : function(){
        
        this._domElement.removeEventListener( 'pointerdown'	, this._$onMouseDown	, false );
        this._domElement.removeEventListener( 'pointerup'	, this._$onMouseUp		, false );
        
        this._domElement.removeEventListener( 'pointermove'	, this._$onMouseMove	, false );
    }
};

const CLICK_TIMEOUT$1 = 500;

const _onMouseDown	= function( event ){
    this.stateMouse.mousedown = true;

    if ( event.buttons && event.buttons > 1 ) {
        if ( event.button === 1 ) {
            return _onMouseEvent$1.call(this, 'mousemiddledown', event);
        }
        if ( event.button === 2 ) {
            //rightdown
            return _onMouseEvent$1.call(this, 'mouserightdown', event);
        }
    }
    this.timeStamp = event.timeStamp;

    return _onMouseEvent$1.call(this, 'mousedown', event);
};

const _onMouseUp	= function( event ){
    
    this.stateMouse.mousedown = false;

    if ( event.buttons && event.buttons > 1 ) {
        if ( event.button === 1 ) {
            return _onMouseEvent$1.call(this, 'mousemiddleup', event);
        }
        if ( event.button === 2 ) {
            //rightdown
            return _onMouseEvent$1.call(this, 'mouserightup', event);
        }
    }
    return _onMouseEvent$1.call(this, 'mouseup'	, event);
};

/********************************************************************************/
/*		onMove								*/
/********************************************************************************/

// # handle mousemove kind of events

const _onMove$1 = function( eventName, mouseX, mouseY, origDomEvent )
{
    //console.log('eventName', eventName, 'boundObjs', this._boundObjs[eventName])
    // get objects bound to this event
    let boundObjs	= this._boundObjs[eventName];
    if( boundObjs === undefined || boundObjs.length === 0 )	{ return; }

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


const _onClick$1 = function( event )
{
    // TODO handle touch ? 
    if ( this.timeStamp !== null && (event.timeStamp - this.timeStamp) > CLICK_TIMEOUT$1 ){
        return;
    }
    this.timeStamp = null;
    _onMouseEvent$1.call(this, 'click', event );
};

const _onDblClick = function( event )
{
    // TODO handle touch ?
    _onMouseEvent$1.call(this, 'dblclick', event);
};


/************************************************/
/*		handle mouse events						*/
/************************************************/
// # handle mouse events

const _onMouseEvent$1	= function( eventName, domEvent )
{
    let mouseCoords = getRelativeMouseXY( domEvent );
    this._onEvent(eventName, mouseCoords.x, mouseCoords.y, domEvent);
};

const _onMouseMove	= function( domEvent )
{
    let mouseCoords = getRelativeMouseXY( domEvent );
    
    _onMove$1.call(this, 'mousemove', mouseCoords.x, mouseCoords.y, domEvent);
    _onMove$1.call(this, 'mouseover', mouseCoords.x, mouseCoords.y, domEvent);
    _onMove$1.call(this, 'mouseout' , mouseCoords.x, mouseCoords.y, domEvent);
};


const _onContextmenu = function( event )
{
    //TODO don't have a clue about how this should work with touch..
    _onMouseEvent$1.call(this, 'contextmenu', event);
};





const DomeventMouse = {

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
        let _this = this; 

        
        this.stateMouse = this.stateMouse || {};
        this.stateMouse.mousedown = false;
    
        this._onMove = function(){ _onMove$1.apply( _this, arguments ); };  
        this._onMouseEvent = function(){ _onMouseEvent$1.apply( _this, arguments ); };

        this._$onMouseDown	= function(){ _onMouseDown.apply( _this, arguments ); };
	    this._$onMouseUp	= function(){ _onMouseUp.apply( _this, arguments );	};

        this._$onDblClick	= function(){ _onDblClick.apply( _this, arguments);	};
        this._$onClick		= function(){ _onClick$1.apply( _this, arguments); };

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

        if ( time <= TOUCH_MS ) {
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


const _onTouchMove = function( domEvent )
{
    if( domEvent.touches.length !== 1 )	{ return; }

    domEvent.preventDefault();
    let mouseX	= +(domEvent.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
    let mouseY	= -(domEvent.touches[ 0 ].pageY / window.innerHeight) * 2 + 1;

    this._onMove('mousemove', mouseX, mouseY, domEvent);
    this._onMove('mouseover', mouseX, mouseY, domEvent);
    this._onMove('mouseout' , mouseX, mouseY, domEvent);
};


/************************************************/
/*		handle touch events						*/
/************************************************/
// # handle touch events

const _onTouchEvent = function( eventName, domEvent )
{
    if( domEvent.touches.length !== 1 )	{ return; }

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

/*const _onMousedown = function( event ){ console.log("down");
    if ( event.intersect.object.id === event.target.id ){
        this._mousedownd[event.target.id] = event.target;
    }
}; */

const _onMousedown = function( ev ) { 
    this.stateMouse.mousedown = true;
    console.log("down", ev);
    //this._mousedownd[ ev.target.id ] = ev.target;
    
};

const _onMouseupDrag = function( event ){

    if ( this.stateMouse.dragging ) { 
        
        this.stateMouse.dragging = false;
        this._onMouseEvent( "dragend", event );

        
        for ( let key in this._draggingObjs ) { 
            this._notify( "dragend", this._draggingObjs[key], event, null );
        }
        
    }
    this._draggingObjs = {};
    this._mousedownd = {};
};

const _onMousemove = function( event ){ 
    if ( this.stateMouse.mousedown && !this.stateMouse.dragging ) { 
        
        this.stateMouse.dragging = true;
        this._onMouseEvent('dragstart', event);
        
    } 
    return;
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

        this._$onMouseDownDrag = function(){ _onMousedown.apply( _this, arguments ); };
        //this._$onDragStart	= function(){ _onMousedown.apply( _this, arguments ); };
        this._$onDragging	= function(){ _onMousemove.apply(_this, arguments);	};
        this._$onMouseUpDrag = function(){ _onMouseupDrag.apply( _this, arguments );	};
        this._$onMouseMoveDrag = function(){  _onMousemove.apply( _this, arguments ); };
        
        let addEventListener = this.addEventListener;
        this.addEventListener = DomeventDrag.addEventListener.call(this, addEventListener );
        let _notify = this._notify;
        this._notify = DomeventDrag._notify.call(this, _notify );
    },

    _notify : function( _notify ){ 

        let ret = null;
        let scope = this;

        return function( eventName, object3d, origDomEvent, intersect ){   
            if ( eventName === "dragstart" ) {
                console.log( eventName, object3d );
                scope._draggingObjs[object3d.id] = object3d;
            }
            if ( eventName === "dragend" ){
                if ( scope._draggingObjs[object3d.id] ) { 
                    delete scope._draggingObjs[object3d.id];
                    return _notify.call(scope, eventName, object3d, origDomEvent, intersect );
                }
                return false;
            }
            
            ret = _notify.call(scope, eventName, object3d, origDomEvent, intersect );

            if ( scope.stateMouse.mousedown && scope.stateMouse.dragging && eventName === "mousemove" ) {
                if ( scope._draggingObjs[object3d.id] ) { _notify.call( scope, 'drag', object3d, origDomEvent, intersect ); }
            }

            return ret;
        };
    },

    addEventListener : function( addEventListener ){ 
        let scope = this;

        return function( object3d, eventName, callback, opt ) { 
           
            if ( eventName === "drag" ) {
                if( !scope.hasListener(object3d, "mousedown") ){
                    scope.addEventListener( object3d, "mousedown", "mousedown" );
                }
                object3d.addEventListener("mousedown", scope._$onDragStart );

                if( !scope.hasListener(object3d, "mousemove") ){
                    scope.addEventListener( object3d, "mousemove", "mousemove" );
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

export { DomeventDrag, DomeventMouse, DomeventPointer, DomeventTouch, DomEvents as Domevents };
//# sourceMappingURL=domevents.pack.es.js.map