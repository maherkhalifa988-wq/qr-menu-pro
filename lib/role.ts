// lib/role.ts
export type Role = 'admin' | 'editor'

const ROLE_KEY = 'qrmenu_role'

export function setStoredRole(role: Role) {
  try { localStorage.setItem(ROLE_KEY, role) } catch {}
}

export function clearStoredRole() {
  try { localStorage.removeItem(ROLE_KEY) } catch {}
}

export function getStoredRole(): Role | null {
  try {
    const v = localStorage.getItem(ROLE_KEY)
    return (v === 'admin' || v === 'editor') ? v : null
  } catch {
    return null
  }
}
