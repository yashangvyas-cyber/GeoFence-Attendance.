import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon, Avatar } from './ui'

/* Sidebar structure COPIED from the app's own navigation config in the JS bundle,
   which carries a `section` field for every entry. The People portal groups items as
   Standalone / Employees / Organization / Configuration.

   Work Locations sits under **Configuration**, as a sibling of Shift Management and
   Leave Settings — the same shape as every other attendance-related setup screen.
   It is NOT a top-level module item. */

const NAV = [
  { label: 'Dashboard',   icon: 'layout-alt-01', to: '/dashboard' },
  { label: 'Employees',   icon: 'users-02',      flyout: [] },
  { label: 'My Team',     icon: 'user-check-01', flyout: [] },
  { label: 'Attendance',  icon: 'clock',         to: '/attendance', flyout: [
      { label: 'Self',                to: '/attendance', ours: true },
      { label: 'Attendance Requests', to: '/attendance/ar-requests', ours: true },
      { label: 'Site Visit Report',   to: '/reports/site-visit', ours: true },
  ] },
  { label: 'Leaves',      icon: 'calendar',      to: '/leaves',        add: true },
  { label: 'WFH',         icon: 'home-02',       to: '/work-from-home', add: true },
  { label: 'Asset',       icon: 'package',       to: '/asset',          add: true },
  { label: 'Skill Matrix', icon: 'dataflow-01',  to: '/skill-matrix' },
  { label: 'Organization', icon: 'building-06',  flyout: [
      { label: 'Business Units', to: '/business-unit' },
      { label: 'Departments',    to: '/department' },
      { label: 'Designations',   to: '/designation' },
      { label: 'Holidays',       to: '/holiday' },
      { label: 'Documents',      to: '/documents' },
      { label: 'Meal Planning',  to: '/meal-planning' },
      { label: 'Org Chart',      to: '/organization-chart' },
      { label: 'Org Calendar',   to: '/organization-calendar' },
      { label: 'Badges Management', to: '/badge-management/manage-badges' },
      { label: 'Meeting Rooms',  to: '/meeting-rooms' },
      { label: 'Device Information', to: '/device-information' },
  ] },
  { label: 'Config', icon: 'settings-02', flyout: [
      { label: 'Roles',              to: '/roles' },
      { label: 'Shift Management',   to: '/shift-management/shift-settings' },
      { label: 'Work Locations',     to: '/work-locations', ours: true },
      { label: 'Leave Settings',     to: '/leave-settings/leave-types' },
      { label: 'Master Data',        to: '/master-data/employee-document-types' },
      { label: 'Operational Config', to: '/operational-config', ours: true },
  ] },
  { label: 'Payroll Corner', icon: 'currency-rupee', flyout: [] },
]

function Header() {
  return (
    <header className="sticky top-0 z-[60] 2xl:h-[60px] 2xl-to-xl:h-[52px] h-[52px] border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center h-full">
        <button type="button" aria-label="All Apps"
          className="flex items-center justify-center shrink-0 h-full 2xl:w-[65px] w-[52px] cursor-pointer border-r border-gray-200 text-gray-600 hover:bg-gray-50">
          <Icon name="dots-grid" className="2xl:text-2xl text-xl" />
        </button>
        <div className="flex items-center w-full justify-between gap-4 2xl:px-6 px-4 min-w-0">
          <div className="flex items-center 2xl:gap-x-8 gap-x-5 min-w-0">
            <Link to="/work-locations" className="flex items-baseline shrink-0">
              <span className="font-bold 2xl:text-[19px] text-[17px] leading-none text-indigo-700 tracking-tight">CollabCRM</span>
              <span className="ml-2 text-gray-500 2xl:text-base 2xl-to-xl:text-sm text-sm font-normal leading-none capitalize">People</span>
            </Link>
            <span className="border-[#FF0000] bg-[#FF0000] text-white font-extrabold 2xl:h-10 2xl-to-xl:h-8 h-8 px-4 rounded-lg 2xl:text-base 2xl-to-xl:text-sm text-sm flex items-center justify-center shrink-0">
              STAGING
            </span>
          </div>
          <div className="flex items-center justify-end 2xl:gap-4 gap-3 shrink-0">
            <button aria-label="Search" className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 2xl:size-10 size-8">
              <Icon name="search-lg" className="2xl:text-lg text-base" />
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 font-semibold text-indigo-700 hover:border-indigo-300 2xl:h-10 h-8 px-3.5 2xl:text-sm text-xs">
              New <Icon name="chevron-down" className="text-base" />
            </button>
            <button aria-label="To-do" className="relative inline-flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 2xl:size-10 size-8">
              <Icon name="check-square" className="2xl:text-lg text-base" />
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-error-500" />
            </button>
            <button aria-label="Notifications" className="relative inline-flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 2xl:size-10 size-8">
              <Icon name="bell-01" className="2xl:text-lg text-base" />
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-error-500" />
            </button>
            <Avatar initials="GD" size="2xl:size-10 size-8" className="2xl:text-sm text-xxs" />
          </div>
        </div>
      </div>
    </header>
  )
}

