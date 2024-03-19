import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class avatarSceneSetup {
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private mixer!: THREE.AnimationMixer;
  private container: HTMLElement | null;
  private isStumbling: boolean = false;
  clock: any;
  avatar: any;
  scene!: THREE.Scene;
  waveHandAction!: any;
  waveAction!: any;
  stumbleAction!: any;
  stars!: THREE.Points;

  /**
   * 構造函式，初始化3D場景。它接收GLTF模型（通常是一個角色或者物件）和一個HTML容器的ID。
   * 在這個函式中，會設定渲染器、相機、控制器、場景、光照，加載角色，創建底座，加載動畫，設定事件監聽器，並啟動動畫循環
   * @param gltf 模型
   * @param containerId canvas的id
   */
  constructor(gltf: any, containerId: string) {
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.initializeRenderer();
      this.setupCamera();
      this.setupControls();
      this.setupScene();
      this.setupLighting();
      this.loadAvatar(gltf);
      this.createPedestal();
      this.loadAnimations(gltf);
      this.setupEventListeners();
      this.animate();
    }
  }
  /**
   * 初始化渲染器，設定抗鋸齒、背景透明度等，並將渲染器的DOM元素添加到HTML容器中
   */
  private initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container!.appendChild(this.renderer.domElement);
  }

  /**
   * 設置場景中的相機位置和參數，如視角、長寬比、近截面和遠截面距離
   */
  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container!.clientWidth / this.container!.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0.2, 0.5, 1);
  }

  /**
   * 配置相機控制器，例如啟用阻尼效果，禁用平移和縮放，設置最小和最大極角等
   */
  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.minDistance = 3;
    this.controls.minPolarAngle = 1.4;
    this.controls.maxPolarAngle = 1.4;
    this.controls.target.set(0, 0.75, 0);
    this.controls.enabled = false;
    this.controls.update();
  }

  /**
   * 初始化一個新的3D場景
   */
  private setupScene() {
    this.scene = new THREE.Scene();
  }

  /**
   * 在場景中添加環境光和聚光燈，以及一個方向光來模擬現實世界的光照效果
   */
  private setupLighting() {
    this.scene.add(new THREE.AmbientLight());

    const spotlight = new THREE.SpotLight(0xffffff, 20, 8, 1);
    spotlight.penumbra = 0.5;
    spotlight.position.set(0, 4, 2);
    spotlight.castShadow = true;
    this.scene.add(spotlight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(1, 1, 2);
    keyLight.lookAt(new THREE.Vector3());
    this.scene.add(keyLight);
  }

  /**
   * 加載GLTF模型到場景中，並遍歷模型的每一個mesh，設定其可以投影和接收陰影
   * @param gltf 模型
   */
  private loadAvatar(gltf: any) {
    this.avatar = gltf.scene;
    this.avatar.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    this.scene.add(this.avatar);
    this.mixer = new THREE.AnimationMixer(this.avatar);
  }

  /**
   * 創建一個底座，讓角色站立在上面
   */
  private createPedestal() {
    const groundGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 64);
    const groundMaterial = new THREE.MeshStandardMaterial();
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.castShadow = false;
    groundMesh.receiveShadow = true;
    groundMesh.position.y -= 0.05;
    this.scene.add(groundMesh);
  }

  /**
   * 從GLTF模型中加載動畫，並創建對應的動畫動作
   * @param gltf 模型
   */
  private loadAnimations(gltf: any) {
    const clips = gltf.animations;
    this.waveAction = this.mixer.clipAction(THREE.AnimationClip.findByName(clips, "mixamo.com"));
    this.stumbleAction = this.mixer.clipAction(
      THREE.AnimationClip.findByName(clips, "Animation_Armature.001")
    );
    this.waveHandAction = this.mixer.clipAction(
      THREE.AnimationClip.findByName(clips, "waving_avatar")
    );

    let raycaster = new THREE.Raycaster();
    this.container!.addEventListener("mousedown", (ev) =>
      this.onMouseDown(ev, raycaster, this.waveAction, this.stumbleAction)
    );
    this.waveAction.play();
  }

  /**
   * 處理鼠標點擊事件，當點擊到角色時，會觸發絆倒（stumble）動畫，之後再恢復到揮手（wave）動畫。
   * @param ev 事件
   * @param raycaster 點擊位置
   * @param waveAction 揮手動畫
   * @param stumbleAction 跳出動畫
   * @returns
   */
  private onMouseDown(
    ev: MouseEvent,
    raycaster: THREE.Raycaster,
    waveAction: THREE.AnimationAction,
    stumbleAction: THREE.AnimationAction
  ) {
    if (this.isStumbling) return;

    const coords = {
      x: (ev.offsetX / this.container!.clientWidth) * 2 - 1,
      y: -(ev.offsetY / this.container!.clientHeight) * 2 + 1,
    } as THREE.Vector2;

    raycaster.setFromCamera(coords, this.camera);
    const intersections = raycaster.intersectObject(this.avatar);

    if (intersections.length > 0) {
      this.isStumbling = true;
      stumbleAction.reset();
      stumbleAction.play();
      waveAction.crossFadeTo(stumbleAction, 0.3, true);

      setTimeout(() => {
        waveAction.reset();
        waveAction.play();
        stumbleAction.crossFadeTo(waveAction, 1, true);
        setTimeout(() => (this.isStumbling = false), 1000);
      }, 1000);
    }
  }

  /**
   * 事件監聽器，主要是為了處理窗口大小變化事件
   */
  private setupEventListeners() {
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  /**
   * 當窗口大小改變時，更新相機的長寬比，並調整渲染器的大小
   */
  private onWindowResize() {
    this.camera.aspect = this.container!.clientWidth / this.container!.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
  }

  /**
   * 啟動動畫循環
   */
  private animate() {
    const animate = () => {
      requestAnimationFrame(animate);
      this.mixer.update(this.clock.getDelta());
      this.renderer.render(this.scene, this.camera);
    };
    this.clock = new THREE.Clock();
    animate();
  }
}
