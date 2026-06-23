<template>
  <el-icon class="ex-icon" @click="expandOrFoldSlider">
    <el-icon-expand v-if="setting.sideIsCollapse"></el-icon-expand>
    <el-icon-fold v-else></el-icon-fold>
  </el-icon>
  <div class="ctx">{{ setting.title }}</div>
  <Setting></Setting>
</template>

<script>
  import { defineComponent, computed } from 'vue'
  import HeaderMenu from '@/layout/components/menu/index.vue'
  import Setting from '@/layout/components/setting/index.vue'
  import { useAppStore } from '@/store/app'
  import GTags from '@/layout/components/tags/index.vue'

  export default defineComponent({
    name: 'LayerHeader',
    created () {
    },
    components: { HeaderMenu, Setting, GTags },
    watch: {},
    setup (props) {
      const appStore = useAppStore()
      const setting = computed(() => appStore.setting)
      const expandOrFoldSlider = () => {
        appStore.sideCollapse()
      }
      return {
        setting,
        expandOrFoldSlider,
      }
    },

  })
</script>

<style scoped lang="scss">
  // visible icon button (was color:var(--ns-muted) = a near-white surface tint, so it
  // rendered nearly invisible on the header — use --ns-muted-fg and give it button chrome)
  .ex-icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    margin-right: 14px;
    font-size: 18px;
    border-radius: 9px;
    color: var(--ns-muted-fg, #646e78);
    border: 1px solid var(--ns-border, rgba(17, 24, 39, 0.07));
    background: var(--ns-card, #ffffff);
    cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;

    &:hover {
      background: var(--ns-accent, #e6f0ff);
      color: var(--ns-primary, #0559c9);
      border-color: var(--ns-primary, #0559c9);
    }
  }

  .ctx {
    display: flex;
    align-items: center;
    height: 100%;
    font-weight: 600;
    font-size: 14px;
    color: var(--ns-fg, #1b1f24);
  }


</style>
<style lang="scss">

</style>
