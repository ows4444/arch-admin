import { useNavigate } from 'react-router-dom'
import { useLogout } from './use-logout'

export function LogoutButton() {
  const navigate = useNavigate()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => navigate('/login', { replace: true }),
    })
  }

  return (
    <button type="button" onClick={handleLogout} disabled={logout.isPending}>
      {logout.isPending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
