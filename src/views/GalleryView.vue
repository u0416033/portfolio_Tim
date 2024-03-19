<template>
  <div id="universeContainer"></div>
  <div class="universeContainerContent" v-if="!universeMode">
    <infoPopoutView
      @continueAnimate="continueAnimate"
      @toCateGoryPage="toCateGoryPage"
      :planteContent="planteContent"
    ></infoPopoutView>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, onUnmounted } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import infoPopoutView from "@/components/infoPopoutView.vue";
import starsTexture from "@/assets/img/stars.jpg";
import sunTexture from "@/assets/img/sun.jpg";
import mercuryTexture from "@/assets/img/mercury.jpg";
import venusTexture from "@/assets/img/venus.jpg";
import earthTexture from "@/assets/img/earth.jpg";
import marsTexture from "@/assets/img/mars.jpg";
import jupiterTexture from "@/assets/img/jupiter.jpg";
import saturnTexture from "@/assets/img/saturn.jpg";
import saturnRingTexture from "@/assets/img/saturn ring.png";
import uranusTexture from "@/assets/img/uranus.jpg";
import uranusRingTexture from "@/assets/img/uranus ring.png";
import neptuneTexture from "@/assets/img/neptune.jpg";
import plutoTexture from "@/assets/img/pluto.jpg";
import { useRouter } from "vue-router";
import {
  startApp,
  audioMat,
  visualizer,
  softGlitch,
  ico,
} from "@/composables/sunFunction/audioVisualizer";

const textureLoader = new THREE.TextureLoader();

// import earthVertex from "@/glsl/earth_Vertex.vert";
// import earthFragment from "@/glsl/earth_Fragment.frag";
// import atmosphereVertex from "@/glsl/atmosphere_Vertex.vert";
// import atmosphereFragment from "@/glsl/atmosphere_Fragment.frag";
/**
 * 星球 vertex shader
 * 提供UV及法向量
 */
let earthVertex = `
out vec2 vertexUV;
out vec3 vectorNormal;

void main(){
    vectorNormal= normalize(normalMatrix*normal);
    vertexUV= uv;
    gl_Position=projectionMatrix * modelViewMatrix* vec4(position,1.0);

}`;

/**
 * 星球 Fragment shader
 * 生成星球材質貼圖效果
 */
let earthFragment = `
uniform sampler2D globeTexture;
in vec2 vertexUV;
in vec3 vectorNormal;

void main(){
    float intensity = 1.05 - dot(vectorNormal,vec3(0.0,0.0,1.0));
    vec3 atmosphere = vec3(0.3,0.6,1.0)*pow(intensity,1.5);
    gl_FragColor=vec4(
        atmosphere+ texture2D(globeTexture,vertexUV).xyz
        ,1.0);
}`;

/**
 * 大氣光暈效果 Vertex shader
 */
let atmosphereVertex = `
out vec3 vectorNormal;

void main(){
    vectorNormal= normalize(normalMatrix*normal);
    gl_Position=projectionMatrix * modelViewMatrix* vec4(position,0.9);

}`;

/**
 * 大氣光暈效果 Fragment shader
 */
let atmosphereFragment = `
in vec3 vectorNormal;

void main(){
    float intensity =pow(0.5 - dot(vectorNormal,vec3(0.0,0.0,1.0)),2.0);
    gl_FragColor=vec4(0.59, 0.84, 0.99, 1.0)*intensity;

}`;

// 變數宣告
const router = useRouter();

const universeMode = ref(true); //宇宙模式
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const orbit = new OrbitControls(camera, renderer.domElement);

orbit.enableRotate = false;

let selectedObject: any | undefined = undefined;
let selectedObject_material: any | undefined = undefined;
let mouse = new THREE.Vector2();
let mouseClicked = ref(true);
let selected = ref(false);
let originalOpacity = 0.5;
let focusMode = ref(false);

// 鎖定星球時的光源
let tempPointLightList: any = [];

// 鎖定星球時的副產物
let planetDeck: any;
let planetDeckMesh: any;
let _atmosphere: any;
let additionalObjectDistance: any; //選中星球的半徑

let audioSphere: any;
let sunAnimationInterval: any;

