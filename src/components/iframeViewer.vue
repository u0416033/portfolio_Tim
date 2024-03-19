<template>
  <div class="PPT_container">
    <div class="PPTwrapper">
      <iframe
        :src="src"
        style="width: 100%; max-width: 100%; height: 100%"
        allow="fullscreen"
        :title="title"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
defineProps({
  src: String,
  title: String,
});
</script>
