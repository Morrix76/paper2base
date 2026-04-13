import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'

export type CustomFieldRow = {
  id: string
  name: string
  description: string
  type: 'string' | 'number' | 'boolean'
}

type SchemaBuilderProps = {
  useDefaultSchema: boolean
  onUseDefaultSchemaChange: (value: boolean) => void
  fields: CustomFieldRow[]
  onFieldsChange: (fields: CustomFieldRow[]) => void
  disabled?: boolean
}

export function SchemaBuilder({
  useDefaultSchema,
  onUseDefaultSchemaChange,
  fields,
  onFieldsChange,
  disabled = false,
}: SchemaBuilderProps) {
  const { t } = useTranslation()
  const addField = () => {
    onFieldsChange([
      ...fields,
      {
        id: crypto.randomUUID(),
        name: '',
        description: '',
        type: 'string',
      },
    ])
  }

  const removeField = (id: string) => {
    onFieldsChange(fields.filter((f) => f.id !== id))
  }

  const updateField = (id: string, patch: Partial<Omit<CustomFieldRow, 'id'>>) => {
    onFieldsChange(
      fields.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    )
  }

  const PlusIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
    </svg>
  )

  return (
    <div className="space-y-4">
      <Tabs
        value={useDefaultSchema ? 'default' : 'custom'}
        onValueChange={(v) => onUseDefaultSchemaChange(v === 'default')}
      >
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-gray-100 bg-transparent p-0">
          <TabsTrigger
            value="default"
            disabled={disabled}
            className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 text-gray-400 data-[state=active]:border-violet-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
          >
            {t('schema.tabs.default')}
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            disabled={disabled}
            className="rounded-none border-b-2 border-transparent px-0 pb-2 pt-0 text-gray-400 data-[state=active]:border-violet-600 data-[state=active]:text-gray-900 data-[state=active]:shadow-none"
          >
            {t('schema.tabs.custom')}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {!useDefaultSchema && (
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4">
          <p className="text-sm text-gray-400">
            {t('schema.hint')}
          </p>
          {fields.map((f) => (
            <div
              key={f.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 sm:flex-row sm:items-end sm:gap-3"
            >
              <div className="min-w-0 flex-1">
                <Label className="text-xs font-semibold">{t('schema.field.name')}</Label>
                <Input
                  type="text"
                  value={f.name}
                  onChange={(e) => updateField(f.id, { name: e.target.value })}
                  disabled={disabled}
                  placeholder={t('schema.field.namePlaceholder')}
                  className="mt-2 rounded-lg border-gray-200 placeholder:text-gray-300 focus-visible:ring-violet-500/30"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Label className="text-xs font-semibold">
                  {t('schema.field.description')}
                </Label>
                <Input
                  type="text"
                  value={f.description}
                  onChange={(e) => updateField(f.id, { description: e.target.value })}
                  disabled={disabled}
                  placeholder={t('schema.field.descriptionPlaceholder')}
                  className="mt-2 rounded-lg border-gray-200 placeholder:text-gray-300 focus-visible:ring-violet-500/30"
                />
              </div>
              <div className="w-full sm:w-36">
                <Label className="text-xs font-semibold">{t('schema.field.type')}</Label>
                <select
                  value={f.type}
                  onChange={(e) =>
                    updateField(f.id, {
                      type: e.target.value as CustomFieldRow['type'],
                    })
                  }
                  disabled={disabled}
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="string">{t('schema.field.typeString')}</option>
                  <option value="number">{t('schema.field.typeNumber')}</option>
                  <option value="boolean">{t('schema.field.typeBoolean')}</option>
                </select>
              </div>
              <Button
                type="button"
                onClick={() => removeField(f.id)}
                disabled={disabled}
                variant="outline"
                size="icon"
                aria-label={t('schema.field.removeAria')}
                className="rounded-lg border-gray-200"
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            onClick={addField}
            disabled={disabled}
            variant="outline"
            className="w-full rounded-lg border-dashed border-gray-200 text-gray-900 hover:bg-violet-50 hover:text-gray-900"
          >
            <PlusIcon className="h-4 w-4" />
            {t('schema.field.add')}
          </Button>
        </div>
      )}
    </div>
  )
}