// 點擊星球的資訊
const selectedObjectName: any = ref(undefined);
const planteContent: any = ref(undefined);

/**
 * 點擊特定行星後，這個函式負責根據選擇的行星導航到相應的路由或執行特定的操作。
 */
function toCateGoryPage() {
  if (visualizer) {
    visualizer.stopAudio();
  }

  selectedObjectName.value = selectedObject.name;
  switch (selectedObjectName.value) {
    case "jupiter":
      // router.push("/gallery_terrain/heatmap");

      break;
    case "venus":
      // router.push("/gallery_carMovement/displayCar");
      break;

    case "earth":
      // router.push("/gallery_Taiwan");
      break;
    case "mars":
      // router.push("/aps");
      break;

    case "uranus":
      // router.push("/shaderGallery");
      break;

    case "mercury":
      // router.push("/gravityGame");
      break;

    case "saturn":
      // router.push("/iotViewer");
      break;

    case "neptune":
      // router.push("/apsFilter");
      break;
    case "": // sun
      // router.push("/library");
      break;

    case "pluto":
      // router.push("/apsAnimation");
      break;
    default:
      break;
  }
}

/**
 * 監聽點擊到的星球名稱，給定對應的文本內容
 */
watch(selectedObjectName, () => {
  if (selectedObjectName.value === "jupiter") {
    planteContent.value =
      "在未來的太空探索時代，木星，作為太陽系中最大的行星，吸引了來自地球的科學家和探險家的極大興趣。在這一背景下，一位名為Tim的地形創早者，領導了一項前所未有的任務——在木星的衛星之一上進行地形創造實驀。Tim是一位具有豐富經驗的地質學家兼行星科學家，他對於行星地形的形成過程有著深刻的理解和獨到的見解。他提出了一個宏偉的計畫，旨在通過人工方法在木星的一個衛星上創造出穩定的地形結構，從而為未來的人類探索和居住提供可能性。這項計畫不僅需要精確的科學計算，還需要創新的技術和未來派的思維。";
  }

  if (selectedObjectName.value === "venus") {
    planteContent.value =
      "在未來的某一天，一群冒險家和賽車愛好者決定在金星上創造一種全新的賽車模式——自由開創賽道賽車。這個想法源於對極限挑戰的渴望和對未知世界的好奇。金星，作為地球的鄰居，其惡劣的環境和極端的氣候條件成為了一個完美的舞台。參賽的車輛不同於一般的賽車，它們被特別設計來適應金星的高溫和高壓環境，並且裝備了最先進的導航系統，以幫助駕駛員在幾乎零能見度的條件下導航。每一輛賽車都是一項技術奇蹟，展示了人類對於極端環境探索和適應的能力。";
  }

  if (selectedObjectName.value === "earth") {
    planteContent.value =
      "在台灣的一個繁忙都市中，有一位建築系的大學生，名叫Tim。Tim自小對建築有著濃厚的興趣，夢想著成為一名能夠設計出既美觀又實用的建築師。進入大學後，她發現要實現自己的夢想，需要付出遠超同齡人的努力和汗水。Tim的大學生活充滿了挑戰。建築系的課程繁重，從建築史的深厚積累到現代建築設計的創新技術，每一門課程都要求高度的專注和投入。除了課堂學習，Tim還要參與各種設計項目和競賽，這些都是她成長的重要機會。每當夜深人靜，其他學生早已進入夢鄉，Tim卻常常還在繪圖板前奮筆疾書，為的是將心中的設計理念完美呈現。在這樣高強度的學習和實踐中，Tim遇到了許多困難和挑戰。有時，她的設計被批評為不切實際或缺乏創新，這讓她感到非常沮喪。但她從未放棄，反而將這些批評作為成長的養分，不斷修正和提升自己的設計。Tim還積極參與實習和工作坊，希望通過實際操作來更深入地理解建築的精髓。";
  }
  if (selectedObjectName.value === "mars") {
    planteContent.value =
      "在不久的將來，人類終於達成了在火星上建立永久居住地的偉大目標。在這一過程中，一名年輕的建築管理專家，Tim扮演了關鍵的角色。Tim自小對宇宙充滿了無限的好奇和熱情，特別是對火星探索的夢想從未褪色。成為一名建築管理專家後，他始終希望能將自己的專業知識應用於太空探索中，特別是在火星建設上。隨著火星探索計劃的啟動，Tim得到了一生中最大的機會——加入了國際太空探索機構的火星居住項目，負責建築管理工作。這項任務不僅需要他有深厚的專業知識，更考驗著他的創新能力和應對極端環境的能力。";
  }

  if (selectedObjectName.value === "uranus") {
    planteContent.value =
      "在未來的某個時代，人類的藝術探索已經不再局限於地球，甚至延伸到了遙遠的太陽系各個角落。Tim，一位充滿想象力的視覺藝術家，決定將他的下一個藝術項目設定在神秘莫測的天王星上。Tim一直被天王星那獨特的藍綠色外觀和極端的季節變化所吸引。他想象中的天王星不僅是一個遙遠的冰冷天體，更是一個充滿了未知和美的藝術靈感源泉。為了將這種神秘的美帶給地球上的觀眾，Tim決定創作一系列以天王星為主題的視覺藝術作品。";
  }

  if (selectedObjectName.value === "mercury") {
    planteContent.value =
      "在太陽系的深處，有一顆被稱為水星的小行星，它是距離太陽最近的行星。水星是一個充滿奇跡與神秘的地方，它的一天等於地球上的58個地球日，而一年卻只有88個地球日。這意味著水星上的一天幾乎和它的一年一樣長。這個奇特的現象是由於它極端的軌道速度和緩慢的自轉速度共同作用的結果。在這個故事中，重力扮演著關鍵角色。水星的重力只有地球的約38%，這對於生活在地球上的我們來說，是一個難以想像的概念。如果你在水星上，你的體重將會是在地球上的大約三分之一。這樣輕的重力使得水星成為了一個充滿了跳躍和飄浮的世界，如果有人能在那裡行走，他們將能夠輕易地跳得更高，走得更快。然而，在這種惡劣的條件下，水星展示了宇宙中重力如何塑造行星環境的一個生動例證。它提醒我們，即使在最不可能的地方，自然界的力量也能創造出令人驚嘆的景觀和現象。水星與重力的故事是一個關於太陽系早期歷史的迷人章節，展示了宇宙是如何在重力的編織下，創造出無數星球和奇觀的。";
  }

  if (selectedObjectName.value === "saturn") {
    planteContent.value =
      "在不久的未來，人類的探索已經延伸到了太陽系的每一個角落，其中土星及其環繞的壯觀環帶吸引了特別的注意。在這樣的時代背景下，一位名叫Tim的年輕科學家，利用物聯網（IoT）技術，開創了一項前所未有的土星探索計劃。Tim是一位對太空探索充滿熱情的科學家，他深知要想深入了解土星及其衛星系的秘密，傳統的探測方式已經遠遠不夠。因此，他提出了一個大膽的計劃：在土星系部署一個由數千個微型探測器組成的物聯網（IoT）網絡。這些微型探測器將被設計成可以在土星的極端環境中生存，並且能夠收集各種數據，從土星的磁場到其衛星的地質結構。";
  }

  if (selectedObjectName.value === "neptune") {
    planteContent.value =
      "在未來的一個時代，人類的科技已經進步到了一個嶄新的領域，特別是在人工智能和深空探索方面。Tim，一位充滿熱情和創新精神的科學家，決定將這兩個領域結合起來，開展一項前所未有的探索計劃——利用先進的AI語言模型（LLM）來研究遙遠的海王星。Tim的計劃是這樣的：他打算開發一個特殊的AI LLM，這個模型不僅能夠處理和分析來自遙遠太空探測器的大量數據，還能夠根據這些數據生成關於海王星的詳細報告和預測。這個AI模型被命名為“海王星之眼”。";
  }
  if (selectedObjectName.value === "") {
    planteContent.value =
      "太陽黑子，這些看似小小的暗斑，實際上是太陽表面極其強大的磁場活動區域，它們能夠影響太陽表面的能量釋放，甚至對地球的氣候和太空天氣產生重大影響。然而，儘管人類對這些現象有了初步的了解，太陽黑子背後的深層機制仍然充滿著謎團。Tim和他的團隊開發了一種先進的探測系統，這套系統包括了一系列高度專業的太空探測器和地面觀測站，旨在對太陽黑子活動進行前所未有的詳細研究。這些探測器被設計成能夠承受極端的太陽輻射和高溫，並且可以近距離觀測太陽表面和內部結構，捕捉到關鍵的物理數據。";
  } // sun

  if (selectedObjectName.value === "pluto") {
    planteContent.value =
      "在未來的某個時刻，人類的科技發展已經達到了一個新的高度，特別是在動畫技術和太空探索領域。Tim，一位極具創造力和技術才華的動畫師，決定將這兩大領域結合，創造出一種全新的科普教育方式。他的目標是利用先進的系統動畫技術，讓人們以全新的視角了解遙遠的冥王星。Tim深知，儘管冥王星自2006年被重新定義為矮行星之後，公眾對它的興趣從未減退。相反，這個位於太陽系邊緣的小天體仍然充滿著謎團，吸引著無數科學家和太空愛好者的目光。因此，Tim決定將冥王星及其月球系統的神秘面紗以動畫的形式展現給全世界。";
  }
});

