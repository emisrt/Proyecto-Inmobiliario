import { useState } from 'react'
import { AlertCircle, IdCard, Lock, Phone, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { agencyConfig } from '../config/agencyConfig'
import { useAuth } from '../context/useAuth'
import { getRoleHome } from '../utils/roles'

const demoRoles = [
  { value: 'inquilino', label: 'Inquilino demo' },
  { value: 'propietario', label: 'Propietario demo' },
  { value: 'profesional', label: 'Profesional externo demo' },
  { value: 'visitante', label: 'Visitante demo' },
]

function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    const { data, error: registerError, profile } = await register({
      email,
      password,
      fullName,
      role,
      phone,
    })

    if (registerError) return

    if (data.session) {
      navigate(getRoleHome(profile?.role || role), { replace: true })
      return
    }

    setMessage('Cuenta de prueba creada. Revisá confirmación de email si Supabase la solicita.')
  }

  return (
    <AuthShell
      eyebrow="Acceso demo"
      title="Crear cuenta de prueba"
      description="Este acceso se utiliza únicamente para la demostración del prototipo académico."
      footer={<Link to="/login">Ya tengo acceso</Link>}
    >
      <form className="figma-auth-form" onSubmit={handleSubmit}>
        <label>
          <span>
            <User size={14} />
            Nombre completo
          </span>
          <input
            type="text"
            placeholder="Nombre y apellido"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </label>
        <label>
          <span>
            <IdCard size={14} />
            Email
          </span>
          <input
            type="email"
            placeholder="usuario@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          <span>
            <Lock size={14} />
            Contraseña
          </span>
          <input
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength="6"
          />
        </label>
        <label>
          <span>
            <Phone size={14} />
            Teléfono
          </span>
          <input
            type="tel"
            placeholder="Opcional"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </label>
        <label>
          <span>
            <User size={14} />
            Perfil demo
          </span>
          <select value={role} onChange={(event) => setRole(event.target.value)} required>
            <option value="" disabled>
              Seleccionar perfil de prueba
            </option>
            {demoRoles.map((demoRole) => (
              <option key={demoRole.value} value={demoRole.value}>
                {demoRole.label}
              </option>
            ))}
          </select>
        </label>
        <p className="form-help">
          En un entorno real, el alta de usuarios será administrada por {agencyConfig.name}.
        </p>
        {error ? (
          <p className="inline-error">
            <AlertCircle size={15} />
            {error}
          </p>
        ) : null}
        {message ? <p className="success-message">{message}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Creando cuenta de prueba...' : 'Crear cuenta de prueba'}
        </button>
      </form>
    </AuthShell>
  )
}

export default Register
