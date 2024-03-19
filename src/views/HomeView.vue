<script setup lang="ts">
import { RouterView, useRouter } from "vue-router";
import { NButton, NRate } from "naive-ui";
import { onMounted, ref, watch } from "vue";
import gsap from "gsap";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "dat.gui";
import { usePageSateStore } from "@/stores/PageSateStore";
import { storeToRefs } from "pinia";
const { changePosture } = storeToRefs(usePageSateStore());
import { avatarSceneSetup } from "@/composables/createHomePageScene";

const router = useRouter();
const showAboutPageContent = ref(false);
let waveAction = {} as any;
let stumbleAction = {} as any;
let waveHandAction = {} as any;
let Avatar = {} as any;
let _OrbitControls: any;
let camera: any;
let backgroundPlaneMesh: THREE.Mesh;
const backgroundContainer = ref(null);

const mouse = {
  x: undefined,
  y: undefined,
} as any;

const gui = new dat.GUI();
const world = {
  plane: {
    width: 300,
    height: 300,
    widthSegments: 50,
    heightSegments: 50,
  },
};

/**
 * 切換回主頁面。它會改變changePosture狀態
 */
const switchMainPage = () => {
  changePosture.value = !changePosture.value;
  showAboutPageContent.value = false;
  router.push("/");
};

/**
 * 加載GLTF模型。
 * 並在加載成功後創建avatarSceneSetup的實例來設置場景，隱藏加載指示器
 */
function loadModel() {
  const loader = new GLTFLoader();
  loader.load(
    "/Tim.glb",
    (gltf) => {
      Avatar = new avatarSceneSetup(gltf, "avatar-container");
      waveHandAction = Avatar.waveHandAction;
      stumbleAction = Avatar.stumbleAction;
      waveAction = Avatar.waveAction;

      console.log(Avatar);
      //@ts-ignore
      document.getElementById("avatar-loading").style.display = "none";
    },
    (xhr: any) => {
      const percentCompletion = Math.round((xhr.loaded / xhr.total) * 100);
      //@ts-ignore
      document.getElementById("avatar-loading").innerText = `LOADING... ${percentCompletion}%`;
      console.log(`Loading model... ${percentCompletion}%`);
    },
    (error: any) => {
      console.log(error);
    }
  );
}

/**
 * 處理動畫切換的過度效果
 */
watch(changePosture, (N, O) => {
  if (N) {
    console.log(changePosture.value, waveHandAction);
    waveHandAction.reset();
    waveHandAction.play();
    //@ts-ignore
    waveAction.crossFadeTo(waveHandAction, 0.3);
  } else {
    waveAction.reset();
    waveAction.play();
    //@ts-ignore
    waveHandAction.crossFadeTo(waveAction, 0.3);
  }
});

/**
 * 切換到關於頁面。它會導航到"/about"路由，
 * 改變changePosture的狀態，並在1秒後顯示關於頁面的內容。
 */
const switchAbout = () => {
  router.push("/about");
  changePosture.value = true;

  setTimeout(() => {
    showAboutPageContent.value = true;
  }, 1000);
};

/**
 * 導航到星球頁面。
 * 將相機移動到特定位置，最後導航到"/gallery"路徑。
 */
const gotoGallery = (event: any) => {
  _OrbitControls.enabled = true;

  event.preventDefault();
  gsap.to("#container", {
    opacity: 0,
  });

  gsap.to(camera.position, {
    z: 25,
    ease: "power3.inOut",
    duration: 2,
  });
  gsap.to(camera.rotation, {
    x: 1.57,
    ease: "power3.inOut",
    duration: 2,
  });

  gsap.to(camera.position, {
    y: 1000,
    ease: "power3.in",
    duration: 1,
    delay: 2,
    onComplete: () => {
      router.push("/gallery");
    },
  });
};

/**
 * 生成背景平面。這個方法會根據world.plane物件中的參數創建一個新的平面幾何體
 * ，並隨機調整頂點位置來模擬波動效果
 */
