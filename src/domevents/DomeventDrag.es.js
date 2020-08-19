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
    
        this._draggingObj = null;
    },

    enable : function() { 
        
    },

    disable : function() {
        
    }
};


export default DomeventDrag;
export { DomeventDrag };