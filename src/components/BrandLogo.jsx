import { Link } from 'react-router-dom'

function BrandLogo({ to = '/portal', compact = false, className = '' }) {
  const classes = `brand-logo ${compact ? 'brand-logo-compact' : ''} ${className}`.trim()
  const content = (
    <>
      <img className="brand-logo-image" src="/locative-logo.png" alt="Locative" />
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
