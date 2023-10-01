import * as THREE from 'three';

const defaults = {
	width : 1,
	height : 1,
	segmentsW : 1,
	segmentsH : 1,
	repeatX : 1,
	repeatY : 1,
	"anisotropy" : 16,
	"image" : "small"
};

const GrassGround = function( opts ){

	var loader = new THREE.TextureLoader();

	// handle default arguments
	this.options = Object.assign( {}, defaults, opts );

	// create the textureDiffuse	
	var textureDiffuseUrl	= GrassGround.baseUrl + 'textures/grasslight-'+ this.options.image +'.jpg';
	var textureDiffuse	= loader.load( textureDiffuseUrl );
	textureDiffuse.wrapS	= THREE.RepeatWrapping;
	textureDiffuse.wrapT	= THREE.RepeatWrapping;
	textureDiffuse.repeat.x= this.options.repeatX;
	textureDiffuse.repeat.y= this.options.repeatY;
	textureDiffuse.anisotropy = this.options.anisotropy;

	// create the textureNormal	
	var textureNormalUrl	= GrassGround.baseUrl + 'textures/grasslight-'+ this.options.image +'-nm.jpg';
	var textureNormal	= loader.load( textureNormalUrl );
	textureNormal.wrapS	= THREE.RepeatWrapping;
	textureNormal.wrapT	= THREE.RepeatWrapping;
	textureNormal.repeat.x	= this.options.repeatX;
	textureNormal.repeat.y	= this.options.repeatY;
	textureNormal.anisotropy= this.options.anisotropy;

	// build object3d
	var geometry	= new THREE.PlaneGeometry(this.options.width, this.options.height, this.options.segmentsW, this.options.segmentsH);
	var material	= new THREE.MeshPhongMaterial({
		map		: textureDiffuse,
		normalMap	: textureNormal,
                normalScale	: new THREE.Vector2(1,1).multiplyScalar(0.5),
		color		: 0x44FF44,
    });
    
	let object3D	= new THREE.Mesh( geometry, material );
    object3D.rotateX( -Math.PI/2 );
    
	// return the just-built object3d
	return object3D;
};

GrassGround.baseUrl	= "./";

export default GrassGround;
export { GrassGround };