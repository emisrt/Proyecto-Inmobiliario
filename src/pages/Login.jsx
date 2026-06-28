import { useState } from 'react'
import { AlertCircle, Eye, EyeOff, IdCard, Lock } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { agencyConfig } from '../config/agencyConfig'
import { useAuth } from '../context/useAuth'
import { getRoleHome } from '../utils/roles'

function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const { error: loginError, profile } = await login(email, password)

    if (!loginError) {
      navigate(getRoleHome(profile?.role), { replace: true })
    }
  }

  return (
    <AuthShell
      eyebrow="Acceso al sistema"
      title="Iniciar sesión"
      description={`Ingresá con tu correo electrónico y contraseña para acceder a ${agencyConfig.systemName}.`}
      footer={<Link to="/register">Crear cuenta de prueba</Link>}
      showValuePanel
    >
      <form className="figma-auth-form" onSubmit={handleSubmit}>
        <label>
          <span>
            <IdCard size={14} />
            Correo electrónico
          </span>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          <span>
            <Lock size={14} />
            Contraseña
          </span>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="ghost-icon-button"
              type="button"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>
        {error ? (
          <p className="inline-error">
            <AlertCircle size={15} />
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Ingresar'}
        </button>
      </form>
    </AuthShell>
  )
}

export default Login
