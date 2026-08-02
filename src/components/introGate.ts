// Gating da introdução: exibida uma vez por sessão.

export const INTRO_STORAGE_KEY = 'joaowehner:intro-seen'

export function shouldShowIntro({ seen }: { seen: boolean }): boolean {
  return !seen
}

export function readIntroGate(): boolean {
  try {
    return shouldShowIntro({
      seen: sessionStorage.getItem(INTRO_STORAGE_KEY) === '1',
    })
  } catch {
    return false
  }
}

export function markIntroSeen(): void {
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, '1')
  } catch {
    // sessão sem storage: apenas não persiste
  }
}
