import Logo from '@/assets/logo.svg'
import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

type Theme = 'light' | 'dark'
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'

const MENUS = [
  { label: 'Fleets', path: '/fleets' },
  { label: 'Agents', path: '/agents' },
  { label: 'Connectors', path: '/connectors' },
]
export default function MainLayout() {
  const [theme, setTheme] = useState<Theme>(LIGHT_THEME)

  useEffect(() => {
    // 초기 테마 설정
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div>
      <div className="p-2 flex justify-between items-center backdrop-blur-xl fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <div className="dropdown dropdown-start sm:hidden">
            <div
              tabIndex={0}
              role="button"
              className="p-2 btn btn-sm btn-ghost"
            >
              <Bars3Icon className="h-5 w-5" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-md dropdown-content mt-3 z-[1] gap-2 shadow bg-base-100 rounded-box w-52"
            >
              {MENUS.map((menu) => (
                <li key={menu.path}>
                  <Link to={menu.path}>{menu.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm px-2 font-bold hover:text-primary transition-colors"
          >
            <img src={Logo} className="logo h-6" alt="AgentFleet Logo" />
            AgentFleet
          </Link>
          <ul className="menu menu-horizontal gap-1 hidden sm:flex p-0">
            {MENUS.map((menu) => (
              <li key={menu.path}>
                <Link to={menu.path}>{menu.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-ghost btn-circle"
            onClick={toggleTheme}
          >
            {theme === LIGHT_THEME ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <main className="pt-14 px-4">{<Outlet />}</main>
    </div>
  )
}
