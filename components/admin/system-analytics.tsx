import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users } from "lucide-react"

export function SystemAnalytics() {
  const analytics = {
    topUniversities: [
      { name: "Universidade de Cabo Verde", users: 1245, files: 5678 },
      { name: "Universidade Jean Piaget", users: 892, files: 4321 },
      { name: "Instituto Superior de Ciências Económicas", users: 567, files: 2890 },
      { name: "Instituto Superior de Engenharia", users: 143, files: 1345 },
    ],
    topSubjects: [
      { name: "Matemática", files: 2345, downloads: 12890 },
      { name: "Informática", files: 1987, downloads: 11234 },
      { name: "Economia", files: 1654, downloads: 9876 },
      { name: "História", files: 1432, downloads: 8765 },
      { name: "Português", files: 1298, downloads: 7654 },
    ],
    monthlyStats: [
      { month: "Jan", uploads: 234, downloads: 1890, users: 45 },
      { month: "Fev", uploads: 345, downloads: 2345, users: 67 },
      { month: "Mar", uploads: 456, downloads: 3456, users: 89 },
    ],
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Universities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Universidades Mais Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topUniversities.map((uni, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{uni.name}</p>
                  <p className="text-sm text-slate-600">{uni.users} utilizadores</p>
                </div>
                <Badge variant="secondary">{uni.files} ficheiros</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Disciplinas Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topSubjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{subject.name}</p>
                  <p className="text-sm text-slate-600">{subject.files} ficheiros</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{subject.downloads} downloads</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Growth */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Crescimento Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {analytics.monthlyStats.map((stat, index) => (
              <div key={index} className="text-center p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">{stat.month} 2024</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Uploads:</span>
                    <Badge variant="secondary">{stat.uploads}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Downloads:</span>
                    <Badge variant="secondary">{stat.downloads}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Novos utilizadores:</span>
                    <Badge variant="secondary">{stat.users}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
