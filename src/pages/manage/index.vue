<template>
  <view class="manage">
    <at-activity-indicator
      v-if="loading"
      :size="64"
      mode="center"
    ></at-activity-indicator>
    <panel no-padding title="工时类型" v-if="!loading">
      <at-message />
      <view v-if="!deleteTypeState">
        <view class="part-loading" v-if="partLoading">
          <at-activity-indicator></at-activity-indicator>
        </view>
        <view v-if="!partLoading">
        <at-list :has-border="false">
          <at-list-item
            v-for="(_type, index) in types"
            :key="_type._id"
            :title="_type.name"
            :has-border="types.length - 1 !== index"
            @click="updateType(_type)"
            arrow="right"
          />
        </at-list>
        <view class="at-row at-row__justify--around">
          <view class="at-col">
            <at-button
              class="add-work"
              @click="addType"
              type="secondary"
              :plain="true"
            >
              添加类型
            </at-button>
          </view>
          <view class="at-col" v-if="types.length > 0">
            <at-button
              class="add-work danger"
              @click="deleteType"
              :plain="true"
            >
              删除类型
            </at-button>
          </view>
        </view>
        </view>
      </view>
      <view v-if="deleteTypeState">
        <at-checkbox
          :options="typeList"
          :selectedList="checkedList"
          @change="checkListChange"
        />
        <at-button
          type="primary"
          @click="deleteTypes"
          style="margin: 8px 0"
          :loading="submitting"
          :disabled="submitting"
        >
          确认
        </at-button>
        <at-button type="secondary" @click="cancelDeleteTypeState">
          取消
        </at-button>
      </view>
    </panel>
    <AtModal
      class="add-work-modal"
      :isOpened="addTypeModelShow"
    >
      <AtModalContent>
        <view v-if="!addTypeModelHide">
          <AtInput
            name="number"
            title="名称"
            type="number"
            placeholder="名称"
            :value="type.name"
            @change="nameChange"
            :border="false"
          />
          <AtInput
            name="address"
            title="价格"
            type="text"
            placeholder="价格"
            :value="type.price"
            @change="priceChange"
            :border="false"
          />
        </view>
      </AtModalContent>
      <AtModalAction>
        <view class="at-row modal-action">
          <view class="at-col">
            <AtButton @click="close">取消</AtButton>
          </view>
          <view class="at-col">
            <AtButton
              full
              :loading="submitting"
              :disabled="submitting"
              @click="submit"
            >
              确定
            </AtButton>
          </view>
        </view>
      </AtModalAction>
    </AtModal>
  </view>
</template>

<script>
import { ref, onMounted, reactive, computed } from "vue";
import Taro, { Config } from "@tarojs/taro";
import { Panel } from "../../components/index";

export default {
  components: {
    Panel,
  },

  setup() {
    const types = ref([]);
    const loading = ref(true);
    let addTypeModelShow = ref(false);
    let submitting = ref(false);
    let addTypeModelHide = ref(true);
    let deleteTypeState = ref(false);
    let openId = ref("");
    let checkedList = ref([]);
    let partLoading = ref(true);
    let type = reactive({
      price: "",
      name: "",
    });
    const typeList = computed({
      get() {
        return types.value.map((x) => {
          console.log(x);
          return { value: x, label: x.name };
        });
      },
    });

    onMounted(() => {
      loading.value = true;
      Taro.getStorage({ key: "openId" })
        .then((res) => {
          let _openId = res.data;
          getTypes(_openId);
          openId = _openId;
          loading.value = false
        })
        .catch(() => {
          Taro.cloud
            .callFunction({
              name: "login",
              data: {},
            })
            .then((res) => {
              if (res.result && res.result.openid) {
                let _openId = res.result.openid;
                Taro.setStorage({ key: "openId", data: _openId });
                getTypes(_openId);
                openId = _openId;
                loading.value = false
              }
            });
        })
    });

    const getTypes = (openId) => {
      partLoading.value = true;
      Taro.cloud
        .callFunction({
          name: "getTypes",
          data: {
            openId,
          },
        })
        .then((res) => {
          if (res.result && res.result.data && res.result.data.length > 0) {
            types.value = res.result.data;
          }
          partLoading.value = false
        });
    };

    const _requestCloudMsgCheck = (text) => {
      return new Promise((resolve)=>{
        Taro.cloud.callFunction({
          name: 'checkContent',
          data: {
            content: text
          }
        }).then(res => {
          resolve(res.result.errCode === 0)
        }).catch(err => {
          resolve(false)
        })
      })
    }

    const addType = () => {
      addTypeModelShow.value = true;
      addTypeModelHide.value = false;
      type.name = "";
      type.price = "";
      type._id = "";
    };

    const submit = async () => {
      if (Number.isNaN(parseInt(type.price)) || !type.name) {
        Taro.atMessage({ message: "输入参数有误", type: "error" });
        return;
      }

      const isLegal = await _requestCloudMsgCheck(type.name);
      if(!isLegal){
        Taro.atMessage({ message: "文本涉及敏感词", type: "error" });
        return;
      }

      submitting.value = true;
      const isUpdatting = !!type._id;
      let payload = {
        name: type.name,
        openId,
        price: type.price,
      };
      if (isUpdatting) {
        payload._id = type._id;
      }
      Taro.cloud
        .callFunction({
          name: isUpdatting ? "updateType" : "addType",
          data: payload,
        })
        .then((res) => {
          if (res.result) {
            close();
            getTypes(openId);
            submitting.value = false;
          }
        });
    };

    const close = () => {
      addTypeModelShow.value = false;
    };

    const priceChange = (value) => {
      type.price = value;
    };

    const nameChange = (value) => {
      type.name = value;
    };

    const updateType = ({ _id, name, price }) => {
      addTypeModelShow.value = true;
      addTypeModelHide.value = false;
      type.name = name;
      type.price = price;
      type._id = _id;
    };

    const deleteType = () => {
      deleteTypeState.value = true;
    };

    const cancelDeleteTypeState = () => {
      checkedList.value = [];
      deleteTypeState.value = false;
    };

    const checkListChange = (value) => {
      checkedList.value = value;
    };

    const deleteTypes = () => {
      if (!checkedList.value || checkedList.value.length === 0) {
        Taro.atMessage({ message: "输入参数有误", type: "error" });
        return;
      }
      submitting.value = true;
      const typeIds = checkedList.value.map((x) => x._id);
      Taro.cloud
        .callFunction({
          name: "deleteTypes",
          data: {
            ids: typeIds,
            openId,
          },
        })
        .then((res) => {
          if (res.result) {
            checkedList.value = [];
            deleteTypeState.value = false;
            submitting.value = false;
            getTypes(openId);
          }
        });
    };

    return {
      types,
      loading,
      addTypeModelShow,
      submitting,
      addTypeModelHide,
      type,
      addType,
      submit,
      close,
      priceChange,
      nameChange,
      updateType,
      deleteTypeState,
      deleteType,
      checkedList,
      cancelDeleteTypeState,
      checkListChange,
      deleteTypes,
      typeList,
      partLoading
    };
  },

  onShow() {
    if (!this.addTypeModelShow) {
      this.addTypeModelHide = true;
    }
  },
};
</script>
