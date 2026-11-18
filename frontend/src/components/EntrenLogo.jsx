/** The Entren.ar wordmark, kept as text so it stays crisp and responsive at every size. */
export default function EntrenLogo({ className = '', tone = 'auto' }) {
  const classes = ['entren-logo', `entren-logo--${tone}`, className].filter(Boolean).join(' ')
  return <span className={classes} role="img" aria-label="Entren.ar">
    <span>Entren</span><span className="entren-logo-dot">.</span><span>ar</span>
  </span>
}