/**
 * 創建地球或其他行星的大氣層效果
 * @name 點擊的星球名稱
 * @size 大氣層球體的半徑
 * @position 大氣層球體在3D場景中的位置
 */
function createEarthAtmosphere(name: string, size: any, position: any) {
  const geo = new THREE.SphereGeometry(size, 30, 30);
  const mat = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertex,
    fragmentShader: atmosphereFragment,
    uniforms: {},
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.set(1.1, 1.1, 1.1);
  mesh.name = name + "Atmosphere";
  const obj = new THREE.Object3D();
  obj.add(mesh);

  scene.add(obj);
  mesh.position.x = position.x;
  mesh.position.y = position.y;
  mesh.position.z = position.z;

  return { mesh, obj };
}

/**
 * 從焦點模式退出，觸發一系列動畫，使相機位置和場景回到初始狀態。
 */
const continueAnimate = () => {
  if (visualizer) {
    visualizer.stopAudio();
    scene.remove(audioSphere);
    scene.remove(ico);
  }

  if (sunAnimationInterval) {
    clearInterval(sunAnimationInterval);
  }

  gsap.to(camera.position, {
    duration: 2,
    x: -90,
    y: 140,
    z: 140,
    ease: "power1.inOut",
    onUpdate: () => {
      mouse.x = -1;
      mouse.y = -1;

      camera.lookAt(new THREE.Vector3(0, 0, 0));
    },
    onComplete: () => {
      renderer.render(scene, camera);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      focusMode.value = false;
      universeMode.value = true;
      mouseClicked.value = true;
      tempPointLightList.forEach((light: any) => {
        scene.remove(light);
      });
      tempPointLightList = [];

      scene.remove(planetDeckMesh);
      planetDeckMesh = undefined; // 清除引用
      scene.remove(planetDeck);
      planetDeck = undefined; // 清除引用

      scene.remove(_atmosphere.mesh);
      scene.remove(_atmosphere.obj);
      _atmosphere = undefined; // 清除引用
    },
  });
};

