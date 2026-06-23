<template>
  <div class="setting">
    <div class="menu-item">
      <el-switch
          v-model="isDark"
          style="--el-switch-on-color:#18222c"
      >
        <template #active-action>
          <el-icon>
            <Moon/>
          </el-icon>
        </template>
        <template #inactive-action>
          <el-icon>
            <Sunny color="#000"/>
          </el-icon>
        </template>
      </el-switch>
    </div>
    <el-dropdown class="menu-item">
      <div class="title">
        <i class="el-icon el-tooltip__trigger" style="font-size: 22px;">
          <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18"></path>
            <path d="M12 3c2.6 2.7 2.6 15.3 0 18c-2.6-2.7-2.6-15.3 0-18z"></path>
          </svg>
        </i>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="(v, k) in appStore.setting.langs" @click="changeLang(k)" :key="k">{{ v.name }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
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
  import { useAppStore } from '@/store/app'
  import changePwdDialog from '@/components/changePwdDialog.vue'
  import { ref } from 'vue'
  import { T } from '@/utils/i18n'
  import { useDark } from '@vueuse/core'
  import { Sunny, Moon } from '@element-plus/icons'

  const userStore = useUserStore()
  const user = userStore
  const appStore = useAppStore()

  const logout = () => {
    userStore.logout()
    window.location.reload()
  }

  const changePwdVisible = ref(false)
  const showChangePwd = () => {
    changePwdVisible.value = true
  }
  const changeLang = (v) => {
    appStore.changeLang(v)
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

  .title {
    color: var(--ns-muted, #646e78);
    display: flex;
    align-items: center;

    &:hover {
      color: var(--ns-primary, #0559c9);
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
