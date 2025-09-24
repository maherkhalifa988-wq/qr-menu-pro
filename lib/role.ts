'use client'

const KEY = 'qrmenu_role'

export function setStoredRole(role: 'admin' | 'editor') {
  try { localStorage.setItem(KEY, role) } catch {}
}

export function getStoredRole(): 'admin' | 'editor' | null {
  try {
    const r = localStorage.getItem(KEY)
    if (r === 'admin' || r === 'editor') return r
    return null
  } catch { return null }
}

export function clearStoredRole() {
  try { localStorage.removeItem(KEY) } catch {}
}
