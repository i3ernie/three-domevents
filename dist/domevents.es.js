import { Raycaster, Object3D, Vector3 } from '../../three/build/three.module.js';

var defaults = {
	"defaultEventGroup" : "_default"
};

var Eventgroups = {
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
            var name = defaults.defaultEventGroup;
            
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
var extensions = [];

var _addEvents = function ( obj, options ) {
	var scope = this;

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

var _removeEvents = function( obj, options ){

	var scope = this;

	if ( this._objectCtxIsInit( obj ) ) {
		this._objectCtxDeinit( obj );
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

		obj.children.forEach( function( child ) {
			_removeEvents.call( scope, child, options );
		});
	}
};


// # Constructor
var DomEvents = function( camera, domElement )
{
	this._camera		= camera || null;
	this._domElement 	= domElement || document;
	this._ray 			= new Raycaster();
	this._selected		= null;
	this._boundObjs		= {};
	this.enabled = false;
	
	// Bind dom event for mouse and touch
	var _this			= this;
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
		var scope = this;
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

		var defaults = {
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

		var defaults = {
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
		var i = 0;

		if( boundObjs === undefined || boundObjs.length === 0 )	{ return; }
		// compute the intersection
		var vector	= new Vector3( mouseX, mouseY, 0.5 );
		this._ray.setFromCamera( vector, this._camera );

		var intersects = null;
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
		var intersect	= intersects[0];
		var object3d	= intersect.object;
		var objectCtx	= this._objectCtxGet(object3d);
		if( !objectCtx )	{ return; }

		// notify handlers
		if ( !object3d.geometry ){
			return;
		}

		var doIntersect = this._notify(eventName, object3d, origDomEvent, intersect);
		
		while ( doIntersect && intersects[i+1] ){
			i++;
			intersect = intersects[i];
			var object3d$1	= intersect.object;
			var objectCtx$1	= this._objectCtxGet(object3d$1);
			if( !objectCtx$1 ) { 
				return;
			}
			doIntersect = this._notify(eventName, object3d$1, origDomEvent, intersect);
		}
	},

	_notify	: function( eventName, object3d, origDomEvent, intersect )
	{
		var objectCtx	= this._objectCtxGet( object3d );
		var handlers	= objectCtx ? objectCtx[eventName+'Handlers'] : null;

		// parameter check
		console.assert( arguments.length === 4 );
		
		// if no handler do bubbling
		if( !objectCtx || !handlers || handlers.length === 0 ){ 
			if ( object3d.parent ) { return this._notify( eventName, object3d.parent, origDomEvent, intersect ); }
			return false;
		}
		
		// notify all handlers
		handlers = objectCtx[eventName+'Handlers'];
		var toPropagate	= true;
		var toIntersect = false;
		var capture = false;

		var stopPropagation = function () {
			toPropagate = false;
		};
		var preventDefault = function() {
			capture = true;
		};
		var nextIntersect = function(){
			toIntersect = true;
		};
		if (eventName === "mousedown"|| eventName === "mouseup") 
			
		{ for( var i = 0; i < handlers.length; i++ ) {

			var handler	= handlers[i];

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
				if (eventName === "mousedown"|| eventName === "mouseup") 
					
				{ object3d.dispatchEvent( {
					type: handler.callback,
					target: object3d,
					origDomEvent: origDomEvent,
					intersect: intersect,
					stopPropagation: stopPropagation,
					preventDefault : preventDefault,
					nextIntersect : nextIntersect
				}); }
			}
			
			if( capture ){ 
				break;
			}
		} }

		// do bubbling
		if( toPropagate && object3d.parent ) {
			toIntersect = this._notify( eventName, object3d.parent, origDomEvent, intersect );
		}
		return toIntersect;
	}

});

export default DomEvents;
export { DomEvents };
//# sourceMappingURL=domevents.es.js.map
