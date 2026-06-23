<template>
  <div>
    <el-card class="list-body" shadow="hover">
      <template #header>
        <span>{{ T('Downloads') }}</span>
      </template>
      <el-table :data="listRes.list" v-loading="listRes.loading" border>
        <el-table-column prop="name" :label="T('Name')" align="center"/>
        <el-table-column prop="platform" :label="T('Platform')" align="center" width="150"/>
        <el-table-column :label="T('Size')" align="center" width="150">
          <template #default="{row}">
            {{ humanSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column :label="T('UpdatedAt')" align="center" width="200">
          <template #default="{row}">
            {{ formatTime(row.modified) }}
          </template>
        </el-table-column>
        <el-table-column :label="T('Actions')" align="center" width="200">
          <template #default="{row}">
            <el-button type="primary" :loading="row.downloading" @click="handleDownload(row)">
              {{ T('Download') }}
            </el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="No installers published yet"/>
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
  import { onMounted, onActivated, reactive } from 'vue'
  import { ElMessage } from 'element-plus'
  import { list, download } from '@/api/downloads'
  import { T } from '@/utils/i18n'

  const listRes = reactive({
    list: [],
    loading: false,
  })

  const getList = async () => {
    listRes.loading = true
    try {
      const res = await list()
      listRes.list = res.data?.list || []
    } finally {
      listRes.loading = false
    }
  }

  const handleDownload = async (row) => {
    row.downloading = true
    try {
      await download(row.name)
    } catch (e) {
      ElMessage({ message: e?.message || 'error', type: 'error', duration: 5 * 1000 })
    } finally {
      row.downloading = false
    }
  }

  const humanSize = (bytes) => {
    if (!bytes && bytes !== 0) return ''
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = bytes
    let i = 0
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024
      i++
    }
    return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`
  }

  const formatTime = (unix) => {
    if (!unix) return ''
    const d = new Date(unix * 1000)
    return d.toLocaleString()
  }

  onMounted(getList)
  onActivated(getList)
</script>

<style scoped lang="scss">
</style>
