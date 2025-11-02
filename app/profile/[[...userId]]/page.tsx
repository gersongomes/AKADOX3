import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { AchievementGrid } from "@/components/profile/achievement-grid"
import { RecentActivity } from "@/components/profile/recent-activity"
import { UserFiles } from "@/components/profile/user-files"
import { FollowSection } from "@/components/profile/follow-section"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getUserProfile } from "@/lib/actions/profile"
import { getUserFiles } from "@/lib/actions/profile"
import { redirect } from "next/navigation"

export default async function ProfilePage({ params }: { params: { userId?: string[] } }) {
  const userId = params.userId?.[0]
  const result = await getUserProfile(userId)

  if (result.error) {
    redirect("/login")
  }

  const { profile, isOwnProfile } = result

  const filesResult = await getUserFiles(profile.id)
  const userFiles = filesResult.success ? filesResult.files : []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <Logo size="sm" />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/browse">Explorar</Link>
              </Button>
              <Button asChild>
                <Link href="/upload">Carregar</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile Content */}
          <div className="lg:col-span-2 space-y-8">
            <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
            <ProfileStats userId={profile.id} />
            <AchievementGrid userId={profile.id} />
            <UserFiles userId={profile.id} isOwnProfile={isOwnProfile} files={userFiles} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <FollowSection userId={profile.id} isOwnProfile={isOwnProfile} />
            <RecentActivity userId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