function generatePlane() {
  backgroundPlaneMesh.geometry.dispose();
  backgroundPlaneMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );
  const { array } = backgroundPlaneMesh.geometry.attributes.position;
  const randomValues = [];
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i];
      const y = array[i + 1];
      const z = array[i + 2];
      array[i] = x + (Math.random() - 0.5) * 5;
      array[i + 1] = y + (Math.random() - 0.5) * 5;
      array[i + 2] = z + (Math.random() - 0.5) * 5;
    }
    randomValues.push(Math.random() * Math.PI * 2);
  }
  //@ts-ignore
  backgroundPlaneMesh.geometry.attributes.position.randomValues = randomValues;
  //@ts-ignore
  backgroundPlaneMesh.geometry.attributes.position.originalPosition =
    backgroundPlaneMesh.geometry.attributes.position.array;
  const colors = [];
  for (let i = 0; i < backgroundPlaneMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.09, 0.4);
  }
  backgroundPlaneMesh.geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );
}

onMounted(() => {
  changePosture.value = false;

  const raycaster = new THREE.Raycaster();
  const scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(devicePixelRatio);

  renderer.shadowMap.enabled = true;
  if (backgroundContainer.value) {
    //@ts-ignore
    backgroundContainer.value.appendChild(renderer.domElement);
  }
  _OrbitControls = new OrbitControls(camera, renderer.domElement);
  _OrbitControls.enabled = false;
  camera.position.z = 50;
  //
  const planeGeometry = new THREE.PlaneGeometry(
    world.plane.width,
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
  );
  const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    shininess: 2,
    flatShading: true,
    vertexColors: true,
  });

  backgroundPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(backgroundPlaneMesh);

  generatePlane();

  const s_light = new THREE.SpotLight(0xffffff, 5000);
  s_light.position.set(0, 45, 15);
  scene.add(s_light);
  s_light.castShadow = true;

  const s_light2 = new THREE.SpotLight(0xffffff, 3000);
  s_light2.position.set(40, 25, 55);
  scene.add(s_light2);

  const s_light3 = new THREE.SpotLight(0xffffff, 2000);
  s_light3.position.set(-70, 45, 95);
  scene.add(s_light3);

  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, -1, 1);
  scene.add(light);

  const backLight = new THREE.DirectionalLight(0xffffff, 1);
  backLight.position.set(0, 0, -10);
  scene.add(backLight);

  const backLightHelper = new THREE.DirectionalLightHelper(backLight, 5);
  scene.add(backLightHelper);

  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
  });

  const starVerticies = <any>[];

  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVerticies.push(x, y, z);
  }

  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVerticies, 3));
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  let frame = 0;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    raycaster.setFromCamera(mouse, camera);
    frame += 0.01;
    //@ts-ignore
    const { array, originalPosition, randomValues } =
      backgroundPlaneMesh.geometry.attributes.position;
    for (let i = 0; i < array.length; i += 3) {
      // x
      array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01;
      // y
      array[i + 1] = originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.001;
    }
    backgroundPlaneMesh.geometry.attributes.position.needsUpdate = true;
    const intersects = raycaster.intersectObject(backgroundPlaneMesh);
    if (intersects.length > 0) {
      //@ts-ignore

      const { color } = intersects[0].object.geometry.attributes;
      // vertice 1
      //@ts-ignore
      color.setX(intersects[0].face.a, 0.1);
      //@ts-ignore
      color.setY(intersects[0].face.a, 0.1);
      //@ts-ignore
      color.setZ(intersects[0].face.a, 1);
      // vertice 2
      //@ts-ignore
      color.setX(intersects[0].face.b, 0.1);
      //@ts-ignore
      color.setY(intersects[0].face.b, 0.5);
      //@ts-ignore
      color.setZ(intersects[0].face.b, 1);
      // vertice 3
      //@ts-ignore
      color.setX(intersects[0].face.c, 0.1);
      //@ts-ignore
      color.setY(intersects[0].face.c, 0.5);
      //@ts-ignore
      color.setZ(intersects[0].face.c, 1);
      //@ts-ignore
      intersects[0].object.geometry.attributes.color.needsUpdate = true;

      const initialColor = {
        r: 0,
        g: 0.09,
        b: 0.4,
      };
      const hoverColor = {
        r: 0.1,
        g: 0.5,
        b: 1,
      };

      gsap.to(hoverColor, {
        r: initialColor.r,
        g: initialColor.g,
        b: initialColor.b,
        duration: 1,
        onUpdate: () => {
          // vertice 1
          //@ts-ignore
          color.setX(intersects[0].face.a, hoverColor.r);
          //@ts-ignore
          color.setY(intersects[0].face.a, hoverColor.g);
          //@ts-ignore
          color.setZ(intersects[0].face.a, hoverColor.b);
          // vertice 2
          //@ts-ignore
          color.setX(intersects[0].face.b, hoverColor.r);
          //@ts-ignore
          color.setY(intersects[0].face.b, hoverColor.g);
          //@ts-ignore
          color.setZ(intersects[0].face.b, hoverColor.b);
          // vertice 3
          //@ts-ignore
          color.setX(intersects[0].face.c, hoverColor.r);
          //@ts-ignore
          color.setY(intersects[0].face.c, hoverColor.g);
          //@ts-ignore
          color.setZ(intersects[0].face.c, hoverColor.b);
          color.needsUpdate = true;
        },
      });
    }
    stars.rotation.x += 0.0005;
  }

  loadModel();
  animate();

  window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / innerHeight) * 2 + 1;
  });

  window.addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix(); //Updates the camera projection matrix. Must be called after any change of parameters.
    renderer.setSize(innerWidth, innerHeight);
  });
});
</script>

