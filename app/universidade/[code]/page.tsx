import { BookOpen, Users, Calendar, Star, Download, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UniversityPageProps {
  params: {
    code: string
  }
}

export default function UniversityPage({ params }: UniversityPageProps) {
  const universities = {
    us: {
      name: "Universidade de Santiago",
      code: "US",
      description: "A primeira universidade pública de Cabo Verde, fundada em 2006, localizada na Cidade da Praia.",
      students: "5,200+",
      courses: 45,
      color: "from-red-500 to-orange-500",
    },
    unicv: {
      name: "Universidade de Cabo Verde",
      code: "UniCV",
      description: "Universidade pública com campus em várias ilhas, oferecendo ensino superior de qualidade.",
      students: "8,500+",
      courses: 62,
      color: "from-purple-500 to-pink-500",
    },
  }

  const university = universities[params.code as keyof typeof universities]

  if (!university) {
    return <div>Universidade não encontrada</div>
  }

  const documents = [
    {
      id: 1,
      title: "Introdução à Programação - Apontamentos",
      author: "Prof. Carlos Mendes",
      subject: "Programação",
      course: "Engenharia Informática",
      year: "2024",
      rating: 4.8,
      downloads: 156,
      views: 892,
    },
    {
      id: 2,
      title: "Física Geral - Exercícios Práticos",
      author: "Ana Rodrigues",
      subject: "Física",
      course: "Engenharia Civil",
      year: "2023",
      rating: 4.6,
      downloads: 203,
      views: 1205,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header da Universidade */}
        <div className="mb-12">
          <div className={`bg-gradient-to-r ${university.color} p-8 rounded-2xl mb-8`}>
            <h1 className="text-4xl font-bold text-white mb-4">{university.name}</h1>
            <p className="text-white/90 text-lg mb-6">{university.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Users className="w-8 h-8 text-white mb-2" />
                <p className="text-white/80 text-sm">Estudantes</p>
                <p className="text-white font-bold text-xl">{university.students}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <BookOpen className="w-8 h-8 text-white mb-2" />
                <p className="text-white/80 text-sm">Cursos</p>
                <p className="text-white font-bold text-xl">{university.courses}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Calendar className="w-8 h-8 text-white mb-2" />
                <p className="text-white/80 text-sm">Documentos</p>
                <p className="text-white font-bold text-xl">{documents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentos da Universidade */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Documentos Partilhados</h2>
          <div className="grid gap-6">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-500 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        href={`/browse/${doc.id}`}
                        className="text-xl font-semibold text-white hover:text-red-400 transition-colors mb-2 block"
                      >
                        {doc.title}
                      </Link>
                      <p className="text-gray-400 mb-4">Por {doc.author}</p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-gray-400 text-sm">Disciplina:</span>
                          <p className="text-purple-400 font-medium">{doc.subject}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Curso:</span>
                          <p className="text-orange-400 font-medium">{doc.course}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Ano:</span>
                          <p className="text-cyan-400 font-medium">{doc.year}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{doc.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{doc.downloads}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{doc.views}</span>
                        </div>
                      </div>
                    </div>

                    <Button className="bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600">
                      Ver Documento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
