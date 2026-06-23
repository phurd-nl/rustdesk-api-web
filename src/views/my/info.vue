<template>
  <div>
    <el-card :title="T('Userinfo')" shadow="hover">
      <el-form class="info-form" ref="form" label-width="120px" label-suffix="：">
        <el-form-item :label="T('Username')">
          <div>{{ userStore.username }}</div>
        </el-form-item>
        <el-form-item :label="T('Email')">
          <div>{{ userStore.email }}</div>
        </el-form-item>
        <el-form-item v-if="!hasLinkedProvider" :label="T('Password')" prop="password">
          <el-button type="primary" @click="showChangePwd">{{ T('ChangePassword') }}</el-button>
        </el-form-item>
        <el-form-item label="OIDC">
          <!-- linked -> show the providers table; configured-but-unlinked -> a compact
               link row (no big nag); nothing configured -> a compact configure hint -->
          <div v-if="hasProvider && !hasLinkedProvider" class="oidc-inline">
            <span class="oidc-inline__txt">Sign in with your Microsoft Entra ID work account.</span>
            <el-button type="primary" size="small" @click="toBindEntra">Link Microsoft Entra ID</el-button>
          </div>
          <div v-else-if="!hasProvider" class="oidc-inline">
            <span class="oidc-inline__txt mut">No identity provider configured yet.</span>
            <el-button type="primary" size="small" @click="toBindEntra">Configure in Identity Providers</el-button>
          </div>
          <el-table v-else :data="oidcData" border fit>
            <el-table-column :label="T('IdP')" prop="op" align="center"></el-table-column>
            <el-table-column :label="T('Status')" prop="status" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.status === 1" type="success">{{ T('HasBind') }}</el-tag>
                <el-tag v-else type="danger">{{ T('NoBind') }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="T('Actions')" align="center" width="200">
              <template #default="{ row }">
                <el-button v-if="row.status === 1" type="danger" size="small" @click="toUnBind(row)">{{ T('UnBind') }}</el-button>
                <el-button v-else type="success" size="small" @click="toBind(row)">{{ T('ToBind') }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card shadow="hover" style="margin-top: 20px">
      <div v-html="html"></div>
    </el-card>
    <changePwdDialog v-model:visible="changePwdVisible"></changePwdDialog>
  </div>
</template>

<script setup>
  import changePwdDialog from '@/components/changePwdDialog.vue'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/store/user'
  import { useAppStore } from '@/store/app'
  import { bind, unbind } from '@/api/oauth'
  import { myOauth } from '@/api/user'
  import { ElMessageBox } from 'element-plus'
  import { T } from '@/utils/i18n'
  import { marked } from 'marked'

  const appStore = useAppStore()
  const userStore = useUserStore()
  const router = useRouter()
  const changePwdVisible = ref(false)
  const showChangePwd = () => {
    changePwdVisible.value = true
  }
  const oidcData = ref([])
  const getMyOauth = async () => {
    const res = await myOauth().catch(_ => false)
    if (res) {
      // server returns null (not []) when no providers are configured
      oidcData.value = Array.isArray(res.data) ? res.data : []
    }

  }
  getMyOauth()
  const hasLinkedProvider = computed(_ => oidcData.value.some(o => o.status === 1))
  const hasProvider = computed(_ => oidcData.value.length > 0)
  const toBind = async (row) => {
    const res = await bind({ op: row.op }).catch(_ => false)
    if (res) {
      const { code, url } = res.data
      window.open(url)
    }
  }
  const toBindEntra = () => {
    const row = oidcData.value.find(o => o.status !== 1) || oidcData.value[0]
    if (row) {
      // a provider is configured -> start the OIDC link flow
      toBind(row)
    } else {
      // none configured yet -> send the admin to add one
      router.push('/oauth')
    }
  }
  const toUnBind = async (row) => {
    const cf = await ElMessageBox.confirm(T('Confirm?', { param: T('UnBind') }), {
      confirmButtonText: T('Confirm'),
      cancelButtonText: T('Cancel'),
      type: 'warning',
    }).catch(_ => false)
    if (!cf) {
      return false
    }
    const res = await unbind({ op: row.op }).catch(_ => false)
    if (res) {
      getMyOauth()
    }

  }

  const html = computed(_ => marked(appStore.setting.hello||''))

</script>

<style scoped lang="scss">
.info-form {
  width: 600px;
  margin: 0 auto;

}

.oidc-inline {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;

  &__txt {
    font-size: 13px;
  }
}
</style>
