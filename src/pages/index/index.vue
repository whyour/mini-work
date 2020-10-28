<template>
  <view class="home">
    <at-activity-indicator
      v-if="loading"
      :size="64"
      mode="center"
    ></at-activity-indicator>
    <view v-if="!loading">
      <at-message />
      <at-calendar
        :currentDate="currentDate"
        @monthChange="monthChange"
        @dayClick="onDayClick"
        :marks="marks"
      />
      <view class="part-loading" v-if="partLoading">
        <at-activity-indicator></at-activity-indicator>
      </view>
      <view v-if="!partLoading" class="timeline-work-wrap" :class="{'delete-work-wrap': deleteWorkState}">
        <view v-if="deleteWorkState">
          <at-checkbox
          :options="workList"
          :selectedList="checkedList"
          @change="checkListChange"
        />
        <at-button
          type="primary"
          @click="deleteWorks"
          style="margin: 8px 0"
          :loading="submitting"
          :disabled="submitting"
        >
          确认
        </at-button>
        <at-button type="secondary" @click="cancelDeleteWorkState">
          取消
        </at-button>
        </view>
        <view v-if="!deleteWorkState">
          <at-timeline class="timeline" :items="list"></at-timeline>
        <at-timeline class="month-line" :items="month"></at-timeline>
        <view class="at-row at-row__justify--around">
          <view class="at-col">
            <at-button
              class="add-work"
              @click="addWork"
              type="secondary"
              :plain="true"
            >
              添加工时
            </at-button>
          </view>
          <view class="at-col" v-if="list.length > 1">
            <at-button
              class="add-work danger"
              @click="deleteWork"
              :plain="true"
            >
              删除工时
            </at-button>
          </view>
        </view>
        </view>
      </view>
      <AtModal class="add-work-modal" :isOpened="addWorkModelShow">
        <AtModalContent>
          <picker mode="selector" :range="pickers" @change="pickerChange" :class="{'picker-classify':work.classify === '请选择分类'}">
            <AtList>
              <AtListItem
                title="分类"
                :extraText="work.classify"
              />
            </AtList>
          </picker>
          <view v-if="!addWorkModelHide">
            <AtInput
              name="number"
              title="个数"
              type="number"
              placeholder="总共个数"
              :value="work.number"
              @change="numberChange"
              :border="false"
            />
            <AtInput
              name="people"
              title="人数"
              type="number"
              placeholder="总共人数"
              :value="work.people"
              @change="peopleChange"
              :border="false"
            />
            <AtInput
              name="address"
              title="地址"
              type="text"
              placeholder="地址"
              :value="work.address"
              @change="addressChange"
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
  </view>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import * as dayjs from "dayjs";
import Taro from "@tarojs/taro";
import "./index.scss";

