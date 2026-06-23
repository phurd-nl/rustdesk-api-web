import axios from 'axios'
import request from '@/utils/request'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/store/user'
import { pinia } from '@/store'

export function list (params) {
  return request({
    url: '/downloads/list',
    params,
  })
}

// download fetches the file as a blob with auth and triggers a browser save.
// The shared `request` response interceptor expects JSON {code:0,...} and would
// reject a binary blob, so we issue a direct axios request here, mirroring the
// way request.js resolves the api-token (Pinia user store, falling back to
// getToken()).
export async function download (name) {
  const userStore = useUserStore(pinia)
  const token = userStore.token || getToken()

  const res = await axios({
    baseURL: import.meta.env.VITE_SERVER_API,
    url: `/downloads/file/${encodeURIComponent(name)}`,
    method: 'get',
    responseType: 'blob',
    withCredentials: true,
    headers: token ? { 'api-token': token } : {},
  })

  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
