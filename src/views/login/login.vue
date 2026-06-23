<template>
  <div class="login-container">
    <img src="@/assets/wordmark.png" alt="NextSession" class="login-wordmark"/>
    <div class="login-card">
      <h1 class="login-title">{{ T('Login') }}</h1>

      <el-form v-if="!disablePwd" label-position="top" class="login-form">
        <el-form-item :label="T('Username')">
          <el-input v-model="form.username" type="username" class="login-input"></el-input>
        </el-form-item>

        <el-form-item :label="T('Password')">
          <el-input v-model="form.password" type="password" @keyup.enter.native="login" show-password
                    class="login-input"></el-input>
        </el-form-item>
        <el-form-item :label="T('Captcha')" v-if="captchaCode">
          <el-input v-model="form.captcha" @keyup.enter.native="login"  class="login-input captcha-input">
            <template #append>
              <img :src="captchaCode.b64" @click="loadCaptcha" class="captcha" alt="captcha"/>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="login" type="primary" class="login-button">{{ T('Login') }}</el-button>
          <el-button v-if="allowRegister" @click="register" class="login-button">{{ T('Register') }}</el-button>
        </el-form-item>
      </el-form>

      <div class="divider" v-if="options.length > 0 && !disablePwd">
        <span>{{ T('or login in with') }}</span>
      </div>

      <div class="oidc-options">
        <el-button
          v-for="(option, index) in options"
          :key="index"
          @click="handleOIDCLogin(option.name)"
          class="oidc-btn"
          :class="{ 'oidc-primary': disablePwd }"
          :type="disablePwd ? 'primary' : 'default'">
          <svg v-if="isMicrosoft(option.name)" class="oidc-icon" viewBox="0 0 23 23" aria-hidden="true">
            <rect x="1" y="1" width="10" height="10" fill="#F25022"></rect>
            <rect x="12" y="1" width="10" height="10" fill="#7FBA00"></rect>
            <rect x="1" y="12" width="10" height="10" fill="#00A4EF"></rect>
            <rect x="12" y="12" width="10" height="10" fill="#FFB900"></rect>
          </svg>
          <img v-else :src="getProviderImage(option.name)" alt="provider" class="oidc-icon"/>
          <span>{{ ssoLabel(option.name) }}</span>
        </el-button>
      </div>

      <p v-if="disablePwd && options.length === 0" class="sso-empty">
        {{ T('No single sign-on provider is configured.') }}
      </p>
    </div>
    <p class="login-footer">NextSession Web &middot; secured by Nextlink</p>
  </div>
</template>

