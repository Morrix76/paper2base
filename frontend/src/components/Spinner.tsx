type SpinnerProps = {
  label?: string
}

export function Spinner({ label = 'Elaborazione in corso…' }: SpinnerProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600"
        aria-hidden
      />
      <p className="text-sm font-semibold text-indigo-600">{label}</p>
    </div>
  )
}
