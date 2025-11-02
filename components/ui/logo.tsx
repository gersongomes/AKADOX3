import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  className?: string
  href?: string
  textClassName?: string
}

const sizeConfig = {
  sm: { image: 24, text: "text-lg" },
  md: { image: 32, text: "text-xl" },
  lg: { image: 40, text: "text-2xl" },
  xl: { image: 48, text: "text-3xl" },
}

export function Logo({ size = "md", showText = true, className, href = "/", textClassName }: LogoProps) {
  const config = sizeConfig[size]

  const logoContent = (
    <div className={cn("flex items-center gap-3", className)}>
      <Image src="/akadox-logo.png" alt="Akadox" width={config.image} height={config.image} className="akadox-glow" />
      {showText && <span className={cn("font-serif font-black akadox-text", config.text, textClassName)}>Akadox</span>}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

export default Logo
