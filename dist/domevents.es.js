import { Raycaster, Object3D, Vector3 } from '../../three/build/three.module.js';

const defaults = {
	"defaultEventGroup" : "_default"
};

const registerGroup = function( object3d, name ){
    if ( !object3d.userData.eventGroups ) {
        object3d.userData.eventGroups = [];
    }
    if ( object3d.userData.eventGroups.indexOf(name) < 0 ) {
        object3d.userData.eventGroups.push(name);
    }
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
            this._registeredObjsGroup[name] = {};
            

            
            return this;
        },
        
        deleteEventGroup : function( name ){
            delete this._boundDomEvents[name];
            return this;
        },
    
        switchEventGroup : function( name ) {
            if ( this._boundDomEvents[name] ) {
                this.aktEventGroupName = name;
                this.aktEventGroup = this._boundDomEvents[name];
                this._boundObjs = this._boundObjsGroup[name];
                this._registeredObjs = this._registeredObjsGroup[name];
            }
            return this;
        },
        
        resetEventGroup : function() {
            let name = defaults.defaultEventGroup;
            
            this.aktEventGroupName = name;
            this.aktEventGroup = this._boundDomEvents[name];
            this._boundObjs = this._boundObjsGroup[name];
            this._registeredObjs = this._registeredObjsGroup[name];
    
            return this;
        },

        defaultEventGroup : function(){
            return this.aktEventGroupName === defaults.defaultEventGroup;
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
        this._registeredObjsGroup = {};
    
        this._boundDomEvents[name] = {};
        this._boundObjsGroup[name] = {};
        this._registeredObjsGroup[name] = {};
    
        
        this.aktEventGroupName = name;

        this.aktEventGroup = this._boundDomEvents[name];
        this._boundObjs = this._boundObjsGroup[name];

        const addToDom = this.addToDom;
        this.addToDom = Eventgroups.addToDom.call( this, addToDom );

        const removeFromDom = this.removeFromDom;
        this.removeFromDom = Eventgroups.removeFromDom.call( this, removeFromDom );

        const addEventListener = this.addEventListener;
        this.addEventListener = Eventgroups.addEventListener.call( this, addEventListener );


        const removeEventListener = this.removeEventListener;
        this.removeEventListener = Eventgroups.removeEventListener.call( this, removeEventListener );

    },

    removeEventListener : function( removeEventListener ) {
        const scope = this;

        return function( object3d, eventName, callback, opts ){
            opts = opts || {};

            let groupName = opts.eventGroup;
            let aktGroupName = scope.getEventGroupName();
            
            if ( groupName && aktGroupName !== groupName ){
            
                if ( !scope.hasEventGroup(groupName) ) {
                    return;
                }
                scope.switchEventGroup( groupName );
                removeEventListener.call(scope, object3d, eventName, callback, opts );
                scope.switchEventGroup( aktGroupName );
                return;
            } 

            removeEventListener.call(scope, object3d, eventName, callback, opts );
        };
    },

    addEventListener : function( addEventListener ){
        const scope = this;

        return function( object3d, eventName, callback, opts ){
            opts = opts || {};

            let groupName = opts.eventGroup;
            let aktGroupName = scope.getEventGroupName();

            if ( groupName ){
                registerGroup(object3d, groupName);

                if ( aktGroupName != groupName )
                {
                    if ( !scope.hasEventGroup(groupName) ) {
                        scope.addEventGroup( groupName );
                    }
                    scope.switchEventGroup( groupName );
                    addEventListener.call(scope, object3d, eventName, callback, opts );
                    scope.switchEventGroup( aktGroupName );
                    return;
                } 
            }
            addEventListener.call(scope, object3d, eventName, callback, opts );
        };
    },

    removeFromDom : function( removeFromDom ) {
        const scope = this;

        return  function( object3d, opts ) {

            const aktGroupName = scope.getEventGroupName();

            for ( let groupName in this._boundDomEvents ){
            
                if ( aktGroupName !== groupName ){
            
                    scope.switchEventGroup( groupName );
                    removeFromDom.call( scope, object3d, opts );
                    scope.switchEventGroup( aktGroupName );
                } 
            }

            removeFromDom.call( scope,object3d, opts );
        };
    },

    addToDom : function( addToDom ){
        const scope = this;

        return function( object3d, opts ){
            opts = opts || {};

            let groupName = opts.eventGroup;
            let aktGroupName = scope.getEventGroupName();

            if ( groupName ){
                registerGroup( object3d, groupName );
                
                if ( aktGroupName != groupName ){
                
                    if ( !scope.hasEventGroup(groupName) ) {
                        scope.addEventGroup( groupName );
                    }
                    scope.switchEventGroup( groupName );
                    addToDom.call( scope, object3d, opts );
                    scope.switchEventGroup( aktGroupName );
                    return;
                } 
            }

            let groupList = object3d.userData.eventGroups;
            if ( groupList ) {
                if ( typeof groupList === "string" ) { 
                    groupList = [groupList];
                }
                groupList.forEach(function( groupName ) {
                    if ( aktGroupName != groupName ){
                
                        if ( !scope.hasEventGroup(groupName) ) {
                            scope.addEventGroup( groupName );
                        }
                        scope.switchEventGroup( groupName );
                        addToDom.call( scope, object3d, opts );
                        scope.switchEventGroup( aktGroupName );
                    } 
                });
            }

            addToDom.call( scope, object3d, opts );
        }
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
			console.warn("object3d has listener allready registered for " + eventName );
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

	delete this._registeredObjs[obj.id];

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
	this._previousFunctions = {};
	this._registeredObjs		= {};
	
	// Bind dom event for mouse and touch
	let _this			= this;
	this.firstClick 	= false;
	this.delay = 300;


	Eventgroups.initialize.call( this );

	this.timeStamp = null;
	
	this.onRemove = function(){ _this.removeFromDom.apply( _this, arguments ); };
	this.onAdd = function( ev ) { console.log(ev.target);
		const obj = ev.target? ev.target : ev; 
		_this.addToDom.call( _this, obj ); 
	};

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

		const _this = this;

		const useCapture = opt.useCapture || false;
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

	removeEventListener	: function( object3d, eventName, callback, opts ) {
		opts = opts || {};
		const scope = this;

		const useCapture = opts.useCapture;

		if ( eventName === null || eventName === undefined ) {
			eventName = DomEvents.eventNames;
		}
		
		if ( typeof eventName === "object" ){
			for ( let i = 0; i<eventName.length; i++){
				this.unbind(object3d, eventName[i], callback, useCapture);
			}
			return;
		}
		
		this.unbind (object3d, eventName, callback, useCapture);

		if ( opts.recursive ) {
			_.each( object3d.children, function( object3d ){
				scope.removeEventListener( object3d, eventName, callback, opts );
			});
		}
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

	removeFromDom : function( object3d, opts ) {

		let defaults = {
			recursive : true
		};
		const options = Object.assign( {}, defaults, opts );

		if ( !( object3d instanceof Object3D ) ){

			if ( object3d.target && object3d.target instanceof Object3D ) {
				object3d= object3d.target;
			} else {
				console.warn("object3d is not instance of THREE.Object3D");
				return;
			}
		}

		//und los gehts aufraeumen...
		_removeEvents.call(this, object3d, options );

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
	addToDom : function( object3d, opts ){

		const defaults = {
			recursive : true, 
			useCapture: false, 
			bindFunctions : true
		};
		const options = Object.assign({}, defaults, opts);

		const scope = this;

		if ( this._registeredObjs[object3d.id] ){
			console.warn("Domevents: object3d is allready registered ", object3d );
			return;
		}

		if ( !( object3d instanceof Object3D ) ) {

			//event object?
			if ( object3d.target && object3d.target instanceof Object3D ) {
				object3d = object3d.target;
			} else {
				console.warn("Domevents: object3d is nit instance of THREE.Object3D", object3d );
				return;
			}
		}

		this._registeredObjs[object3d.id] = object3d.id;

		//start register all known events
		_addEvents.call(this, object3d, options );

		if ( options.recursive && object3d.children.length > 0 ) {
			object3d.children.forEach( function( child ){
				scope.addToDom.call(scope, child, options );
			});
		}
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
		
		this.addToDom( object3d, options );
		
		if ( options.observe ) {
			this._observe( object3d, options );
		}
	},

	deactivate : function( object3d ) {
		const scope = this;
		const id = object3d.id;

		if ( this._previousFunctions[id] ){
			if ( typeof this._previousFunctions[id].add === "function") { 
				object3d.add = this._previousFunctions[id].add;
				delete this._previousFunctions[id].add;
			}
			if ( typeof this._previousFunctions[id].remove === "function") {
				object3d.remove = this._previousFunctions[id].remove;
				delete this._previousFunctions[id].remove;
			}
		}

		if( object3d.children.length > 0 ){ 
			object3d.children.forEach( function( child ){ 
				scope.deactivate( child );
			});
		}
	},

	_observe : function( object3d, opts ) {

		const scope = this;
		const id = object3d.id;

		if ( ! this._previousFunctions[id] ) {
			this._previousFunctions[id] = {};
		}

		if ( typeof scope._previousFunctions[id].add === "function" ){ 
			return;
		}

		this._previousFunctions[id].add = object3d.add;
		object3d.add = function( child ){

			scope.activate( child, opts );
			
			scope._previousFunctions[id].add.apply( object3d, arguments );
		};
		
		this._previousFunctions[id].remove = object3d.remove;
		object3d.remove = function( child ){

			scope.deactivate( child );

			scope.removeFromDom( child, opts );

			scope._previousFunctions[id].remove.apply( object3d, arguments );
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

		let doIntersect = this._notify(eventName, object3d, origDomEvent, intersect, intersects);
		
		while ( doIntersect && intersects[i+1] ){
			i++;
			intersect = intersects[i];
			let object3d	= intersect.object;
			let objectCtx	= this._objectCtxGet(object3d);
			if( !objectCtx ) { 
				return;
			}
			doIntersect = this._notify(eventName, object3d, origDomEvent, intersect, intersects);
		}
	},

	_notify	: function( eventName, object3d, origDomEvent, intersect, intersects )
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

			let ev = {
				type: eventName,
				target: object3d,
				origDomEvent: origDomEvent,
				intersect: intersect,
				intersects: intersects,
				stopPropagation: stopPropagation,
				preventDefault : preventDefault,
				nextIntersect : nextIntersect
			};

			if ( this.aktEventGroupName ) {
				ev.eventGroupName = this.aktEventGroupName;
			}

			capture = handler.useCapture;
			if ( typeof handler.callback === "function") { 
				handler.callback(ev);
			}
			else if ( typeof handler.callback === "string" && typeof object3d.dispatchEvent === "function" ) { 
					
				ev.type = handler.callback,
				object3d.dispatchEvent( ev );
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

export default DomEvents;
export { DomEvents };
//# sourceMappingURL=domevents.es.js.map
