import * as THREE from "three";
// import postprocessing passes
import { SavePass } from "three/examples/jsm/postprocessing/SavePass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { BlendShader } from "three/examples/jsm/shaders/BlendShader.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";

import Track from "/sounds/music.mp3";
import gsap from "gsap";

import { SoftGlitchPass } from "@/composables/sunFunction/SoftGlitch";
export let audioMat: any;
export let visualizer: any;
export let softGlitch: any;
export let ico: any;

let vertexShader = `
out vec2 vUv;
out float vPattern;
uniform float uTime;
uniform float uAudioFrequency;

#define PI 3.14159265358979

vec2 m = vec2(.7,.8);

float hash( in vec2 p ) 
{
    return fract(sin(p.x*15.32+p.y*5.78) * 43758.236237153);
}


vec2 hash2(vec2 p)
{
	return vec2(hash(p*.754),hash(1.5743*p.yx+4.5891))-.5;
}

float EaseInQuint(float x){
    return pow(x,5.0);
}

float gavoronoi3(in vec2 p)
{    
    float time = uTime;
    float timeMultiplier = mix(1.0,3.0,EaseInQuint(uAudioFrequency));
    time += timeMultiplier;

    vec2 ip = floor(p);
    vec2 fp = fract(p);
    float f = 3.*PI;//frequency
    float v = 1.0;//cell variability <1.
    float dv = 0.0;//direction variability <1.
    vec2 dir = vec2(1.3)+ cos(time);//vec2(.7,.7);
    float va = 0.0;
   	float wt = 0.0;
    for (int i=-1; i<=1; i++) 
	for (int j=-1; j<=1; j++) 
	{		
        vec2 o = vec2(i, j)-.5;
        vec2 h = hash2(ip - o);
        vec2 pp = fp +o ;
        float d = dot(pp, pp);
        float w = exp(-d*4.);
        wt +=w;
        h = dv*h+dir;//h=normalize(h+dir);
        va += cos(dot(pp,h)*f/v)*w;
	}    
    return va/wt;
}

float noise( vec2 p)
{   
    return gavoronoi3(p);
}

float map(vec2 p){

    return 2.0*abs(noise(p*2.0));
}

vec3 nor(in vec2 p)
{
	const vec2 e = vec2(0.1, 0.0);
	return -normalize(vec3(
		map(p + e.xy) - map(p - e.xy),
		map(p + e.yx) - map(p - e.yx),
		1.0));
}

void main() {

    vec3 light = normalize(vec3(3., 2., -1.));
	float r= dot(nor(uv), light);

    float displacement =clamp(1.0 - r,0.0,0.2)+ uAudioFrequency/2.0;

    vec3 newPosition = position + normal * displacement ;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
    vPattern = r;
    vUv = uv;
}
`;
let fragmentShader = `in vec2 vUv;
uniform float uTime;
uniform float uAudioFrequency;
in float vPattern;

struct Color{
    vec3 c ;
    float position;
};


#define COLOR_RAMP(inputColors, inputPosition, finalColor) {\
  const int len = inputColors.length(); \
  int index = 0; \
  for(int i = 0; i < len - 1; i++) { \
    Color currentColor = inputColors[i]; \
    Color nextColor = inputColors[i + 1]; \
    bool pointExists = currentColor.position <= inputPosition && inputPosition <= nextColor.position; \
    index = pointExists ? i : index; \
  } \
  Color currentColor = inputColors[index]; \
  Color nextColor = inputColors[index + 1]; \
  vec3 c1 = currentColor.c; \
  vec3 c2 = nextColor.c; \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (inputPosition - currentColor.position) / range; \
  finalColor = mix(c1, c2, lerpFactor); \
}

void main() {
    float time = uTime *(1.0 + uAudioFrequency);
    vec3 color ;
    vec3 mainColor =mix( vec3(0.2,0.3,0.9),vec3(0.4,1.0,0.3),uAudioFrequency);

    mainColor.r *= 0.9 + sin(time)/3.2;
    mainColor.g *= 1.1 + cos(time/2.0)/2.5;
    mainColor.b *= 0.8 + cos(time/5.0)/4.0;
    mainColor.rgb += 0.1;

    Color[4] colors =Color[](
        Color(vec3(1),0.0),
        Color(vec3(1),0.01),
        Color(mainColor,0.1),
        Color(vec3(0.01,0.05,0.2),1.0)
    );
    COLOR_RAMP(colors , vPattern, color);
    gl_FragColor = vec4(color, 1);
}`;

