export function PickerBtn({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 text-xs border-2 transition-colors ${
        active
          ? 'border-brand bg-brand/10 text-brand'
          : disabled
          ? 'border-white text-line-soft cursor-not-allowed'
          : 'border-white text-muted hover:border-brand hover:text-brand cursor-pointer'
      }`}
    >
      {children}
    </button>
  )
}

export function FieldLabel({ children }) {
  return <label className="text-xs uppercase tracking-widest text-muted">{children}</label>
}

export function InlineError({ msg }) {
  return msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null
}
