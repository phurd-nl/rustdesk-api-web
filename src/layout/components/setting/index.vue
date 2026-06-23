<template>
  <div class="setting">
    <button
        class="theme-btn"
        type="button"
        @click="isDark = !isDark"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      <el-icon :size="17">
        <Sunny v-if="isDark"/>
        <Moon v-else/>
      </el-icon>
    </button>
    <el-dropdown class="menu-item">
      <div class="user-chip">
        <span class="av">{{ (user.username || '?').slice(0, 1).toUpperCase() }}</span>
        <span class="nickname">{{ user.username }}</span>
        <el-icon class="caret">
          <el-icon-arrow-down/>
        </el-icon>
      </div>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item @click="showChangePwd">{{ T('ChangePassword') }}</el-dropdown-item>
          <el-dropdown-item @click="logout">{{ T('Logout') }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <changePwdDialog v-model:visible="changePwdVisible"></changePwdDialog>
  </div>
</template>

<script setup>
  import { useUserStore } from '@/store/user'
  import changePwdDialog from '@/components/changePwdDialog.vue'
  import { ref } from 'vue'
  import { T } from '@/utils/i18n'
  import { useDark } from '@vueuse/core'
  import { Sunny, Moon } from '@element-plus/icons'

  const userStore = useUserStore()
  const user = userStore

  const logout = () => {
    userStore.logout()
    window.location.reload()
  }

  const changePwdVisible = ref(false)
  const showChangePwd = () => {
    changePwdVisible.value = true
  }
  const isDark = useDark()
  // const toggleDark = useToggle(isDark)
</script>

<style lang="scss" scoped>
.setting {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;

  .menu-item {
    * {
      outline: none;
    }
  }

  // theme toggle as a clean icon button (not a switch)
  .theme-btn {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    cursor: pointer;
    border: 1px solid var(--ns-border, rgba(17, 24, 39, 0.07));
    background: var(--ns-card, #ffffff);
    color: var(--ns-muted-fg, #646e78);
    transition: background .15s, color .15s, border-color .15s;

    &:hover {
      background: var(--ns-accent, #e6f0ff);
      color: var(--ns-primary, #0559c9);
      border-color: var(--ns-primary, #0559c9);
    }
  }

  // user chip: avatar circle + username + caret in a pill
  .user-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 10px 5px 6px;
    border-radius: 999px;
    cursor: pointer;
    border: 1px solid var(--ns-border, rgba(17, 24, 39, 0.07));
    background: var(--ns-card, #ffffff);
    color: var(--ns-fg, #1b1f24);

    &:hover {
      background: var(--ns-accent-wash, #e6f0ff);
      border-color: var(--ns-border-strong, rgba(17, 24, 39, 0.12));
    }

    .av {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--ns-primary, #0559c9);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 12px;
      font-weight: 600;
    }

    .nickname {
      font-weight: 600;
      font-size: 13px;
    }

    .caret {
      color: var(--ns-muted, #646e78);
      font-size: 12px;
    }
  }
}
</style>
