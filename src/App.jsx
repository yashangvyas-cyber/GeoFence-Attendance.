import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import ZoneList from './screens/ZoneList'
import Placeholder from './screens/Placeholder'
import ZoneForm from './screens/ZoneForm'
import Attendance from './screens/Attendance'
import OperationalConfig from './screens/OperationalConfig'
import Requests from './screens/Requests'
import SiteReport from './screens/SiteReport'
import { ZoneProvider } from './data/seed'

/* Screen ids map to the ASCII designs in docs/RND-GEOFENCE-ATTENDANCE.md §5. */
export default function App() {
  return (
    <ZoneProvider>
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/work-locations" replace />} />
        <Route path="/work-locations" element={<ZoneList />} />
        <Route path="/work-locations/add" element={<ZoneForm />} />
        <Route path="/work-locations/:id/edit" element={<ZoneForm />} />
        <Route path="/operational-config" element={<OperationalConfig />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/attendance/ar-requests" element={<Requests />} />
        <Route path="/reports/site-visit" element={<SiteReport />} />
        <Route path="/simulator" element={<Placeholder id="SIM" title="Edge-case simulator" />} />
        <Route path="*" element={<Placeholder id="—" title="Not built yet" />} />
      </Routes>
    </AppShell>
    </ZoneProvider>
  )
}
