import { ReactNode } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen bg-tavern-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}