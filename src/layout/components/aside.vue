<template>
  <div class="brand" :class="{ collapsed: isCollapse }">
    <svg class="mark" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nsg" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#F6A828"></stop>
          <stop offset="1" stop-color="#E9890F"></stop>
        </linearGradient>
      </defs>
      <circle cx="128" cy="128" r="128" fill="url(#nsg)"></circle>
      <g fill="#fff">
        <polygon points="74,70 104,70 104,186 90,186 74,160"></polygon>
        <polygon points="74,70 104,70 182,186 152,186"></polygon>
        <rect x="152" y="70" width="30" height="116"></rect>
      </g>
    </svg>
    <span class="word"><span class="next">Next</span><span class="session">Session</span></span>
  </div>
  <el-scrollbar class="scroll-sidebar">
    <menus></menus>
  </el-scrollbar>
</template>
<script>
  import Menus from '@/layout/components/menu/index.vue'
  import { defineComponent, computed } from 'vue'
  import { useAppStore } from '@/store/app'

  export default defineComponent({
    name: 'GAside',
    components: { Menus },
    setup () {
      const appStore = useAppStore()
      const isCollapse = computed(() => appStore.setting.sideIsCollapse)
      return { isCollapse }
    },
  })
</script>

<style scoped lang="scss">
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 56px;
  padding: 0 18px;
  background: var(--ns-card, #ffffff);
  border-bottom: 1px solid var(--ns-border, rgba(17, 24, 39, 0.07));
  overflow: hidden;

  &.collapsed {
    padding: 0;
    justify-content: center;

    .word {
      display: none;
    }
  }

  .mark {
    width: 26px;
    height: 26px;
    flex: 0 0 auto;
    border-radius: 7px;
    display: block;
    box-shadow: 0 1px 2px rgba(233, 137, 15, 0.35);
  }

  .word {
    font-weight: 700;
    letter-spacing: 0.01em;
    font-size: 15px;
    white-space: nowrap;

    .next {
      color: var(--ns-orange, #f49e1b);
    }

    .session {
      color: var(--ns-muted, #646e78);
      font-style: italic;
      font-weight: 600;
    }
  }
}

.scroll-sidebar {
  height: calc(100vh - 56px);
  background-color: var(--ns-card, #ffffff);
}
</style>