<template>
  <div class="wrapper">
    <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->
    <div class="backBtnWrap" v-if="showAboutPageContent">
      <n-button type="tertiary" size="small" class="backBtn" @click="switchMainPage"
        >⬅ Back</n-button
      >
    </div>
    <div id="sky" ref="backgroundContainer"></div>
    <div id="container">
      <div class="mainWrap">
        <div class="mainAvatarwrap" id="avatar-container">
          <div id="avatar-loading"></div>
        </div>
        <Transition name="slide-fade" v-if="showAboutPageContent">
          <div class="skillListWrap">
            <div class="skillList">
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/csharp.png" alt="C#" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="4" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/js.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="4" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon_L" src="/skillIcon/vue.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="4" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/py.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="4" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/sql.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="4" />
                </div>
              </div>
            </div>
            <div class="skillList">
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/LN.jpg" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="3" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/revit.jpg" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="5" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/rhino.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="3" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/grasshopper.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="4" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/revit-dynamo.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="5" />
                </div>
              </div>
            </div>
            <div class="skillList">
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/unity.jpg" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="3" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/lumi.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="3" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/ps.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="3" />
                </div>
              </div>
              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/Illustrator.png" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="3" />
                </div>
              </div>

              <div class="skillItem">
                <div class="skillName">
                  <img class="skillIcon" src="/skillIcon/id.jpg" alt="JS" srcset="" />
                </div>
                <div class="skillRate">
                  <n-rate class="rate" readonly :default-value="3" />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <Transition name="slide-fade">
        <div class="mainViewContentwrap" id="mainViewContentwrap" v-if="!changePosture">
          <div class="portfolioTitle">
            <h1 id="Name" style=""><span class="gradient-text">Tim Huang</span> Portfolio</h1>
          </div>
          <div class="portfolioContent">
            <p id="content">
              A year ago, Tim graduated from the Department of Architecture and joined an building
              information management company, starting his career. As a budding engineer, Tim is
              filled with enthusiasm and curiosity, especially with a strong interest in studying
              emerging technologies. He is well aware that, as technology advances, the construction
              industry is also constantly evolving. In particular, the application of web 3D
              technology and Building Information Modeling (BIM) technology is gradually becoming an
              indispensable part of the design and construction process.
            </p>
          </div>
          <div class="portfolioLink">
            <n-button text-color="#FFFFFF" id="button" size="large" @click="gotoGallery">
              View Work
            </n-button>
            <n-button text-color="#FFFFFF" id="about_button" size="large" @click="switchAbout">
              About Me
            </n-button>
          </div>
        </div></Transition
      >

      <router-view v-if="showAboutPageContent"></router-view>
    </div>
  </div>
</template>

<style scoped></style>
