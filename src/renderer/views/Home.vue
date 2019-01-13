<template>
  <van-nav-bar title="FRP UI" @click-right="setting">
    <van-icon name="setting" slot="right"/>
  </van-nav-bar>
  <!-- <van-switch v-model="checked"/> -->
</template>

<script>
export default {
  data() {
    return {
      checked: false
    };
  }
};
</script>

