import { Link } from 'react-router-dom'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="text-sm breadcrumbs">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            {item.path ? (
              <Link
                to={item.path}
                className="text-primary hover:text-primary-focus"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-base-content/70">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
