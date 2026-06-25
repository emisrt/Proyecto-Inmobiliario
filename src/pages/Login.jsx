import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import { useAuth } from '../context/useAuth'
import { getRoleHome } from '../utils/roles'

function Login() {
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const { error: loginError, profile } = await login(email, password)

    if (!loginError) {
      navigate(getRoleHome(profile?.role), { replace: true })
    }
  }

  return (
    <>
      <PublicHeader />
      <main className="auth-page">
        <section className="auth-card">
          <p className="eyebrow">Acceso al sistema</p>
          <h1>Iniciar sesion</h1>
          <form className="form" onSubmit={handleSubmit}>
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
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
            <button type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
          {error ? <p className="error-message">{error}</p> : null}
          <Link to="/register">Crear cuenta de prueba</Link>
        </section>
      </main>
    </>
  )
}

export default Login
