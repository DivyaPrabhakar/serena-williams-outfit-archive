export function PickerBtn({ active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1.5 text-xs border transition-colors ${
        active
          ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#C9A84C]'
          : disabled
          ? 'border-[#1a1a1a] text-[#2a2a2a] cursor-not-allowed'
          : 'border-[#2a2a2a] text-[#8A877F] hover:border-[#C9A84C] hover:text-[#C9A84C] cursor-pointer'
      }`}
    >
      {children}
    </button>
  )
}

export function FieldLabel({ children }) {
  return <label className="text-xs uppercase tracking-widest text-[#8A877F]">{children}</label>
}

export function InlineError({ msg }) {
  return msg ? <p className="text-red-400 text-xs mt-1">{msg}</p> : null
}
