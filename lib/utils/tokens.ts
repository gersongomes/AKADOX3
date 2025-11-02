export function generateApprovalToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64")
}

export function verifyApprovalToken(token: string, userId: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString()
    const [tokenUserId, timestamp] = decoded.split(":")

    // Token is valid if user ID matches and it's not older than 7 days
    const isValidUser = tokenUserId === userId
    const isNotExpired = Date.now() - Number.parseInt(timestamp) < 7 * 24 * 60 * 60 * 1000

    return isValidUser && isNotExpired
  } catch {
    return false
  }
}
