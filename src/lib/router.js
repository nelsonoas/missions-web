// Navigation par l'adresse (#/planning, #/mission/<id>) : le bouton retour et le geste de retour marchent
import { useEffect, useState } from 'react'

const lireRoute = () => {
  const [page = 'accueil', param] = window.location.hash.replace(/^#\/?/, '').split('/')
  return { page: page || 'accueil', param: param ? decodeURIComponent(param) : null }
}

export function useRoute() {
  const [route, setRoute] = useState(lireRoute)
  useEffect(() => {
    const changer = () => { setRoute(lireRoute()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', changer)
    return () => window.removeEventListener('hashchange', changer)
  }, [])
  return route
}

export const aller = (page, param) => { window.location.hash = param ? `/${page}/${encodeURIComponent(param)}` : `/${page}` }
