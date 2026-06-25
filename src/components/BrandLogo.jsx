import { Link } from 'react-router-dom'

const logoSources = {
  light: '/locative-logo-light.png',
  dark: '/locative-logo-dark.png',
  mono: '/locative-logo-mono.png',
  mark: '/locative-mark.png',
}

function BrandLogo({ to = '/portal', compact = false, variant = 'light', className = '' }) {
  const classes = `brand-logo ${compact ? 'brand-logo-compact' : ''} ${variant === 'mark' ? 'brand-logo-mark' : ''} ${className}`.trim()
  const content = (
    <>
      <img className="brand-logo-image" src={logoSources[variant] || logoSources.light} alt="Locative" />
      <span className="brand-logo-fallback">Locative</span>
    </>
  )

  if (!to) {
    return <div className={classes}>{content}</div>
  }

  return (
    <Link className={classes} to={to}>
      {content}
    </Link>
  )
}

export default BrandLogo