export default {
  setup() {
    const pickers = ["110门", "220门", "350门"];
    let currentDate = ref(dayjs().valueOf());
    let openId = ref("");
    let marks = ref([]);
    let list = ref([]);
    let month = ref([]);
    let checkedList = ref([]);
    let loading = ref(true);
    let partLoading = ref(true);
    let deleteWorkState = ref(false);
    let addWorkModelShow = ref(false);
    let submitting = ref(false);
    let addWorkModelHide = ref(true);
    let work = reactive({
      classify: "请选择分类",
      number: "",
      address: "",
      people: "",
    });
    const workList = computed({
      get() {
        return list.value.slice(0, -1).map((x) => {
          return { value: x, label: x.title };
        });
      },
    });

    onMounted(() => {
      loading.value = true;
      Taro.getStorage({ key: "openId" })
        .then((res) => {
          let _openId = res.data;
          getWorks({ date: currentDate.value, openId: _openId });
          getMonthWorks({ date: currentDate.value, openId: _openId });
          loading.value = false;
          openId = _openId;
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
                getWorks({ date: currentDate.value, openId: _openId });
                getMonthWorks({ date: currentDate.value, openId: _openId });
                loading.value = false;
                openId = _openId;
              }
            });
        });
    });

    const onDayClick = (item) => {
      const number = dayjs(item.value).valueOf();
      currentDate.value = number;
      getWorks({ date: number, openId });
    };

    const getWorks = ({ date, openId }) => {
      // TODO: PartLoading 影响切换月份
      // partLoading.value = true;
      Taro.cloud
        .callFunction({
          name: "getWork",
          data: {
            date,
            openId,
          },
        })
        .then((res) => {
          if (res.result && res.result.data) {
            const _result = res.result.data || [];
            const result = _result.map((x) => {
              return {
                title: `${x.address}, ${x.people}人，${x.price}门，${x.number}件`,
                icon: "check-circle",
                _id: x._id,
              };
            });
            const numbers = [...res.result.data].reduce(
              (acc, cur) => acc + parseInt(cur.number),
              0
            );
            const prices = [...res.result.data].reduce((acc, cur) => {
              const price =
                (parseInt(cur.price) * parseInt(cur.number)) /
                parseInt(cur.people);
              return acc + price;
            }, 0);
            result.push({
              title: `${new Date(currentDate.value).getDate()}日总计${numbers}件，${prices}元`,
              icon: "check-circle",
            });
            list.value = result;
            partLoading.value = false;
          }
        });
    };

    const getMonthWorks = ({ date, openId }) => {
      const min = dayjs(date).startOf("month").valueOf();
      const max = dayjs(date).endOf("month").valueOf();
      Taro.cloud
        .callFunction({
          name: "getWorks",
          data: {
            min,
            max,
            openId,
          },
        })
        .then((res) => {
          const numbers = [...res.result.data].reduce(
            (acc, cur) => acc + parseInt(cur.number),
            0
          );
          const prices = [...res.result.data].reduce((acc, cur) => {
            const price =
              (parseInt(cur.price) * parseInt(cur.number)) /
              parseInt(cur.people);
            return acc + price;
          }, 0);
          const _marks = [
            ...new Set([...res.result.data].map((x) => x.date)),
          ].map((x) => {
            return { value: x };
          });
          month.value = [
            { title: `本月总计${numbers}件，${prices}元`, icon: "sketch" },
          ];
          marks.value = _marks;
          partLoading.value = false;
        });
    };

    const monthChange = (value) => {
      const nextMonth = dayjs(value)
      const _currentDate = dayjs(currentDate.value)
      const goingDate = dayjs().year(nextMonth.year()).month(nextMonth.month()).date(_currentDate.date())
      const actualDateNumber = goingDate.isAfter(nextMonth.endOf('month')) ? nextMonth.endOf('month').valueOf() : goingDate.valueOf()
      currentDate.value = actualDateNumber;
      getWorks({ date: actualDateNumber, openId });
      getMonthWorks({ date: actualDateNumber, openId });
    };

    const addWork = () => {
      addWorkModelShow.value = true;
      addWorkModelHide.value = false;
      work.classify = "请选择分类";
      work.number = "";
      work.address = "";
      work.people = "";
    };

    const pickerChange = (e) => {
      work.classify = pickers[e.detail.value];
    };

    const submit = () => {
      if (
        !work.classify ||
        work.classify === "请选择分类" ||
        !work.people ||
        !work.number ||
        !work.address ||
        Number.isNaN(parseInt(work.people)) ||
        Number.isNaN(parseInt(work.number))
      ) {
        Taro.atMessage({ message: "输入参数有误", type: "error" });
        return;
      }
      submitting.value = true;
      Taro.cloud
        .callFunction({
          name: "addWork",
          data: {
            date: currentDate.value,
            number: work.number,
            price: work.classify,
            openId,
            address: work.address,
            people: work.people,
          },
        })
        .then((res) => {
          if (res.result) {
            this.close();
            this.getWorks({
              date: currentDate.value,
              openId,
            });
            this.getMonthWorks({
              date: currentDate.value,
              openId,
            });
            submitting.value = false;
          }
        });
    };

    const close = () => {
      addWorkModelShow.value = false;
    };

    const numberChange = (value) => {
      work.number = value;
    };

    const peopleChange = (value) => {
      work.people = value;
    };

    const addressChange = (value) => {
      work.address = value;
    };

    const checkListChange = (value) => {
      checkedList.value = value;
    };

    const cancelDeleteWorkState = () => {
      checkedList.value = [];
      deleteWorkState.value = false;
    };

    const deleteWork = () => {
      deleteWorkState.value = true;
    };

    const deleteWorks = () => {
      if (!checkedList.value || checkedList.value.length === 0) {
        Taro.atMessage({ message: "输入参数有误", type: "error" });
        return;
      }
      submitting.value = true;
      const dateIds = checkedList.value.map((x) => x._id);
      Taro.cloud
        .callFunction({
          name: "deleteWorks",
          data: {
            ids: dateIds,
            openId,
          },
        })
        .then((res) => {
          if (res.result) {
            checkedList.value = [];
            deleteWorkState.value = false;
            submitting.value = false;
            monthChange(currentDate.value);
          }
        });
    };

    return {
      pickers,
      currentDate,
      openId,
      marks,
      list,
      workList,
      month,
      checkedList,
      loading,
      partLoading,
      deleteWorkState,
      addWorkModelShow,
      submitting,
      addWorkModelHide,
      work,
      monthChange,
      onDayClick,
      getWorks,
      getMonthWorks,
      addWork,
      pickerChange,
      submit,
      close,
      numberChange,
      peopleChange,
      addressChange,
      deleteWorks,
      checkListChange,
      cancelDeleteWorkState,
      deleteWork,
    };
  },

  onShow() {
    this.addWorkModelHide = true
  }
};
</script>
