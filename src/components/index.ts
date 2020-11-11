import { h, defineComponent, computed } from "vue"
import { View } from "@tarojs/components"
import "./index.scss"

const Panel = defineComponent({
  props: {
    title: {
      type: String,
      default: '',
      required: true
    },
    noPadding: Boolean
  },

  setup(props, { slots, attrs }) {
    const contentClass = computed(() => ({
      'panel__content': true,
      'no-padding': props.noPadding
    }))

    return () => h(View, { class: 'panel' }, {
      default: () => [
        props.title && h(View, { class: 'panel__title' }, props.title),
        slots.controller && slots.controller(),
        h(View, {
          class: contentClass.value,
          style: attrs.style
        }, slots.default && slots.default())
      ]
    })
  }
})

export {
  Panel,
}