/**
 * 處理用戶的點擊事件，更新鼠標位置變量mouse.x和mouse.y
 */
function onMouseClick(event: any) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  if (focusMode.value) {
    mouseClicked.value = false;
  } else {
    mouseClicked.value = true;
  }
}

let temp: any = 4;
/**
 * audio視覺效果相關的一個動畫步驟函式，用於周期性調整相機位置以創造動態效果。
 */
function step() {
  temp = -temp;
  audioSphereScaleMeshRandomly();
  gsap.to(camera.position, {
    duration: 1.5,
    x: camera.position.x,
    y: camera.position.y - temp,
    z: camera.position.z,
    ease: "power3.inOut",
    onUpdate: () => {
      camera.lookAt(new THREE.Vector3(0, 0, 0));
    },
  });
}
/**
 * 隨機調整音頻視覺化球體的尺寸，創造視覺動態效果
 */
function audioSphereScaleMeshRandomly() {
  let scaleFactor = Math.random() * 1.5 + 0.5;
  let scaleFactor1 = Math.random() * 1.5 + 0.5;
  let scaleFactor2 = Math.random() * 1.5 + 0.5;

  gsap.to(audioSphere.scale, {
    duration: 1,
    x: scaleFactor,
    y: scaleFactor1,
    z: scaleFactor2,
    ease: "elastic.out(1, 0.3)",
  });
}

