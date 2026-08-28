import { PageHeader } from '../components/PageHeader.jsx'

export function ProgressScreen() {
  return (
    <div className="page">
      <PageHeader title="Progress" />
      <p className="empty-state">No progress to show yet.</p>
    </div>
  )
}
