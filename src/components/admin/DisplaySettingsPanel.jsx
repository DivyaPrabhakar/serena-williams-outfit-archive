import { useSettings } from '../../hooks/useSettings'
import { PickerBtn, FieldLabel } from './adminFormPrimitives'

export default function DisplaySettingsPanel() {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <FieldLabel>Getty Images</FieldLabel>
        <div className="flex gap-2">
          <PickerBtn
            active={!settings.hideGetty}
            onClick={() => updateSetting('hideGetty', false)}
          >
            Show Getty Images
          </PickerBtn>
          <PickerBtn
            active={settings.hideGetty}
            onClick={() => updateSetting('hideGetty', true)}
          >
            Hide Getty Images
          </PickerBtn>
        </div>
      </div>
      <p className="text-xs text-[#8A877F] leading-relaxed">
        Hides all Getty-sourced images from the gallery — useful for taking screenshots for
        publications that can’t use Getty Images. The remaining images pack together with no
        gaps.
      </p>
      <p className="text-xs text-[#555] leading-relaxed">
        This setting is saved in this browser only, so it affects just this device.
      </p>
    </div>
  )
}
