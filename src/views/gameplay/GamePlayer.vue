<script lang="ts" setup>
import { routes } from '@router/index.ts';
import { RouterLink } from 'vue-router';

console.table(routes[3]?.children);

</script>
<template>
    <div class="box">
        <RouterLink to="/gameplayer/blueArchiveKill">BuleArchiveKill</RouterLink>
    </div>
</template>
<style lang="scss" scoped>
.box{
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>