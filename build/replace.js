const replace = function( obj ){
    
    return { 
        name : "replace",
        generateBundle : function( code, code2 ){ 
            for ( var key in obj ){
                for ( var file in code2 ) {
                    code2[file].code = code2[file].code.replace(key, obj[key] );
                }
            }
        }
    };
};

module.exports = replace;