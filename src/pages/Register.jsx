import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
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
    <>
      <PublicHeader />
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">Alta inicial</p>
          <h1>Registro</h1>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Nombre completo
              <input
                type="text"
                placeholder="Nombre y apellido"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                placeholder="usuario@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              Contrasena
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
              Telefono
              <input
                type="tel"
                placeholder="Opcional"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <label>
              Rol
              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                required
              >
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
            <button type="submit" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
          {error ? <p className="error-message">{error}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
          <Link to="/login">Ya tengo una cuenta</Link>
        </section>
      </main>
    </>
  )
}

export default Register
