import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import React from 'react'
interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function BreadcrumbUI({ items }: BreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.slice(0, -1).map((item) => (
          <React.Fragment key={`${item.path}-${item.label}`}>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={item.path}
                className="text-primary hover:text-primary-focus"
              >
                {item.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </React.Fragment>
        ))}
        <BreadcrumbPage className="text-base-content/70">
          {items[items.length - 1].label}
        </BreadcrumbPage>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
