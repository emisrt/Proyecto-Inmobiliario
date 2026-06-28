import { useMemo, useState } from 'react'
import { AlertCircle, Building2, IdCard, LayoutDashboard, Lock, Phone, ShieldCheck, User, UsersRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { useAuth } from '../context/useAuth'
import { getRoleHome } from '../utils/roles'

const demoRoles = [
  {
    value: 'agente_inmobiliario',
    label: 'Inmobiliaria',
    help: 'Accede al panel de gestión general.',
  },
  {
    value: 'propietario',
    label: 'Propietario',
    help: 'Consulta propiedades, contratos, pagos y arreglos.',
  },
  {
    value: 'inquilino',
    label: 'Inquilino',
    help: 'Consulta contrato, pagos y solicita arreglos.',
  },
  {
    value: 'profesional',
    label: 'Profesional',
    help: 'Consulta arreglos disponibles y gestiona postulaciones.',
  },
]

const registerValueItems = [
  { label: 'Probá el sistema con distintos perfiles', icon: UsersRound },
  { label: 'Accedé a paneles específicos por rol', icon: LayoutDashboard },
  { label: 'Explorá el portal público y la gestión interna', icon: Building2 },
  { label: 'Entorno preparado para demo académica', icon: ShieldCheck },
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

  const selectedRoleHelp = useMemo(
    () => demoRoles.find((demoRole) => demoRole.value === role)?.help,
    [role],
  )

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
      eyebrow="ACCESO DEMO"
      title="Crear cuenta de prueba"
      description="Registrá un usuario demo para probar el prototipo con distintos perfiles."
      footer={<Link to="/login">Volver a iniciar sesión</Link>}
      showValuePanel
      valuePanelEyebrow="Locative"
      valuePanelTitle="Probá Locative como parte de la demo."
      valuePanelDescription="Creá un usuario temporal y recorré los paneles principales del sistema interno de gestión inmobiliaria."
      valuePanelItems={registerValueItems}
    >
      <form className="figma-auth-form register-demo-form" onSubmit={handleSubmit}>
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
            autoComplete="name"
            required
          />
        </label>
        <label>
          <span>
            <IdCard size={14} />
            Correo electrónico
          </span>
          <input
            type="email"
            placeholder="usuario@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
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
            autoComplete="new-password"
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
            placeholder="Teléfono (opcional)"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            autoComplete="tel"
          />
        </label>
        <label className="demo-role-field">
          <span>
            <User size={14} />
            Perfil de prueba
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
          {selectedRoleHelp ? <small>{selectedRoleHelp}</small> : null}
        </label>
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
