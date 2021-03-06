  import { Renderer, Program, Geometry, Texture, Mesh, Vec2, Vec4, Flowmap, Triangle } from './ogl/index.mjs';
  var vertex = `
	attribute vec2 uv;
	attribute vec2 position;
	varying vec2 vUv;
	void main() {
	  vUv = uv;
	  gl_Position = vec4(position, 0, 1);
	}
  `;
  var fragment = `
	precision highp float;
	precision highp int;
	uniform sampler2D tWater;
	uniform sampler2D tFlow;
	uniform float uTime;
	varying vec2 vUv;
	uniform vec4 res;
	uniform vec2 img;
	
	vec2 centeredAspectRatio(vec2 uvs, vec2 factor){
	  return uvs * factor - factor /2. + 0.5;
	}
	
	void main() {
	  
	  // R and G values are velocity in the x and y direction
	  // B value is the velocity length
	  vec3 flow = texture2D(tFlow, vUv).rgb;
	  
	  vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
	  
	  // vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
	  vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
	  myUV -= flow.xy  * 0.5;
	  
	  vec2 myUV2 = (uv - vec2(0.5))*res.zw + vec2(0.5);
	  myUV2 -= flow.xy * 0.25;
	  
	  vec2 myUV3 = (uv - vec2(0.5))*res.zw + vec2(0.5);
	  myUV3 -= flow.xy * 0.55;
	  
	  vec3 tex = texture2D(tWater, myUV).rgb;
	  vec3 tex2 = texture2D(tWater, myUV2).rgb;
	  vec3 tex3 = texture2D(tWater, myUV3).rgb;
	  
	  gl_FragColor = vec4(tex.r, tex.g, tex.b, 1.0);
	}
  `;
  var globalSize = Math.max(window.innerWidth, window.innerHeight);
  //var globalSize = 1920;
  var _size = [globalSize, globalSize];
  var canvas=document.getElementById("pattern");
  var buffer=document.getElementById("pattern");
  canvas.width = globalSize;
  canvas.height = globalSize;
  var renderer = new Renderer({ dpr: 2 });
  var gl = renderer.gl;
  document.body.appendChild(gl.canvas);
  var aspect = 1;
  var mouse = new Vec2(-1);
  var velocity = new Vec2();
  function resize() {
	var vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', vh + 'px');
	gl.canvas.width = window.innerWidth * 2;
	gl.canvas.height = window.innerHeight * 2;
	gl.canvas.style.width = window.innerWidth + "px";
	gl.canvas.style.height = window.innerHeight + "px";
	
	var a1, a2;
	var imageAspect = _size[1] / _size[0];
	if (window.innerHeight / window.innerWidth < imageAspect) {
	  a1 = 1;
	  a2 = window.innerHeight / window.innerWidth / imageAspect;
	} else {
	  a1 = (window.innerWidth / window.innerHeight) * imageAspect;
	  a2 = 1;
	}
	mesh.program.uniforms.res.value = new Vec4(
	  window.innerWidth,
	  window.innerHeight,
	  a1,
	  a2
	);
	
	renderer.setSize(window.innerWidth, window.innerHeight);
	aspect = window.innerWidth / window.innerHeight;
  }
  var flowmap = new Flowmap(gl, {
	falloff: 0.333,
	dissipation: 0.999666,
	alpha: 0.7,
	size: globalSize
  });
  var geometry = new Geometry(gl, {
	position: {
	  size: 2,
	  data: new Float32Array([-1, -1, 3, -1, -1, 3])
	},
	uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
  });
  var texture = new Texture(gl, {
	minFilter: gl.LINEAR,
	magFilter: gl.LINEAR
  });
  var colors = {
	color1: "#C7FF6E", //yellow
	color2: "#F91647", //red
	color3: "#1521FF", //blue
	color4: "#B57715", //brown
	color5: "#2D2D2D", //black
	color6: "#EDEDD3"  //white
  };
  function getRadianAngle(degreeValue) {
	return degreeValue * Math.PI / 180;
  } 
  var ctx=canvas.getContext("2d");
  var bctx=buffer.getContext("2d");
  var numberOfStripes = globalSize/25;
  var $p = 0; 
  drawStripes(); 
  function drawStripes(){
	for (var i=0;i<numberOfStripes*2;i++){
	  $p++;
	  var thickness = globalSize / numberOfStripes;
	  bctx.beginPath();
	  bctx.strokeStyle = i % 2?colors.color1:colors.color2;
	  if($p === 1){
		bctx.strokeStyle = colors.color1;
	  }
	  if($p === 2){
		bctx.strokeStyle = colors.color2;
	  }
	  if($p === 3){
		bctx.strokeStyle = colors.color3;
	  }
	  if($p === 4){
		bctx.strokeStyle = colors.color4;
	  }
	  if($p === 5){
		bctx.strokeStyle = colors.color5;
	  }
	  if($p === 6){
		bctx.strokeStyle = colors.color6;
		$p= 0;
	  }    
	  bctx.lineWidth =thickness;  
	  //ctx.filter = 'blur(5px)';
	  bctx.moveTo(i*thickness + thickness/2 - globalSize,0);
	  bctx.lineTo(0 + i*thickness+thickness/2,globalSize);
	  bctx.stroke();
	  //ctx.filter = 'none';
	}
  }
  bctx.scale(1.1,1.1);
  bctx.translate(0,-10);
  ctx.drawImage(canvas,0,0);
 // cctx.drawImage(buff, 0, 0);
  StackBlur.canvasRGB(
	canvas, 0, 0, canvas.width, canvas.height, 10
  );
 
  texture.image = canvas
  var a1, a2;
  var imageAspect = _size[1] / _size[0];
  if (window.innerHeight / window.innerWidth < imageAspect) {
	a1 = 1;
	a2 = window.innerHeight / window.innerWidth / imageAspect;
  } else {
	a1 = (window.innerWidth / window.innerHeight) * imageAspect;
	a2 = 1;
  }
  var program = new Program(gl, {
	vertex,
	fragment,
	uniforms: {
	  uTime: { value: 0 },
	  tWater: { value: texture },
	  res: {
		value: new Vec4(window.innerWidth, window.innerHeight, a1, a2)
	  },
	  img: { value: new Vec2(_size[1], _size[0]) },
	  tFlow: flowmap.uniform
	}
  });
  var mesh = new Mesh(gl, { geometry, program });
  
  window.addEventListener("resize", resize, false);
  resize();
  
  var isTouchCapable = "ontouchstart" in window;
  if (isTouchCapable) {
	window.addEventListener("touchend", onMouseUp, false);
	window.addEventListener("touchstart", onMouseDown, false);
	window.addEventListener("touchmove", updateMouse, false);
  } else {
	window.addEventListener("mousedown", onMouseDown, false);
	window.addEventListener("mouseup", onMouseUp, false);
	window.addEventListener("mousemove", updateMouse, false);
  }
  var lastTime;
  var mouseDown = true;
  var lastMouse = new Vec2();
  function onMouseDown(){
	mouseDown = true;
  }
  function onMouseUp(){
	mouseDown = true;
  }
  function updateMouse(e) {
   if(mouseDown){
	if (e.changedTouches && e.changedTouches.length) {
	  e.x = e.changedTouches[0].pageX;
	  e.y = e.changedTouches[0].pageY;
	}
	if (e.x === undefined) {
	  e.x = e.pageX;
	  e.y = e.pageY;
	}
	mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
	if (!lastTime) {
	  lastTime = performance.now();
	  lastMouse.set(e.x, e.y);
	}
	var deltaX = e.x - lastMouse.x;
	var deltaY = e.y - lastMouse.y;
	lastMouse.set(e.x, e.y);
	var time = performance.now();
	var delta = Math.max(10.4, time - lastTime);
	lastTime = time;
	velocity.x = deltaX / delta;
	velocity.y = deltaY / delta;
	velocity.needsUpdate = true;
  }
  }
  requestAnimationFrame(update);
  function update(t) {
	requestAnimationFrame(update);
	if (!velocity.needsUpdate) {
		mouse.set(-1);
		velocity.set(0);
	}
	texture.needsUpdate = true;
	velocity.needsUpdate = false;
	flowmap.aspect = aspect;
	flowmap.mouse.copy(mouse);
	flowmap.velocity.lerp(velocity, 0.1);
	flowmap.update();
	program.uniforms.uTime.value = t * 0.001;
	renderer.render({ scene: mesh });
  }
  var element = document.querySelector('link[rel="icon"]');
  const darkModeListener = (event) => {
  if (event.matches) {
	element.setAttribute('href','./assets/icons/favicon-dark.png');
  } else {
	element.setAttribute('href','./assets/icons/favicon-light.png');
  }
  };
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', darkModeListener);
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches) {
	  element.setAttribute('href','./assets/icons/favicon-dark.png');
  } else {
	  element.setAttribute('href','./assets/icons/favicon-light.png');
  }