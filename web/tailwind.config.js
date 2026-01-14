// tailwind.config.js
module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        // This maps the Tailwind class 'bg-bg-body' to your CSS variable
        'bg-body': 'var(--bg-body)',
        'bg-surface': 'var(--bg-surface)',
        'bg-card': 'var(--bg-card)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        'border-col': 'var(--border)',
        'input-bg': 'var(--input-bg)',
      }
      // ...
    }
  }
}