class Visualizer {
  mesh: any;
  frequencyUniformName: any;
  listener: THREE.AudioListener;
  sound: THREE.Audio<GainNode>;
  loader: THREE.AudioLoader;
  analyser: THREE.AudioAnalyser;

  /**
   * 3D物體、音頻監聽器、音頻源、音頻加載器和音頻分析器。
   * @param mesh 目標球體
   * @param frequencyUniformName  "uAudioFrequency"
   */
  constructor(mesh: any, frequencyUniformName: any) {
    this.mesh = mesh;
    this.frequencyUniformName = frequencyUniformName;
    this.mesh.material.uniforms[this.frequencyUniformName] = { value: 0 };

    this.listener = new THREE.AudioListener();
    this.mesh.add(this.listener);

    this.sound = new THREE.Audio(this.listener);
    this.loader = new THREE.AudioLoader();

    this.analyser = new THREE.AudioAnalyser(this.sound, 32);
  }

  /**
   * 加載音樂並播放
   * @param path 音檔路徑
   */
  load(path: any) {
    this.loader.load(path, (buffer) => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(true);
      this.sound.setVolume(0.5);
      this.sound.play();
    });
  }

  /**
   * 獲取當前音頻的平均頻率
   * @returns 平均頻率
   */
  getFrequency() {
    return this.analyser.getAverageFrequency();
  }

  /**
   * 更新音頻頻率到3D物體的uniforms上，並使用gsap實現平滑過渡效果
   * @returns 計算後頻率
   */
  update() {
    const freq = Math.max(this.getFrequency() - 100, 0) / 50;
    const freqUniform = this.mesh.material.uniforms[this.frequencyUniformName];
    gsap.to(freqUniform, {
      duration: 1.5,
      ease: "Slow.easeOut",
      value: freq,
    });
    // freqUniform.value = freq

    return freq;
  }

  /**
   * 停止播放音樂
   */
  stopAudio() {
    this.sound.stop();
  }
}

/**
 * 初始化和開始應用程式，利用Visualizer類來加載和播放音樂，並將其連接到3D物體上以實現視覺化效果
 * @param scene 星球的scene
 * @param camera 星球的camera
 */
export function startApp(scene: any, camera: any) {
  const dirLight = new THREE.DirectionalLight("#ffffff", 1);
  const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
  scene.add(dirLight, ambientLight);

  const geometry = new THREE.SphereGeometry(1, 100, 100);
  audioMat = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });
  ico = new THREE.Mesh(geometry, audioMat);
  const wireframe = new THREE.LineSegments(geometry, audioMat);
  const wireframe_delta = 0.015;
  wireframe.scale.setScalar(1 + wireframe_delta);
  ico.add(wireframe);

  visualizer = new Visualizer(ico, "uAudioFrequency");
  visualizer.load(Track);

  scene.add(ico);
  // 設定了後處理效果
  // 包括保存通道、混合通道和輸出通道，以及一個自定義故障效果

  // // postprocessing
  // const renderTargetParameters = {
  //   minFilter: THREE.LinearFilter,
  //   magFilter: THREE.LinearFilter,
  //   stencilBuffer: false,
  // };
  // // save pass
  // const savePass = new SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters));

  // // blend pass
  // const blendPass = new ShaderPass(BlendShader, "tDiffuse1");
  // blendPass.uniforms["tDiffuse2"].value = savePass.renderTarget.texture;
  // blendPass.uniforms["mixRatio"].value = MOTION_BLUR_AMOUNT;

  // // output pass
  // const outputPass = new ShaderPass(CopyShader);
  // outputPass.renderToScreen = true;

  // adding passes to composer
  // addPass(blendPass);
  // addPass(savePass);
  // addPass(outputPass);

  // softGlitch = new SoftGlitchPass();
  // softGlitch.factor = 1;
  // addPass(softGlitch);
}