<script setup>
  import { reactive, onMounted, ref } from 'vue'
  import { useUserStore } from '@/store/user'
  import { ElMessage } from 'element-plus'
  import { T } from '@/utils/i18n'
  import { useRoute, useRouter } from 'vue-router'
  import { loginOptions, captcha } from '@/api/login'
  import { getCode, removeCode } from '@/utils/auth'

  const oauthInfo = ref({})
  const userStore = useUserStore()
  const route = useRoute()
  const router = useRouter()
  const options = reactive([]) // 存储 OIDC 登录选项

  let platform = window.navigator.platform
  if (navigator.platform.indexOf('Mac') === 0) {
    platform = 'mac'
  } else if (navigator.platform.indexOf('Win') === 0) {
    platform = 'windows'
  } else if (navigator.platform.indexOf('Linux armv') === 0) {
    platform = 'android'
  } else if (navigator.platform.indexOf('Linux') === 0) {
    platform = 'linux'
  }
  const userAgent = navigator.userAgent
  let browser = 'Unknown Browser'
  if (/chrome|crios/i.test(userAgent)) browser = 'Chrome'
  else if (/firefox|fxios/i.test(userAgent)) browser = 'Firefox'
  else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari'
  else if (/edg/i.test(userAgent)) browser = 'Edge'

  const form = reactive({
    username: '',
    password: '',
    platform: platform,
    captcha: '',
    captcha_id: ''
  })

  const captchaCode = ref('')
  const redirect = route.query?.redirect
  const login = async () => {
    const res = await userStore.login(form).catch(e => e)
    if (!res.code) {
      ElMessage.success(T('LoginSuccess'))
      router.push({ path: redirect || '/', replace: true })
      return
    }
    if (res.code === 110) {
      // need captcha
      loadCaptcha()
    }
  }

  const loadCaptcha = async () => {
    const captchaRes = await captcha().catch(_ => false)
    console.log(captchaRes)
    captchaCode.value = captchaRes.data.captcha
    form.captcha_id = captchaRes.data.captcha.id
  }

  const handleOIDCLogin = (provider) => {
    userStore.oidc(provider, platform, browser)
  }
  // Microsoft Entra providers show the Microsoft logo instead of the generic OIDC mark
  const isMicrosoft = (name) => /entra|microsoft|azure|windows/i.test(name || '')

  import googleImage from '@/assets/google.png'
  import githubImage from '@/assets/github.png'
  import oidcImage from '@/assets/oidc.png'
  import webauthImage from '@/assets/webauth.png'
  import defaultImage from '@/assets/oidc.png'

  const providerImageMap = {
    google: googleImage,
    github: githubImage,
    oidc: oidcImage,
    // WebAuth: webauthImage,
    default: defaultImage,
  }

  const getProviderImage = (provider) => {
    return providerImageMap[provider.toLowerCase()] || providerImageMap.default
  }

  // SSO-only mode (password login disabled): one provider reads as "Use single sign-on";
  // multiple providers name each one.
  const ssoLabel = (name) => {
    if (disablePwd.value && options.length === 1) return T('Use single sign-on')
    return T(name)
  }

  const allowRegister = ref(false)
  const disablePwd = ref(false)
  const loadLoginOptions = async () => {
    try {
      const res = await loginOptions().catch(_ => false)
      if (!res || !res.data) return console.error('No valid response received')
      res.data.ops.map(option => (options.push({ name: option }))) // 创建新的对象数组
      if (res.data.auto_oidc) {
        // 如果有自动OIDC登录选项，直接调用第一个
        handleOIDCLogin(res.data.ops[0])
      }
      disablePwd.value = res.data.disable_pwd
      allowRegister.value = res.data.register
      if (res.data.need_captcha) {
        loadCaptcha()
      }
    } catch (error) {
      console.error('Error loading login options:', error.message)
    }
  }

  onMounted(async () => {
    const code = getCode()
    if (code) {
      // 如果code存在，进行query获取user info
      const res = await userStore.query(code)
      if (res) {
        // 删除code，确保跳转之前对code进行清楚
        removeCode()
        ElMessage.success(T('LoginSuccess'))
        router.push({ path: redirect || '/', replace: true })
      }
    } else {
      // 如果code不存在, 现实登陆页面
      loadLoginOptions() // 组件挂载后调用登录选项加载函数
    }
  })

  const register = () => {
    router.push('/register')
  }
</script>

<style scoped lang="scss">
/* NextVault-family login: dark canvas, centered wordmark, frosted card, orange primary. */
$page: #0b1622;
$card: #16212e;
$orange: #f49e1b;
$muted: #8b98a6;

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
  .captcha {
    cursor: pointer;
    width: 150px;
  }
}
.captcha-input {
  :deep(.el-input-group__append) {
    border-radius: 8px;
    padding: 0;
    overflow: hidden;
  }
}

/* Primary action = NextVault orange (overrides the app's blue, login only). */
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

.divider {
  display: flex;
  align-items: center;
  margin: 18px 0;
  font-size: 13px;
  color: $muted;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: rgba(255, 255, 255, 0.1);
  }
  &::before { margin-right: 10px; }
  &::after { margin-left: 10px; }
}

.oidc-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.oidc-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 46px;
  margin: 0;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  color: #cdd5de;
  font-size: 14px;
  font-weight: 500;
  & + .oidc-btn { margin-top: 10px; }
  &:hover {
    background: rgba(244, 158, 27, 0.12);
    border-color: rgba(244, 158, 27, 0.5);
    color: #f7ad3e;
  }
  /* SSO-only: the provider button is the orange primary CTA ("Use single sign-on"). */
  &.oidc-primary {
    height: 48px;
    font-size: 15px;
    font-weight: 600;
    background: $orange;
    border-color: $orange;
    color: #1b1206;
    &:hover {
      background: #f7ad3e;
      border-color: #f7ad3e;
      color: #1b1206;
    }
  }
}

.sso-empty {
  margin: 4px 0 0;
  font-size: 13px;
  color: #8b98a6;
}

.oidc-icon {
  width: 22px;
  height: 22px;
  margin-right: 8px;
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