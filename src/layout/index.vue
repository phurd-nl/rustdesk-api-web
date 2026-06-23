<template>
  <el-config-provider :locale="appStore.setting.locale.value">
    <el-container :style="{'--sideBarWidth': sideBarWidth}">
      <el-aside :width="leftWidth" class="app-left">
        <g-aside></g-aside>
      </el-aside>
      <el-container class="app-container ">
        <el-header class="app-header">
          <g-header></g-header>
        </el-header>
        <div class="header-tags">
          <tags></tags>
        </div>

        <el-main class="app-main">
          <router-view v-slot="{ Component }">
            <transition mode="out-in" name="el-fade-in-linear">
              <keep-alive :include="cachedTags">
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup>
  import { useAppStore } from '@/store/app'
  import { useTagsStore } from '@/store/tags'
  import { ref, computed } from 'vue'
  import Tags from '@/layout/components/tags/index.vue'
  import GAside from '@/layout/components/aside.vue'
  import GHeader from '@/layout/components/header.vue'

  const appStore = useAppStore()
  const tagStore = useTagsStore()
  const sideBarWidth = computed(() => appStore.setting.locale.sideBarWidth)
  const leftWidth = computed(() => appStore.setting.sideIsCollapse ? '64px' : 'var(--sideBarWidth)')

  const cachedTags = ref([])

  cachedTags.value = tagStore.cached
</script>

<style lang="scss" scoped>
.app-header {
  background-color: var(--ns-card, #ffffff);
  color: var(--ns-fg, #1b1f24);
  border-bottom: 1px solid var(--ns-border, rgba(17, 24, 39, 0.07));
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
}

.header-tags {
  height: auto;
  border-bottom: 1px solid var(--ns-border, rgba(17, 24, 39, 0.07));
  background: var(--ns-bg, #f6f8fa);
  display: flex;
  padding: 6px 16px 0;
  gap: 6px;
}

.app-left {
  transition: width 0.5s;
  border-right: 1px solid var(--ns-border, rgba(17, 24, 39, 0.07));
}

.app-container {
  min-height: 100vh;
}
</style>


