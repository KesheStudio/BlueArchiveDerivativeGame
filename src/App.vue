<script setup lang="ts">
import { RouterView } from "vue-router";
</script>
<template>
  <main class="TopBox">
    <RouterView />
  </main>
</template>
<style>
.box{
  width: 100%;
  height: 100%;
}
</style>
<style lang="scss" scoped>
.TopBox{
  width: 100%;
  height: 100%;
  >*{
    width: 100%;
    height: 100%;
  }
}
</style>