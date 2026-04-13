import { useCallback, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type DropzoneProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.25}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  )
}

const ALLOWED_NAME = /\.(pdf|docx|xlsx|jpe?g|png)$/i

function isAllowedUpload(file: File): boolean {
  return ALLOWED_NAME.test(file.name)
}

export function Dropzone({ file, onFileChange, disabled = false }: DropzoneProps) {
  const { t } = useTranslation()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragDepth, setDragDepth] = useState(0)
  const isDragOver = dragDepth > 0

  const openPicker = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const assignFile = useCallback(
    (next: File | null) => {
      onFileChange(next)
    },
    [onFileChange],
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    const first = list?.[0]
    if (first && isAllowedUpload(first)) {
      assignFile(first)
    }
    e.target.value = ''
  }

  const onDragEnter = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setDragDepth((d) => d + 1)
  }

  const onDragLeave = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setDragDepth((d) => Math.max(0, d - 1))
  }

  const onDragOver = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
  }

  const onDrop = (e: React.DragEvent) => {
    if (disabled) return
    e.preventDefault()
    e.stopPropagation()
    setDragDepth(0)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped && isAllowedUpload(dropped)) {
      assignFile(dropped)
    }
  }

  const hasFile = file !== null

  const surfaceClass = (() => {
    if (isDragOver) {
      return 'border-violet-400 bg-violet-50'
    }
    if (hasFile) {
      return 'border-gray-200 bg-white'
    }
    return 'border-gray-200 bg-white hover:border-violet-400 hover:bg-violet-50'
  })()

  const disabledClass = disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/jpeg,image/png"
        className="sr-only"
        disabled={disabled}
        onChange={onInputChange}
      />

      <button
        type="button"
        disabled={disabled}
        onClick={openPicker}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`group flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-5 py-5 text-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${surfaceClass} ${disabledClass}`}
        aria-label={t('dropzone.aria')}
      >
        <UploadIcon className="h-8 w-8 text-gray-300 transition-colors group-hover:text-violet-500" />
        <div className="space-y-1">
          <span className="block text-base font-bold tracking-tight text-gray-900">
            {isDragOver ? t('dropzone.dragOver') : t('dropzone.idle')}
          </span>
          <span className="block text-sm text-gray-400">
            {t('dropzone.orBrowse')}{' '}
            <span className="font-semibold text-gray-900 underline decoration-gray-200 decoration-2 underline-offset-2">
              {t('dropzone.browseFiles')}
            </span>
          </span>
          <span className="block text-xs text-gray-400">
            {t('dropzone.formats')}
          </span>
        </div>
        {hasFile && !isDragOver && (
          <span
            className="mt-2 inline-flex max-w-full items-center gap-2 rounded-lg bg-white px-4 py-2 text-base font-medium text-gray-900 ring-1 ring-gray-100"
            title={file.name}
          >
            <span className="truncate">{file.name}</span>
          </span>
        )}
      </button>

      {hasFile && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation()
              assignFile(null)
            }}
            className="text-sm font-medium text-gray-500 underline-offset-2 hover:text-gray-900 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('dropzone.removeFile')}
          </button>
        </div>
      )}
    </div>
  )
}
