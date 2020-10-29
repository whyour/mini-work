<template>
  <view class="about">
    <at-activity-indicator
      v-if="loading"
      :size="64"
      mode="center"
    ></at-activity-indicator>
    <view class="about" v-if="!loading">
      <view class="me list-item" v-if="user">
        <at-avatar circle :image="user.avatarUrl"></at-avatar>
        <view class="nick-name">{{ user.nickName }}</view>
        <at-button type="secondary" @click="logout" class="logout" size="small">
          退出登录
        </at-button>
      </view>
      <view class="list-item" v-if="!user">
        <at-button
          type="primary"
          open-type="getUserInfo"
          @getUserInfo="onGotUserInfo"
        >
          微信登录
        </at-button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from "vue";
import Taro, { Config } from "@tarojs/taro";
import "./index.scss";

export default {
  setup() {
    const user = ref();
    const loading = ref(true);

    onMounted(() => {
      getStorageUser();
    });

    const getStorageUser = () => {
      loading.value = true;
      Taro.getStorage({ key: "user" })
        .then((res) => {
          user.value = res.data;
          loading.value = false;
        })
        .catch(() => {
          user.value = null;
          loading.value = false;
        });
    };

    const logout = () => {
      Taro.clearStorage();
      getStorageUser();
    };

    const onGotUserInfo = (res) => {
      if (res.detail.userInfo) {
        Taro.setStorage({ key: "user", data: res.detail.userInfo });
        getStorageUser();
      }
    };

    return {
      user,
      loading,
      logout,
      onGotUserInfo,
    };
  },
};
</script>
