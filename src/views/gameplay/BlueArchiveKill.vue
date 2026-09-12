<script lang="ts" setup>
import { ref } from 'vue';
import { bases } from './base';
import Card from '@components/Card/Card.vue';

const cost = ref<number>(0);
const levelP = ref<number>(0);
const currency = ref<number>(0);

const storeCard = ref<object[]>()

</script>
<template>
    <div class="Box">
        <img class="Back" src="./bg_cs_pv2_34.jpg">
        <div class="Bar">
            <div class="Resources">
                <span class="Cost">{{ cost }}</span>
                <span class="LevelP">{{ levelP }}</span>
            </div>
            <div class="Candidate"></div>
            <div class="Open">
                <span class="Currency">{{ currency }}</span>
            </div>
        </div>

        <div class="Store">
            
        </div>

        <div class="CardContainer">
            <div class="Enemy">
                <Card :baseurl="bases" />
                <Card :baseurl="bases" />
                <Card :baseurl="bases" />
                <Card :baseurl="bases" />
            </div>
            <div class="FrontRow">
                <Card :baseurl="bases" />
                <Card :baseurl="bases" />
                <Card :baseurl="bases" />
                <Card :baseurl="bases" />
            </div>
            <div class="BackSeat">
                <Card :baseurl="bases" />
                <Card :baseurl="bases" />
            </div>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.Box {
    display: flex;
    justify-content: center;
    align-items: center;
}

.Back{
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    display: block;
    z-index: -1;
}

.Bar {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 20vh;
    background-color: antiquewhite;
    z-index: 100;
}

.Store{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #0000005f;
    z-index: 201;
}

.CardContainer {
    width: 60%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1vh;
    z-index: 10;
}

.Enemy {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: space-around;
    transform: rotate(180deg);
}

.FrontRow {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: space-around;
}

.BackSeat {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: space-around;
}
</style>