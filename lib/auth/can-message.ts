export interface MessagingProfile {
  role: string
  isActive: boolean
  asatidzApproved?: boolean
}

export function canMessage(sender: MessagingProfile, receiver: MessagingProfile) {
  if (!sender.isActive || !receiver.isActive) return false
  if (sender.role === 'admin' || receiver.role === 'admin') return true

  const roles = new Set([sender.role, receiver.role])
  if (!roles.has('siswa') || !roles.has('asatidz')) return false

  const asatidz = sender.role === 'asatidz' ? sender : receiver
  return asatidz.asatidzApproved === true
}
