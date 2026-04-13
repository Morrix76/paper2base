import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'

type WebhookConfigProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 010 6.364l-3.182 3.182a4.5 4.5 0 01-6.364-6.364l1.061-1.06m6.105 4.502a4.5 4.5 0 010-6.364l3.182-3.182a4.5 4.5 0 116.364 6.364l-1.061 1.06"
      />
    </svg>
  )
}

export function WebhookConfig({ value, onChange, disabled = false }: WebhookConfigProps) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <Label
        htmlFor="webhook-url"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <LinkIcon className="h-4 w-4 text-violet-600" />
        {t('webhook.label')}
      </Label>
      <Input
        id="webhook-url"
        type="text"
        name="webhook_url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={t('webhook.placeholder')}
        autoComplete="off"
        className="border-gray-200 placeholder:text-gray-300 focus-visible:ring-violet-500/30"
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('webhook.help')}
      </p>
    </div>
  )
}
