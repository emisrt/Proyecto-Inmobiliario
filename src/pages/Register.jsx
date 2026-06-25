import { useState } from 'react'
import { AlertCircle, IdCard, Lock, Phone, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/useAuth'
import { getRoleHome } from '../utils/roles'

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

    setMessage('Registro creado. Revisar confirmacion de email si Supabase la solicita.')
  }

  return (
    <AuthShell
      eyebrow="Alta inicial"
      title="Crear cuenta"
      description="Registra un usuario de prueba para validar los accesos por rol."
      footer={<Link to="/login">Ya tengo una cuenta</Link>}
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
            Contrasena
          </span>
          <input
            type="password"
            placeholder="Minimo 6 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength="6"
          />
        </label>
        <label>
          <span>
            <Phone size={14} />
            Telefono
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
            Rol
          </span>
          <select value={role} onChange={(event) => setRole(event.target.value)} required>
            <option value="" disabled>
              Seleccionar rol
            </option>
            <option value="agente_inmobiliario">Agente inmobiliario</option>
            <option value="propietario">Propietario</option>
            <option value="inquilino">Inquilino</option>
            <option value="profesional">Profesional</option>
            <option value="visitante">Visitante</option>
          </select>
        </label>
        {error ? (
          <p className="inline-error">
            <AlertCircle size={15} />
            {error}
          </p>
        ) : null}
        {message ? <p className="success-message">{message}</p> : null}
        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </AuthShell>
  )
}

export default Register
