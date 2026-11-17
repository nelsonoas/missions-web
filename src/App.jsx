import { useRoute } from '@/lib/router'
import { BarreOnglets } from '@/components/Layout'
import Accueil from '@/pages/Accueil'
import Planning from '@/pages/Planning'
import Mission from '@/pages/Mission'
import Heures from '@/pages/Heures'
import Reglages from '@/pages/Reglages'

const PAGES = { accueil: Accueil, planning: Planning, heures: Heures, reglages: Reglages }

export default function App() {
  const { page, param } = useRoute()
  if (page === 'mission') return <Mission id={param} />
  const Composant = PAGES[page] || Accueil
  return (
    <>
      <Composant />
      <BarreOnglets actif={PAGES[page] ? page : 'accueil'} />
    </>
  )
}
