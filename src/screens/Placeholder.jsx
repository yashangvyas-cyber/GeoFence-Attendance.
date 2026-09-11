import { Breadcrumb } from '../components/AppShell'
import { CX, EmptyState } from '../components/ui'

/* Deliberately a stub, not a guess. Each of these has a finished ASCII design in
   docs/RND-GEOFENCE-ATTENDANCE.md §5 — build from that, not from memory. */
export default function Placeholder({ id, title }) {
  return (
    <>
      <Breadcrumb trail={[{ label: title }]} />
      <div className={CX.pageWrap}>
        <div className={CX.panelHead}>
          <h1 className={CX.headTitle}>{title}</h1>
          
        </div>
        <div className="border-x border-b rounded-b-lg border-gray-200 bg-white">
          <EmptyState
            icon="marker-pin-01"
            title="Not built yet"
            body="This screen is part of the design but has not been built in this prototype yet."
          />
        </div>
      </div>
    </>
  )
}
