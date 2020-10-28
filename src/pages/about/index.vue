<template>
    <text>Hello Vue 3!</text>
    <button @click="inc">Clicked {{ count }} times.</button>
</template>

<script>
    import { ref } from 'vue'

    export default {
        setup() {
            const count = ref(0)
            const inc = () => {
                count.value++
            }

            return {
                count,
                inc
            }
        }
    }
</script>
