import Logo from '@/assets/logo.svg'
import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function MainLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // 초기 테마 설정
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div>
      <div className="flex justify-between items-center bg-base-100/80 backdrop-blur-xl px-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm px-2 font-bold hover:text-primary transition-colors"
          >
            <img src={Logo} className="logo h-6" alt="AgentFleet Logo" />
            AgentFleet
          </Link>
          <ul className="menu menu-horizontal gap-1 hidden sm:flex">
            <li>
              <Link to="/fleets">Fleets</Link>
            </li>
            <li>
              <Link to="/agents">Agents</Link>
            </li>
            <li>
              <Link to="/connectors">Connectors</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
          <div className="dropdown dropdown-start sm:hidden">
            <div tabIndex={0} role="button" className="btn btn btn-ghost">
              <Bars3Icon className="h-5 w-5" />
            </div>
            <ul
              tabIndex={0}
              className="menu menu-md dropdown-content mt-3 z-[1] gap-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to="/fleets">Fleets</Link>
              </li>
              <li>
                <Link to="/agents">Agents</Link>
              </li>
              <li>
                <Link to="/connectors">Connectors</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-sm btn-ghost btn-circle"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <main className="pt-16 px-4">{<Outlet />}</main>
    </div>
  )
}
