<template>
  <div class="universeContainerContent_header">
    <n-button type="tertiary" @click="$emit('continueAnimate')">Back To Universe</n-button>
  </div>
  <div class="universeContainerContent_body">{{ planteContent }}</div>
  <div class="universeContainerContent_footer">
    <n-button type="info" class="nextBtn" @click="$emit('toCateGoryPage')">More Detail </n-button>
  </div>
</template>

<script setup>
defineProps({
  planteContent: String,
});
const emits = defineEmits(["continueAnimate", "toCateGoryPage"]);
</script>
