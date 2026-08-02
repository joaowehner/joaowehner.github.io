import { useEffect, useState } from 'react'

/**
 * Observa as seções da página e devolve o id da que está em foco,
 * para a navegação destacar o item ativo. No hero (antes da primeira
 * seção) nenhum item fica ativo.
 */
export function useActiveSection(sectionIds: string[]): string {
  const [active, setActive] = useState<string>('')

  useEffect(() => {
    const visible = new Set<string>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        // Primeira seção visível na ordem do documento vence
        const current = sectionIds.find((id) => visible.has(id)) ?? ''
        setActive(current)
      },
      { rootMargin: '-30% 0px -55% 0px' },
    )

    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sectionIds])

  return active
}
