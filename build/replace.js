const replace = function( obj ){
    
    return { 
        name : "replace",
        generateBundle : function( code, code2 ){ 
            let replacer;
            for ( var key in obj ){
                replacer = new RegExp(key,'g');
                for ( var file in code2 ) {
                    if (code2[file].code){
                        code2[file].code = code2[file].code.replace(replacer, obj[key] );
                    }
                    
                }
            }
        }
    };
};

module.exports = replace;