/**
 * 當使用者選擇一個行星後，這個函式會移動相機以聚焦於選中的行星
 */
function moveCamera() {
  universeMode.value = false;
  focusMode.value = true;
  let globalPosition = new THREE.Vector3();
  selectedObject.getWorldPosition(globalPosition);
  if (selectedObject.geometry.parameters) {
    additionalObjectDistance = selectedObject.geometry.parameters.radius;
    console.log(selectedObject, selectedObject.position, globalPosition, additionalObjectDistance);
    let pointA: any;
    let distanceConstant: any; //距離乘上的一個常數
    if (globalPosition.x === 0 && globalPosition.y === 0 && globalPosition.z === 0) {
      pointA = new THREE.Vector3(17, 0, 0);
      distanceConstant = 1;
    } else {
      pointA = globalPosition; // 起始點座標
      distanceConstant = 4;
    }
    let pointB = new THREE.Vector3(0, 0, 0); // 終點座標

    // 計算方向向量
    let direction = new THREE.Vector3().subVectors(pointB, pointA).normalize();

    // 計算目標點座標（距離起始點20單位）
    let distance = additionalObjectDistance * distanceConstant;
    let targetPoint = pointA.clone().add(direction.multiplyScalar(distance));

    console.log(targetPoint);

    // 點擊星球的副產物生成
    planetDeck = new THREE.CylinderGeometry(
      additionalObjectDistance / 2,
      additionalObjectDistance / 2,
      0.15,
      64
    );
    const planetDeckMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
    });
    planetDeckMaterial.transparent = true;
    planetDeckMaterial.opacity = 0.8;
    planetDeckMaterial.metalness = 1;
    planetDeckMaterial.roughness = 0.1;
    planetDeckMaterial.aoMapIntensity = 1;
    planetDeckMaterial.envMapIntensity = 1;
    planetDeckMesh = new THREE.Mesh(planetDeck, planetDeckMaterial);
    planetDeckMesh.position.x += globalPosition.x;
    planetDeckMesh.position.y += globalPosition.y - additionalObjectDistance * 1.3;
    planetDeckMesh.position.z += globalPosition.z;
    planetDeckMesh.castShadow = false;
    planetDeckMesh.receiveShadow = true;
    scene.add(planetDeckMesh);

    // 點擊星球的背景燈光生成
    let tempPointLight = new THREE.SpotLight(0xffffff10, 10, 100);
    tempPointLight.position.set(
      globalPosition.x - additionalObjectDistance * 3,
      globalPosition.y - additionalObjectDistance * 1.3,
      globalPosition.z - additionalObjectDistance * 3
    );
    scene.add(tempPointLight);
    tempPointLightList.push(tempPointLight);

    let tempPointLight1 = new THREE.SpotLight(0xffffff, 10, 100);
    tempPointLight1.position.set(
      globalPosition.x + additionalObjectDistance * 3,
      globalPosition.y - additionalObjectDistance * 1.3,
      globalPosition.z + additionalObjectDistance * 3
    );
    scene.add(tempPointLight1);
    tempPointLightList.push(tempPointLight1);

    let tempPointLight2 = new THREE.PointLight(0xffffff, 10, 100);
    tempPointLight2.position.set(
      globalPosition.x - additionalObjectDistance * 1.5,
      globalPosition.y - additionalObjectDistance * 1.3,
      globalPosition.z - additionalObjectDistance * 1.5
    );
    scene.add(tempPointLight2);
    tempPointLightList.push(tempPointLight2);
    let tempPointLight3 = new THREE.PointLight(0xffffff, 10, 100);
    tempPointLight3.position.set(
      globalPosition.x + additionalObjectDistance * 1.5,
      globalPosition.y - additionalObjectDistance * 1.3,
      globalPosition.z + additionalObjectDistance * 1.5
    );
    scene.add(tempPointLight3);
    tempPointLightList.push(tempPointLight3);

    let tempPointLight4 = new THREE.PointLight(0xffffff, 1000, 100);
    tempPointLight4.position.set(globalPosition.x - 2, globalPosition.y - 10, globalPosition.z - 2);
    scene.add(tempPointLight4);
    tempPointLightList.push(tempPointLight4);

    let tempPointLight5 = new THREE.PointLight(0xffffff, 1000, 100);
    tempPointLight5.position.set(globalPosition.x + 2, globalPosition.y - 10, globalPosition.z + 2);
    scene.add(tempPointLight5);
    tempPointLightList.push(tempPointLight5);

    _atmosphere = createEarthAtmosphere("earth", additionalObjectDistance, globalPosition);

    gsap.to(camera.position, {
      duration: 2,
      x: targetPoint.x,
      y: targetPoint.y,
      z: targetPoint.z,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.lookAt(globalPosition); // 確保在動畫過程中相機一直朝向目標點
      },
    });
  }
}

