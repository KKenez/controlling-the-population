import { useState } from 'react'

const EMOJI_GROUPS: Record<string, string[]> = {
  'Activity': [
    '🏃', '🏋️', '🧘', '🚴', '🏊', '⚽', '🎾', '🥊', '🧗', '🎯',
    '🏄', '🚶', '🤸', '⛷️', '🏇',
  ],
  'Work': [
    '💼', '💻', '📊', '📈', '🎯', '📝', '✏️', '📌', '🗂️', '📋',
    '🖥️', '⌨️', '🔧', '⚙️', '🛠️',
  ],
  'Learning': [
    '📚', '🎓', '🧠', '💡', '🔬', '🔭', '📐', '🧮', '🗣️', '✍️',
    '📖', '🎒', '🏫', '📓', '🧪',
  ],
  'Social': [
    '👥', '🤝', '💬', '🎉', '🥂', '☕', '🍽️', '🎭', '🎪', '🎶',
    '🎤', '🎬', '📸', '🎊', '🫂',
  ],
  'Health': [
    '❤️', '🧘', '😴', '💊', '🩺', '🍎', '🥗', '🥤', '💧', '🌿',
    '🧴', '🛁', '🧘‍♂️', '🌅', '🫁',
  ],
  'Personal': [
    '🏠', '🌱', '🎨', '🎵', '📷', '✈️', '🗺️', '🏔️', '🌊', '🌸',
    '🐾', '🧩', '♟️', '🎮', '🎲',
  ],
  'Finance': [
    '💰', '💳', '🏦', '📉', '🪙', '💎', '🧾', '📑', '🔑', '🏡',
  ],
  'Misc': [
    '⭐', '🔥', '⚡', '🌙', '☀️', '🌈', '🎁', '🏆', '🥇', '🚀',
    '💪', '👁️', '🫀', '🧬', '🌍',
  ],
}

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center text-xl border border-kimbie-border rounded-md hover:bg-kimbie-surface"
      >
        {value || '😀'}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-12 z-20 bg-kimbie-panel border border-kimbie-border rounded-lg shadow-lg p-3 w-72 max-h-80 overflow-y-auto">
            {Object.entries(EMOJI_GROUPS).map(([group, emojis]) => (
              <div key={group} className="mb-2">
                <p className="text-[10px] font-medium text-kimbie-muted uppercase tracking-wider mb-1">{group}</p>
                <div className="flex flex-wrap gap-0.5">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onChange(emoji); setIsOpen(false) }}
                      className={`w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-kimbie-surface ${
                        value === emoji ? 'bg-kimbie-accent/20 ring-1 ring-kimbie-accent' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
