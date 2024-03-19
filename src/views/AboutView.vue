<script setup lang="ts">
import { usePageSateStore } from "@/stores/PageSateStore";
import { storeToRefs } from "pinia";
import { NIcon } from "naive-ui";

import { useRouter } from "vue-router";
import { CameraSelfie } from "@vicons/tabler";
import { Education } from "@vicons/carbon";
import { onMounted, ref, watch } from "vue";

import iframeViewer from "@/components/iframeViewer.vue";

const popoutShow = ref(false);
const router = useRouter();
const clickedTimelineItem = ref("");
const { changePosture } = storeToRefs(usePageSateStore());

// ============================================
const BIMPPTiframe = ref(false);
const graduateProject = ref(false);
const NUUworkshop = ref(false);
const Dynamoworkshop = ref(false);
const myPaper = ref(false);
const myProject = ref(false);
const myWork = ref(false);

const timelineItems = ref([
  { type: "error", content: "智慧城市數位工作營暨講座活動", time: "2017" },
  { title: "工讀", type: "success", content: "聖坤營造公司 ( 工讀 )", time: "2018-01" },
  { title: "實習", type: "success", content: "石昭永建築師事務所", time: "2018-07" },
  { type: "error", content: "高科大建築資訊模型專案整合發展中心 Dynamo 進階課程", time: "2019-03" },
  { title: "工讀", type: "success", content: "戴育澤建築師事務所", time: "2018-07" },
  { type: "warning", content: "錄取成功大學及台灣科技大學建築系碩士班", time: "2019-11" },
  { type: "info", content: "104 級聯合大學建築系畢業展覽總召", time: "2020" },
  { title: "工讀", type: "success", content: "若水國際 BIM 部門實習生", time: "2020-09" },
  { title: "工讀", type: "success", content: "廣懋材料科技股份有限公司", time: "2021-09" },
  { type: "warning", content: "參與科技部計畫帷幕單元知識庫計畫", time: "2021-07" },
  { type: "warning", content: "取得碩士學位", time: "2022-07" },
  { title: "Forge工程師", type: "success", content: "天茶智能科技公司", time: "2023-01" },
]);

const iframeData = ref(<any>{});

watch(clickedTimelineItem, () => {
  switch (clickedTimelineItem.value) {
    case "天茶智能科技公司":
      popoutShow.value = true;
      BIMPPTiframe.value = true;
      iframeData.value = iframes["BIMPPTiframe"];
      console.log(iframeData.value);
      break;
    case "104 級聯合大學建築系畢業展覽總召":
      popoutShow.value = true;
      graduateProject.value = true;
      iframeData.value = iframes["graduateProject"];
      break;
    case "智慧城市數位工作營暨講座活動":
      popoutShow.value = true;
      NUUworkshop.value = true;
      iframeData.value = iframes["NUUworkshop"];
      break;
    case "高科大建築資訊模型專案整合發展中心 Dynamo 進階課程":
      popoutShow.value = true;
      Dynamoworkshop.value = true;
      iframeData.value = iframes["Dynamoworkshop"];
      break;
    case "參與科技部計畫帷幕單元知識庫計畫":
      popoutShow.value = true;
      myPaper.value = true;
      iframeData.value = iframes["myWork"];
      break;
    case "取得碩士學位":
      popoutShow.value = true;
      myProject.value = true;
      iframeData.value = iframes["myPaper"];
      break;
    case "聖坤營造公司 ( 工讀 )":
      popoutShow.value = true;
      myWork.value = true;
      iframeData.value = iframes["myWork"];
      break;
    case "石昭永建築師事務所":
      popoutShow.value = true;
      myWork.value = true;
      iframeData.value = iframes["myWork"];
      break;
    case "戴育澤建築師事務所":
      popoutShow.value = true;
      myWork.value = true;
      iframeData.value = iframes["myWork"];
      break;
    case "若水國際 BIM 部門實習生":
      popoutShow.value = true;
      myWork.value = true;
      iframeData.value = iframes["myWork"];
      break;
    case "廣懋材料科技股份有限公司":
      popoutShow.value = true;
      myWork.value = true;
      iframeData.value = iframes["myWork"];
      break;
    default:
      break;
  }
});

