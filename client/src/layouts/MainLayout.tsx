import Logo from '@/assets/logo.svg'
import { Button } from '@/components/ui/button'
import { Moon, Sun } from 'lucide-react'
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
      document.documentElement.setAttribute('class', savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === LIGHT_THEME ? DARK_THEME : LIGHT_THEME
    setTheme(newTheme)
    document.documentElement.setAttribute('class', newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <div>
      <div className="p-2 border-b flex justify-between items-center backdrop-blur fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-5">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm px-2 font-bold hover:text-primary transition-colors"
          >
            AgentFleet
          </Link>
          <div className="flex gap-5">
            {MENUS.map((menu) => (
              <Link key={menu.path} to={menu.path} className="text-sm">
                {menu.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer"
            onClick={toggleTheme}
          >
            {theme === LIGHT_THEME ? <Moon /> : <Sun />}
          </Button>
        </div>
      </div>

      <main className="pt-16 px-4">{<Outlet />}</main>
    </div>
  )
}