function Sidebar() {
  const { pathname } = useLocation()
  const [hover, setHover] = useState(null)

  /* Structure COPIED from the crawled sidebar DOM (evidence/dom/attendance_self.html):
     w-[220px], items at 2xl:p-3 with gap-x-3, parents marked by a right-hand
     icon-chevron-right and opening a hover FLYOUT (not an accordion).
     Flyout contents come from the app's own nav config in the JS bundle — they are
     rendered client-side on hover and never appear in a static dump. */
  return (
    <div className="bg-indigo-700 w-[220px] duration-300 relative 2xl:min-h-[calc(100vh-60px)]
                    2xl-to-xl:min-h-[calc(100vh-52px)] min-h-[calc(100vh-52px)] shrink-0">
      <nav className="py-4">
        <ul>
          {NAV.map(n => {
            const active = n.to && pathname.startsWith(n.to)
            const childActive = n.flyout?.some(c => pathname.startsWith(c.to))
            const Inner = (
              <>
                <span className={`icon-${n.icon} h-6 w-6 shrink-0 flex items-center justify-center text-xl
                  ${active || childActive ? 'text-white' : 'text-indigo-200 group-hover:text-white'}`} />
                <p className="text-sm leading-6 font-semibold whitespace-nowrap text-white">{n.label}</p>
              </>
            )
            return (
              <li key={n.label}
                  className={`relative group cursor-pointer ${active || childActive ? 'bg-indigo-600' : 'hover:bg-indigo-600'}`}
                  onMouseEnter={() => setHover(n.flyout ? n.label : null)}
                  onMouseLeave={() => setHover(null)}>
                {n.to ? (
                  <Link to={n.to} className="flex w-full items-center gap-x-3 2xl:p-3 2xl-to-xl:p-2 p-2">{Inner}</Link>
                ) : (
                  <div className="flex w-full items-center gap-x-3 2xl:p-3 2xl-to-xl:p-2 p-2">
                    {Inner}
                    <span className="icon-chevron-right block ml-auto text-xl text-indigo-300" />
                  </div>
                )}
                {n.add && (
                  <span className="icon-plus-square absolute right-0 top-0 block text-xl 2xl:p-3 2xl-to-xl:p-2 p-2
                                   text-indigo-300 hover:text-white" />
                )}

                {n.flyout && hover === n.label && n.flyout.length > 0 && (
                  <div className="absolute left-full top-0 z-[80] ml-0 w-[232px] rounded-r-lg bg-indigo-700 py-2 shadow-custom-popup-shadow">
                    <ul>
                      {n.flyout.map(c => {
                        const on = pathname.startsWith(c.to)
                        return (
                          <li key={c.label}>
                            <Link to={c.to}
                              className={`block px-5 py-2 text-sm font-medium whitespace-nowrap
                                ${on ? 'bg-indigo-600 text-white font-semibold'
                                     : c.ours ? 'text-white hover:bg-indigo-600'
                                              : 'text-indigo-200/70 hover:bg-indigo-600 hover:text-white'}`}>
                              {c.label}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="group flex items-center py-[18px] px-8 gap-x-2 text-sm leading-6 font-medium">
        <span className="icon-chevron-left-double text-xl block text-indigo-300" />
        <p className="text-sm font-medium text-white">Collapse</p>
      </div>
    </div>
  )
}

export function Breadcrumb({ trail }) {
  return (
    <nav className="flex border-b border-gray-200 py-2 2xl:px-6 px-4 bg-white items-center">
      <ol className="flex items-center space-x-2 overflow-x-auto flex-nowrap scrollbar-hide">
        <li>
          <Link to="/work-locations" className="hover:text-gray-700 text-gray-500 flex" aria-label="Home">
            <Icon name="home-line" className="shrink-0 text-lg flex" />
          </Link>
        </li>
        {trail.map((c, i) => {
          const last = i === trail.length - 1
          return (
            <li key={i}>
              <div className="flex items-center">
                <Icon name="chevron-right" className="shrink-0 text-base text-gray-300" />
                {last || !c.to
                  ? <span className="text-indigo-700 ml-4 2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium whitespace-nowrap">{c.label}</span>
                  : <Link to={c.to} className="text-gray-600 hover:text-gray-800 ml-4 2xl:text-sm 2xl-to-xl:text-xs text-xs font-medium whitespace-nowrap">{c.label}</Link>}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default function AppShell({ children }) {
  useLocation()
  return (
    <div className="h-full">
      <Header />
      <main className="flex">
        <Sidebar />
        <div className="w-full bg-gray-100 min-w-0">{children}</div>
      </main>
    </div>
  )
}
