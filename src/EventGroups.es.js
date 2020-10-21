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

export default Eventgroups;
export { Eventgroups };