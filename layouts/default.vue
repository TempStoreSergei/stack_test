<template>
  <Layout class="layout">
    <LayoutContent style="padding: 50px 50px 0 50px; height: 100vh">
      <div :style="{ minHeight: '280px' }">
        <slot/>
      </div>
    </LayoutContent>
    <LayoutFooter style="text-align: center">
      Тестовое задание
    </LayoutFooter>
  </Layout>
</template>
<script lang="ts" setup>
import { Layout, LayoutContent, LayoutFooter } from 'ant-design-vue';
</script>

<style scoped>
.layout {
  height: 100vh;
}

</style>