/**
 * 離開此頁面前刪除音樂播放
 */
onUnmounted(() => {
  if (visualizer) {
    visualizer.stopAudio();
  }
});

/**
 *3D場景中建立一個表示行星的物件
 *@name 指定行星的名稱。這個名稱用於識別場景中的行星對象，可以在後續的互動或處理中通過名字引用該行星。
 *@size 星球體的半徑
 *@texture 紋理貼圖路徑
 *@position 行星相對於太陽（場景中心點）的位置
 *@ring 可選參數，用於為特定的行星添加環系統（如土星環）
 */
function createPlanete(name: string, size: any, texture: any, position: any, ring: any) {
  const geo = new THREE.SphereGeometry(size, 50, 50);
  const mat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(texture),
    transparent: true,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.material.opacity = 0.5;
  mesh.name = name;
  const obj = new THREE.Object3D();
  obj.add(mesh);
  if (ring) {
    const ringGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(ring.texture),
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    obj.add(ringMesh);
    ringMesh.position.x = position;
    ringMesh.rotation.x = -0.5 * Math.PI;
  }
  scene.add(obj);
  mesh.position.x = position;
  return { mesh, obj };
}

onMounted(() => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  const universe = document.getElementById("universeContainer");
  universe?.appendChild(renderer.domElement);

  camera.position.set(-90, 140, 140);

  orbit.update();

  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);

  const cubeTextureLoader = new THREE.CubeTextureLoader();
  scene.background = cubeTextureLoader.load([
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
    starsTexture,
  ]);

  const sunGeo = new THREE.SphereGeometry(16, 30, 30);
  const sunMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load(sunTexture),
  });
  const sun = new THREE.Mesh(sunGeo, sunMat);

  scene.add(sun);

  const mercury = createPlanete("mercury", 3.2, mercuryTexture, 28, undefined);
  const venus = createPlanete("venus", 5.8, venusTexture, 44, undefined);
  const earth = createPlanete("earth", 7, earthTexture, 62, undefined);

  const mars = createPlanete("mars", 4, marsTexture, 78, undefined);
  const jupiter = createPlanete("jupiter", 12, jupiterTexture, 100, undefined);
  const saturn = createPlanete("saturn", 10, saturnTexture, 138, {
    innerRadius: 10,
    outerRadius: 20,
    texture: saturnRingTexture,
  });
  const uranus = createPlanete("uranus", 7, uranusTexture, 176, {
    innerRadius: 7,
    outerRadius: 12,
    texture: uranusRingTexture,
  });

  const neptune = createPlanete("neptune", 7, neptuneTexture, 200, undefined);
  const pluto = createPlanete("pluto", 2.8, plutoTexture, 216, undefined);

  const pointLight = new THREE.PointLight(0xffffff, 10000, 30000000);
  scene.add(pointLight);

  function animate() {
    if (audioSphere) {
      audioSphere.rotateY(0.01);
    }
    //Self-rotation
    sun.rotateY(0.004);
    mercury.mesh.rotateY(0.004);
    venus.mesh.rotateY(0.002);
    earth.mesh.rotateY(0.02);
    mars.mesh.rotateY(0.018);
    jupiter.mesh.rotateY(0.02);
    saturn.mesh.rotateY(0.02);
    uranus.mesh.rotateY(0.02);
    neptune.mesh.rotateY(0.02);
    pluto.mesh.rotateY(0.008);
    if (mouseClicked.value) {
      //Around-sun-rotation
      mercury.obj.rotateY(0.04);
      venus.obj.rotateY(0.015);
      earth.obj.rotateY(0.01);
      mars.obj.rotateY(0.008);
      jupiter.obj.rotateY(0.002);
      saturn.obj.rotateY(0.0009);
      uranus.obj.rotateY(0.0004);
      neptune.obj.rotateY(0.0001);
      pluto.obj.rotateY(0.00007);
    }
    raycaster.setFromCamera(mouse, camera);
    // 計算物體與射線（由鼠標位置產生）的交點。
    let intersects = [] as any;
    // mouseClicked.value = true;
    intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0 && mouseClicked.value === true) {
      if (selectedObject) {
        selectedObject.material = selectedObject_material;
        selectedObject.material.opacity = originalOpacity;
        selectedObject.material.transparent = true;
        selectedObject.material.wireframe = false;
        console.log("Clicked object", intersects[0].object);
        mouseClicked.value = false;

        // 更新當前選擇的物件。
        selectedObject = intersects[0].object;
        selectedObjectName.value = selectedObject.name;
        selectedObject_material = selectedObject.material;
        originalOpacity = selectedObject.material.opacity;
        selected.value = true;
        selectedObject.material.opacity = 1;
        selectedObject.material.transparent = true;

        const mat = new THREE.ShaderMaterial({
          vertexShader: earthVertex,
          fragmentShader: earthFragment,
          uniforms: {
            globeTexture: {
              value: new THREE.TextureLoader().load(
                selectedObject.material.map.source.data.currentSrc
              ),
            },
          },
        });
        selectedObject.material = mat;
        moveCamera();

        if (intersects[0].object.name === "") {
          const geometry = new THREE.SphereGeometry(0.2, 320, 320);
          const material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            emissive: 0xb36555,
            specular: 0xfafafa,
            shininess: 30,
            flatShading: true,
            wireframe: false,
            vertexColors: true,
            fog: true,
            envMap: null,
            combine: THREE.MultiplyOperation,
            reflectivity: 0.1,
            refractionRatio: 0.5,
          });
          audioSphere = new THREE.Mesh(geometry, material);
          audioSphere.position.set(0, 0, 0);
          scene.add(audioSphere);
          audioSphereScaleMeshRandomly();
          setTimeout(() => {
            startApp(scene, camera);
            gsap.to(camera.position, {
              duration: 2,
              x: camera.position.x,
              y: camera.position.y - 1,
              z: camera.position.z,
              ease: "power3.inOut",
              onUpdate: () => {
                audioSphereScaleMeshRandomly();
                camera.lookAt(new THREE.Vector3(0, 0, 0)); // 確保在動畫過程中相機一直朝向目標點
              },
            });
          }, 3000);

          setTimeout(() => {
            gsap.to(camera.position, {
              duration: 2,
              x: camera.position.x,
              y: camera.position.y - 3,
              z: camera.position.z,
              ease: "power3.inOut",
              onUpdate: () => {
                audioSphereScaleMeshRandomly();
                camera.lookAt(new THREE.Vector3(0, 0, 0));
              },
            });

            sunAnimationInterval = setInterval(step, 4000);
          }, 6000);
        }
      } else {
        if (intersects[0].object.name !== "") {
          // intersects[0].object 是第一個被點擊的物體。
          //第一次
          console.log("Clicked object", intersects[0].object);

          // 更新當前選擇的物件。
          selectedObject = intersects[0].object;
          selectedObject_material = selectedObject.material;

          originalOpacity = selectedObject.material.opacity;
          selected.value = true;
          // 設置透明效果。
          selectedObject.material.opacity = 1;
          selectedObject.material.transparent = true;
        } else {
        }
      }
    } else {
      selected.value = false;
    }

    if (audioMat) {
      audioMat.uniforms.uTime.value = clock.getDelta() / 1000;
      const freq = visualizer.update();
      // console.log(freq);
      // softGlitch.factor = freq > 0.4 ? 0.7 : 0.1;
    }
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  universe?.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  universe?.addEventListener("click", onMouseClick, false);
});
</script>

<style scoped></style>
