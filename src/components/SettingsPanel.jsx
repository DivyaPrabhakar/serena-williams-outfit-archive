function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-muted group-hover:text-ink transition-colors">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-gold' : 'bg-dark3'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-ink transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-muted mb-2">{label}</p>
      <div className="flex gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              value === opt.value ? 'bg-gold text-dark' : 'bg-dark3 text-muted hover:text-ink'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPanel({ settings, updateSetting, onClose }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-end pt-14 pr-4"
      onClick={onClose}
    >
      <div
        className="bg-dark2 border border-dark3 rounded-xl shadow-2xl w-72 p-5 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-playfair text-gold text-base">Display Settings</h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink text-xl leading-none"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <RadioGroup
          label="Grid Size"
          value={settings.gridDensity}
          onChange={v => updateSetting('gridDensity', v)}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'standard', label: 'Standard' },
            { value: 'large', label: 'Large' },
          ]}
        />

        <RadioGroup
          label="Card Label"
          value={settings.cardLabel}
          onChange={v => updateSetting('cardLabel', v)}
          options={[
            { value: 'tournament', label: 'Tournament' },
            { value: 'notes', label: 'Notes' },
          ]}
        />

        <div className="space-y-3 pt-1">
          <Toggle
            label="Lightbox on click"
            checked={settings.lightbox}
            onChange={v => updateSetting('lightbox', v)}
          />
          <Toggle
            label="Color dot"
            checked={settings.colorDot}
            onChange={v => updateSetting('colorDot', v)}
          />
          <Toggle
            label="Show empty slots"
            checked={settings.showEmptySlots}
            onChange={v => updateSetting('showEmptySlots', v)}
          />
          <Toggle
            label="Show dim slots"
            checked={settings.showDimSlots}
            onChange={v => updateSetting('showDimSlots', v)}
          />
        </div>
      </div>
    </div>
  )
}
