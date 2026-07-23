import { Link } from 'react-router-dom'
import { RolesIcon, ValidationRulesIcon } from '../../shared/ui'

export function DashboardPage() {
  return (
    <section>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="callout">
        <h2>Validation rules and RBAC are online</h2>
        <p>
          Manage field-level validation rules for a target type, or manage roles and the
          permissions granted to them.
        </p>
        <div className="callout-actions">
          <Link to="/validation-rules" className="btn btn--primary">
            Go to validation rules
          </Link>
          <Link to="/rbac" className="btn btn--ghost">
            Go to roles &amp; permissions
          </Link>
        </div>
      </div>

      <div className="dashboard-links">
        <Link to="/validation-rules" className="link-card">
          <ValidationRulesIcon size={20} />
          <h3 className="section-heading">Validation rules</h3>
          <p>Field-level rules enforced against a target type before it's accepted.</p>
        </Link>
        <Link to="/rbac" className="link-card">
          <RolesIcon size={20} />
          <h3 className="section-heading">Roles &amp; permissions</h3>
          <p>Manage roles, permissions, and which permissions each role grants.</p>
        </Link>
      </div>
    </section>
  )
}
