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
        className="w-10 h-10 flex items-center justify-center text-xl border border-gray-300 rounded-md hover:bg-gray-50"
      >
        {value || '😀'}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-12 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72 max-h-80 overflow-y-auto">
            {Object.entries(EMOJI_GROUPS).map(([group, emojis]) => (
              <div key={group} className="mb-2">
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-1">{group}</p>
                <div className="flex flex-wrap gap-0.5">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => { onChange(emoji); setIsOpen(false) }}
                      className={`w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-gray-100 ${
                        value === emoji ? 'bg-indigo-50 ring-1 ring-indigo-300' : ''
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
