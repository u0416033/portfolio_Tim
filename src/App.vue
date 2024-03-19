<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink, RouterView, useRouter } from "vue-router";
const router = useRouter();

onMounted(() => {
  // router.push("/home");
});
</script>

<template>
  <router-view></router-view>
</template>

<style scoped></style>
