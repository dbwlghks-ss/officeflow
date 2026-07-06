import Header from '../components/layout/Header'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-800">
      <Header />
      <main className="flex items-center justify-center py-24">
        <h1 className="text-2xl font-semibold text-[#004098]">대시보드</h1>
      </main>
    </div>
  )
}
