"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThumbsUp, ThumbsDown, Reply, Send } from "lucide-react"
import { getComments, addComment, voteComment } from "@/lib/actions/comments"
import { useToast } from "@/hooks/use-toast"

interface CommentsSectionProps {
  fileId: string
}

export function CommentsSection({ fileId }: CommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [loading, setLoading] = useState(true)
  const [userVotes, setUserVotes] = useState<Record<string, "like" | "dislike" | null>>({})
  const { toast } = useToast()

  useEffect(() => {
    loadComments()
  }, [fileId])

  async function loadComments() {
    setLoading(true)
    const data = await getComments(fileId)
    setComments(data)
    setLoading(false)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    const result = await addComment(fileId, newComment)

    if (!result.success) {
      toast({
        title: "Erro",
        description: result.error || "Erro ao adicionar comentário",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Sucesso",
      description: "Comentário adicionado com sucesso",
    })

    setNewComment("")
    loadComments()
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return

    const result = await addComment(fileId, replyText, parentId)

    if (!result.success) {
      toast({
        title: "Erro",
        description: result.error || "Erro ao adicionar resposta",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Sucesso",
      description: "Resposta adicionada com sucesso",
    })

    setReplyText("")
    setReplyingTo(null)
    loadComments()
  }

  const handleVote = async (commentId: string, voteType: "like" | "dislike") => {
    const previousVote = userVotes[commentId] || null
    const newVote = previousVote === voteType ? null : voteType

    // Optimistic update
    setUserVotes((prev) => ({ ...prev, [commentId]: newVote }))

    const result = await voteComment(commentId, voteType, previousVote)

    if (!result.success) {
      // Revert on error
      setUserVotes((prev) => ({ ...prev, [commentId]: previousVote }))
      toast({
        title: "Erro",
        description: result.error || "Erro ao votar",
        variant: "destructive",
      })
      return
    }

    loadComments()
  }

  // Organize comments into threads
  const topLevelComments = comments.filter((c) => !c.comentario_pai_id)
  const getReplies = (parentId: string) => comments.filter((c) => c.comentario_pai_id === parentId)

  const sortedComments = [...topLevelComments].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (loading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Comentários</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">A carregar comentários...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg">Comentários ({comments.length})</CardTitle>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mais recentes</SelectItem>
              <SelectItem value="popular">Mais populares</SelectItem>
              <SelectItem value="oldest">Mais antigos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-sm">UC</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Partilha a tua opinião sobre este recurso..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
              <Send className="w-4 h-4 mr-2" />
              Comentar
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {sortedComments.map((comment) => {
            const replies = getReplies(comment.id)
            return (
              <div key={comment.id} className="space-y-4">
                {/* Main Comment */}
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">
                      {comment.perfis_usuarios.nome_completo.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-foreground">{comment.perfis_usuarios.nome_completo}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-3 leading-relaxed">{comment.conteudo}</p>

                    {/* Comment Actions */}
                    <div className="flex items-center gap-4">
                      <button
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          userVotes[comment.id] === "like"
                            ? "text-secondary"
                            : "text-muted-foreground hover:text-secondary"
                        }`}
                        onClick={() => handleVote(comment.id, "like")}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        {comment.likes}
                      </button>
                      <button
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          userVotes[comment.id] === "dislike"
                            ? "text-destructive"
                            : "text-muted-foreground hover:text-destructive"
                        }`}
                        onClick={() => handleVote(comment.id, "dislike")}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        {comment.dislikes > 0 ? comment.dislikes : ""}
                      </button>
                      <button
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="w-4 h-4" />
                        Responder
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-11 space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">UC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder={`Responder a ${comment.perfis_usuarios.nome_completo}...`}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                        Cancelar
                      </Button>
                      <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyText.trim()}>
                        Responder
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-11 space-y-4">
                    {replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {reply.perfis_usuarios.nome_completo.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground text-sm">
                              {reply.perfis_usuarios.nome_completo}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleDateString("pt-PT")}
                            </span>
                          </div>
                          <p className="text-sm text-foreground mb-2 leading-relaxed">{reply.conteudo}</p>
                          <div className="flex items-center gap-3">
                            <button
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                userVotes[reply.id] === "like"
                                  ? "text-secondary"
                                  : "text-muted-foreground hover:text-secondary"
                              }`}
                              onClick={() => handleVote(reply.id, "like")}
                            >
                              <ThumbsUp className="w-3 h-3" />
                              {reply.likes}
                            </button>
                            <button
                              className={`flex items-center gap-1 text-xs transition-colors ${
                                userVotes[reply.id] === "dislike"
                                  ? "text-destructive"
                                  : "text-muted-foreground hover:text-destructive"
                              }`}
                              onClick={() => handleVote(reply.id, "dislike")}
                            >
                              <ThumbsDown className="w-3 h-3" />
                              {reply.dislikes > 0 ? reply.dislikes : ""}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">Ainda não há comentários</p>
            <p className="text-sm text-muted-foreground">Sê o primeiro a partilhar a tua opinião sobre este recurso!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
