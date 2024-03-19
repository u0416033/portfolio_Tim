import { ref, computed } from "vue";
import { defineStore } from "pinia";

export const usePageSateStore = defineStore("PageSateStore", () => {
  const changePosture = ref(false);
  return { changePosture };
});