const iframes = {
  BIMPPTiframe: {
    src: "https://gamma.app/embed/j26puix0bbcqero",
    title: "關於我",
  },
  graduateProject: {
    src: "https://www.team20map.com/art_works/1247",
    title: "team20",
  },
  NUUworkshop: {
    src: "https://arch.nuu.edu.tw/p/406-1085-42698,r1456.php?Lang=zh-tw",
    title: "NUU workshop",
  },
  Dynamoworkshop: {
    src: "https://www.facebook.com/CACIM.ADT/posts/%E4%B8%AD%E5%BF%83%E5%A0%B1%E5%91%8A%E9%87%8D%E8%A6%81%E4%BA%8B%E9%A0%85%E4%B8%80%E9%AB%98%E9%9B%84%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%B8%E5%BB%BA%E7%AF%89%E8%B3%87%E8%A8%8A%E6%A8%A1%E5%9E%8B%E5%B0%88%E6%A1%88%E6%95%B4%E5%90%88%E7%99%BC%E5%B1%95%E4%B8%AD%E5%BF%83%E7%89%B9%E5%88%A5%E9%82%80%E8%AB%8B%E9%99%B3%E5%8D%97%E5%AE%8F%E8%80%81%E5%B8%AB%E5%89%8D%E4%BE%86%E6%95%99%E6%8E%88dynamo%E9%80%B2%E9%9A%8E%E8%AA%B2%E7%A8%8B%E4%B8%BB%E8%A6%81%E6%8E%A2%E8%A8%8E2%E5%80%8B%E7%B3%BB%E5%88%97%E7%9A%84rd-revit-dynamo%E9%81%8B%E7%94%A8%E5%88%86%E5%88%A5/600926113706187/",
    title: "Dynamo workshop",
  },
  myProject: {
    src: "https://drive.google.com/file/d/1Y6_Da6oribQNxDQ6POUFXaYIKGPo4iUz/view",
    title: "Dynamo workshop",
  },
  myWork: {
    src: "https://drive.google.com/file/d/1svxt7s9u_zx1pYl9Zb-Uf92KIR_5NvNF/view",
    title: "Dynamo workshop",
  },
  myPaper: {
    src: "https://docs.google.com/presentation/d/e/2PACX-1vS6XMEA05DKXEPhnxY_wlU71y-apbLpUMTPg5dBR3FXX7eiC-rd7LuxBEfETtoTKiizjMBsXPNaffSa/embed?start=false&loop=false&delayms=5000",
    title: "Dynamo workshop",
  },
};

const closeAlliframe = () => {
  popoutShow.value = false;
};

