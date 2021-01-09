<template>
  <div>
    dashboard - {{$route.query.title}}
    <div v-point="'add'">v-point测试add</div>
    <div v-point="'delete'">v-point测试xx</div>
  </div>
</template>

<script>
export default {
  name: 'index'
}
</script>

<style scoped>

</style>
