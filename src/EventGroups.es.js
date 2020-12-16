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
    
        this._boundDomEvents[name] = {};
        this._boundObjsGroup[name] = {};
        this._registeredObjsGroup[name] = {};
    
        
        this.aktEventGroupName = name;

        this.aktEventGroup = this._boundDomEvents[name];
        this._boundObjs = this._boundObjsGroup[name];

        const addToDom = this.addToDom;
        this.addToDom = Eventgroups.addToDom.call( this, addToDom );

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

export default Eventgroups;
export { Eventgroups };