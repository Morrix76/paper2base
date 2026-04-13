import axios from 'axios'
import i18n from '@/i18n'

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    if (data && typeof data === 'object' && 'detail' in data) {
      const d = (data as { detail: unknown }).detail
      if (typeof d === 'string') {
        return d
      }
      if (Array.isArray(d)) {
        return d
          .map((item) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              return String((item as { msg: unknown }).msg)
            }
            try {
              return JSON.stringify(item)
            } catch {
              return String(item)
            }
          })
          .join('; ')
      }
    }
    if (error.code === 'ECONNABORTED') {
      return i18n.t('errors.timeout')
    }
    if (!error.response) {
      return i18n.t('errors.cannotReachServer')
    }
    return i18n.t('errors.serverHttp', { status: error.response.status })
  }
  if (error instanceof Error) {
    return error.message
  }
  return i18n.t('errors.unexpected')
}