onMounted(() => {
  const timelineItems = document.querySelectorAll(".n-timeline-item-content__content");
  const timelineItemsList = [...timelineItems];
  console.log(timelineItemsList);
  timelineItemsList.forEach((e: any) => {
    e.addEventListener("click", (event: any) => {
      clickedTimelineItem.value = event.target.innerText;
      console.log(event.target.innerText);
    });
  });
});
</script>
<template>
  <div class="popout_PPT" v-if="popoutShow">
    <div class="control">
      <button type="button" class="cancelBtn" @click="closeAlliframe">X</button>
    </div>
    <iframeViewer :src="iframeData.src" :title="iframeData.title"> </iframeViewer>
  </div>

  <div class="aboutPageWrap">
    <div class="about">
      <!-- 個人介紹 -->
      <div class="towRow">
        <div class="aboutSection_towRow">
          <div class="aboutSectionTitle">
            <div class="nameSection">
              <n-icon class="icon" size="20">
                <CameraSelfie />
              </n-icon>
              <h5 class="name">HUANG CHENG-TING</h5>
            </div>

            <div class="decorateLine"></div>
          </div>

          <div class="aboutSectionBody">
            <div class="selfDetailLine">生日: 1996/09/29</div>
            <div class="selfDetailLine">居住地: 新北中和</div>
            <div class="selfDetailLine">電話: 0915815933</div>
            <div class="selfDetailLine">E-mail: u0416033@gmail.com</div>
          </div>
        </div>

        <div class="aboutSection_towRow">
          <div class="aboutSectionTitle">
            <div class="nameSection">
              <n-icon class="icon" size="20">
                <Education />
              </n-icon>
              <h5 class="name">EDUCATION</h5>
            </div>

            <div class="decorateLine"></div>
          </div>

          <div class="aboutSectionBody">
            <div class="selfDetailLine">國立聯合大學建築系學士</div>
            <div class="selfDetailLine">台灣科技大學建築系碩士</div>
            <div class="selfDetailLine">106-1&2 穎川設計優良獎</div>
            <div class="selfDetailLine">104 級聯合大學畢業設計第一</div>
          </div>
        </div>
      </div>

      <div class="aboutSection">
        <div class="aboutSectionTitle">
          <div class="nameSection">
            <n-icon class="icon" size="20">
              <CameraSelfie />
            </n-icon>
            <h5 class="name">AUTOBIOGRAPHY</h5>
          </div>

          <div class="decorateLine"></div>
        </div>
        <div class="aboutSectionBody">
          目前擔任開發工程師一職於天茶智能公司，專注於多元的項目，包括網頁3D模型互動功能開發、前端網頁設計、後端API開發、資料庫管理，以及IoT設備的整合。在這份工作中，我主要運用C#、TypeScript、Vue.js和MS
          SQL等技術進行開發。過去一年，我不僅成功滿足了主管和客戶對於BIM平台的規劃與3D圖台新功能的需求，還參與了公司新產品平台的UI設計和全端開發工作。
          我的學術背景源自於國立台灣科技大學建築系研究所，期間我有幸於施宣光教授的研究室擔任研究生，專注於以ISO19650的CDE為研究主題的學術探索。此外，我還曾經擔任104級聯合大學建築畢業展覽的總召，展現了我在組織和領導方面的能力。
          自大學時代起，我就對數位工具充滿熱情，積極參與多個工作營和課程以提升我的數位技能，包括熟悉Revit/Dynamo和Rhino/Grasshopper等工具。為了在實務中更有效地應用這些技術，我在課餘時間於營造廠實習，加深了我對BIM知識的應用和軟體技能的掌握，並在104級畢業設計中榮獲第一名的佳績。研究所階段，我進一步拓展了我的技術視野，選修了多門與程式設計相關的課程，學習C#、網頁開發、Python及資料庫管理，並掌握了利用C#
          RevitAPI和Rhino API開發客製化外掛程式的技能。
          在個性方面，我是一位積極樂觀的人，面對任何挑戰和困難都能保持正面的態度。我養成了良好的自律習慣，這不僅幫助我有效管理時間，還使我能夠不斷追求自我提升和學習新技能。我熱愛挑戰自我，無論是在專業技術上的突破還是在解決複雜問題上的創新思考，我都勇於嘗試，不畏懼失敗。
        </div>
      </div>

      <!-- 工作經歷 -->
      <div class="aboutSection">
        <div class="aboutSectionTitle">
          <div class="nameSection">
            <n-icon class="icon" size="20">
              <CameraSelfie />
            </n-icon>
            <h5 class="name">EXPERIENCE</h5>
          </div>

          <div class="decorateLine"></div>
        </div>
        <div class="aboutSectionBody">
          <div class="timeLineWrap">
            <n-timeline size="large" class="timeLine">
              <n-timeline-item
                v-for="(item, index) in timelineItems"
                :key="index"
                :type="item.type"
                :content="item.content"
                :time="item.time"
                :title="item.title"
              />
            </n-timeline>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style></style>
