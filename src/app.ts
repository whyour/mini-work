import { createApp } from "vue";
import {
  AtCalendar,
  AtActivityIndicator,
  AtButton,
  AtTimeline,
  AtModal,
  AtModalContent,
  AtModalAction,
  AtInput,
  AtList,
  AtListItem,
  AtMessage,
  AtCheckbox,
  AtAvatar,
  AtSwitch,
} from "taro-ui-vue3";
import Taro from "@tarojs/taro";
import "./app.scss";

const App = createApp({
  mounted() {
    Taro.cloud.init();
    Taro.cloud
      .callFunction({
        name: "login",
        data: {},
      })
      .then((res) => {
        if (res.result && res.result.openid) {
          Taro.setStorage({ key: "openId", data: res.result.openid });
        }
      });
  },
  onShow() {
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(() => {
          Taro.showModal({
            title: "更新提示",
            content: "检测到新版本, 是否下载新版本并重启小程序?",
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate();
              }
            },
          });
        });
        updateManager.onUpdateFailed(() => {
          Taro.showModal({
            title: "已经有新版本了哟~",
            content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~",
          });
        });
      }
    });
  },
});

App.component("AtCalendar", AtCalendar);
App.component("AtActivityIndicator", AtActivityIndicator);
App.component("AtButton", AtButton);
App.component("AtTimeline", AtTimeline);
App.component("AtModal", AtModal);
App.component("AtModalContent", AtModalContent);
App.component("AtModalAction", AtModalAction);
App.component("AtInput", AtInput);
App.component('AtList', AtList);
App.component('AtListItem', AtListItem);
App.component("AtMessage", AtMessage);
App.component("AtCheckbox", AtCheckbox);
App.component("AtAvatar", AtAvatar);
App.component("AtSwitch", AtSwitch);

export default App;
