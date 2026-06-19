<template>
  <div class="login-container">
    <img src="@/assets/wordmark.png" alt="NextSession" class="login-wordmark"/>
    <div class="login-card">
      <h1 class="login-title">{{ T('Register') }}</h1>
      <el-form ref="f" :model="form" label-position="top" class="login-form" :rules="rules">
        <el-form-item :label="T('Username')" prop="username">
          <el-input v-model="form.username" class="login-input"></el-input>
        </el-form-item>

        <el-form-item :label="T('Email')" prop="email">
          <el-input v-model="form.email" class="login-input"></el-input>
        </el-form-item>

        <el-form-item :label="T('Password')" prop="password">
          <el-input v-model="form.password" type="password" show-password
                    class="login-input"></el-input>
        </el-form-item>
        <el-form-item :label="T('ConfirmPassword')" prop="confirm_password">
          <el-input v-model="form.confirm_password" type="password" @keyup.enter.native="submit" show-password
                    class="login-input"></el-input>
        </el-form-item>
        <el-form-item label="">
          <el-button @click="submit" class="login-button" type="primary">{{ T('Submit') }}</el-button>
          <el-button @click="toLogin" class="login-button">{{ T('ToLogin') }}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <p class="login-footer">NextSession Web &middot; secured by Nextlink</p>
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { T } from '@/utils/i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { register } from '@/api/user'
  import { useUserStore } from '@/store/user'
  import { useAppStore } from '@/store/app'

  const router = useRouter()
  const userStore = useUserStore()
  const form = reactive({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const rules = {
    username: [
      { required: true, message: T('ParamRequired', { param: T('Username') }), trigger: 'blur' },
    ],
    // email: [
    //   { required: true, message: T('ParamRequired', { param: T('Email') }), trigger: 'blur' },
    // ],
    password: [
      { required: true, message: T('ParamRequired', { param: T('Password') }), trigger: 'blur' },
    ],
    confirm_password: [
      { required: true, message: T('ParamRequired', { param: T('ConfirmPassword') }), trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== form.password) {
            callback(new Error(T('PasswordNotMatchConfirmPassword')))
          } else {
            callback()
          }
        }, trigger: 'blur',
      },
    ],
  }
  const f = ref(null)
  const submit = async () => {
    const v = await f.value.validate().catch(_ => false)
    if (!v) {
      return
    }
    const res = await register(form).catch(_ => false)
    if (!res) {
      return
    }
    userStore.saveUserData(res.data)
    useAppStore().loadConfig()
    ElMessage.success('Submit')
    router.push('/')
  }
  const toLogin = () => {
    router.push('/login')

  }
</script>

<style scoped lang="scss">
/* NextVault-family register: matches login.vue. */
$page: #0b1622;
$orange: #f49e1b;

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: $page;
  background-image:
    radial-gradient(900px 520px at 96% -6%, rgba(244, 158, 27, 0.10), transparent 60%),
    radial-gradient(820px 520px at -6% 108%, rgba(43, 139, 255, 0.08), transparent 58%);
  padding: 20px;
  box-sizing: border-box;
}

.login-wordmark {
  width: 300px;
  max-width: 70vw;
  height: auto;
  margin-bottom: 36px;
  display: block;
}

.login-card {
  width: 340px;
  max-width: 100%;
  background: rgba(22, 33, 46, 0.92);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 32px;
  border-radius: 14px;
  box-shadow: 0 24px 60px -18px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.login-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  color: #eef2f6;
}

.login-form {
  margin-bottom: 8px;
}

.login-input {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 44px;
  margin: 4px 0 12px;
  margin-left: 0;
  border-radius: 10px;
  font-weight: 600;
  &.el-button--primary {
    --el-button-bg-color: #{$orange};
    --el-button-border-color: #{$orange};
    --el-button-hover-bg-color: #f7ad3e;
    --el-button-hover-border-color: #f7ad3e;
    --el-button-active-bg-color: #e08e10;
    color: #1b1206;
  }
  &:not(.el-button--primary) {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cdd5de;
  }
}

.login-footer {
  margin-top: 28px;
  font-size: 13px;
  color: #465562;
}

.el-form-item {
  ::v-deep(.el-form-item__label) {
    color: #aab4bf;
  }

  .el-input {
    ::v-deep(.el-input__wrapper) {
      background: rgba(255, 255, 255, 0.03);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
      border-radius: 10px;
    }
    ::v-deep(.el-input__wrapper.is-focus) {
      box-shadow: 0 0 0 1px #{$orange} inset;
    }
    ::v-deep(input) {
      color: #eef2f6;
    }
  }
}
</style>
