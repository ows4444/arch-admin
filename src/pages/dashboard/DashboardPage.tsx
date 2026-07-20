import { Link } from 'react-router-dom'

export function DashboardPage() {
  return (
    <section>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      <div className="callout">
        <h2>Validation rules is online</h2>
        <p>
          It's the only console available right now. Roles and permissions are next — for now,
          head to validation rules to review or add rules for a target type.
        </p>
        <div>
          <Link to="/validation-rules" className="btn btn--primary">
            Go to validation rules
          </Link>
        </div>
      </div>
    </section>
  )
}
