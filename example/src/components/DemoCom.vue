<template>
  <div class="demo-com">
    <button @click="demoBtnClick">DemoCom</button>
    <slot :xxx="name"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent(
    {
      name: 'DemoCom',
      props: {
        name: {
          type: String
        }
      },
      setup(props, { emit }) {
        const demoBtnClick = () => {
          emit('demo-click', props.name)
        }
        return {
          demoBtnClick
        }
      }
    }
)
</script>

<style scoped>
.demo-com {
  background: aqua;
}
</style>
