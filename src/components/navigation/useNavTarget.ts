import { useLocation, useNavigate } from 'react-router-dom'
import { scrollToTarget } from '@/lib/scroll'
import type { NavItem } from '@/types'

export function useNavTarget() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return (item: NavItem) => {
    if (item.section) {
      const id = item.section
      if (pathname === '/') { history.replaceState(null, '', `/#${id}`); scrollToTarget(`#${id}`) }
      else navigate(`/#${id}`)
    } else navigate(item.to)
  }
}

export const hrefFor = (item: NavItem) => (item.section ? `/#${item.section}` : item.to)
