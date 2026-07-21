import { Link } from 'react-router-dom'

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
    </section>
  )
}
