import Logo from '@/assets/logo.svg'
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <main className="pt-16 px-4">{<Outlet />}</main>
    </div>
  )
}
