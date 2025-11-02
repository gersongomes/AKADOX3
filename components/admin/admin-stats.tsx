import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, MessageSquare, TrendingUp } from "lucide-react"

export function AdminStats() {
  const stats = [
    {
      title: "Total de Utilizadores",
      value: "2,847",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Ficheiros Carregados",
      value: "15,234",
      change: "+8%",
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Comentários",
      value: "8,921",
      change: "+15%",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      title: "Downloads",
      value: "45,678",
      change: "+23%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <p className="text-xs text-green-600 mt-1">{stat.change} desde o mês passado</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
