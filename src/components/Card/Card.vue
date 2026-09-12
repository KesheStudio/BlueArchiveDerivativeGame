<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const baseurl = ref<string>("");

interface Props{
    baseurl:string
}

const props = withDefaults(defineProps<Props>(),{
    baseurl:""
})

onMounted(()=>{
    baseurl.value = props.baseurl;
})

</script>
<template>
    <div class="box">
        <img class="CardSurface" :src="baseurl">
    </div>
</template>
<style lang="scss" scoped>
.box{
    display: flex;
    justify-content: center;
    align-items: center;
}
.CardSurface{
    height: calc(100vh / 4);
}
</style>