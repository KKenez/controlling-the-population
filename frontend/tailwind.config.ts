/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kimbie Dark inspired palette
        kimbie: {
          bg:       '#221a0f',   // deepest brown (editor background)
          surface:  '#2b1e11',   // card/panel background
          panel:    '#362712',   // elevated panels, sidebar
          border:   '#5e452b',   // borders, dividers
          muted:    '#a57a4c',   // muted text, subtle elements
          text:     '#d3af86',   // primary text (warm cream)
          heading:  '#e8c99a',   // headings, brighter cream
          cream:    '#fbebd4',   // brightest accent text
          accent:   '#dc9656',   // primary accent (warm orange)
          green:    '#889b4a',   // success green
          red:      '#dc3958',   // danger/delete red
          blue:     '#7eb2dd',   // info blue
          purple:   '#98676a',   // subtle purple
          yellow:   '#f79a32',   // highlight yellow
        },
      },
    },
  },
  plugins: [],
}
