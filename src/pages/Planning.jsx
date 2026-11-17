import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDonnees } from '@/lib/store'
import { MOIS, bornesMois, cleJour, duree, finDe, libelleJour, minutesPayees, seulementMissions } from '@/lib/data'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EnTete, Page } from '@/components/Layout'
import { MissionRow } from '@/components/MissionRow'
import { cn } from '@/lib/utils'

const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1)

export default function Planning() {
  const { entrees } = useDonnees()
  const auj = new Date()
  const [mois, setMois] = useState(() => new Date(auj.getFullYear(), auj.getMonth(), 1))
  const refAujourdhui = useRef(null)

  const prefixe = `${mois.getFullYear()}-${String(mois.getMonth() + 1).padStart(2, '0')}`
  const jours = useMemo(() => {
    const parJour = {}
    seulementMissions(entrees).filter((e) => e.jour.startsWith(prefixe))
      .forEach((e) => { (parJour[e.jour] ||= []).push(e) })
    return Object.entries(parJour).sort(([a], [b]) => a.localeCompare(b))
  }, [entrees, prefixe])

  const [du, au] = bornesMois(mois.getFullYear(), mois.getMonth())
  const total = minutesPayees(entrees, du, au)
  const nbMissions = jours.reduce((n, [, l]) => n + l.length, 0)
  const aujourdhui = cleJour(auj)
  // Premier jour à venir : la liste défile jusqu'à lui à l'ouverture
  const prochainJour = jours.find(([j]) => j >= aujourdhui)?.[0]

  useEffect(() => {
    refAujourdhui.current?.scrollIntoView({ block: 'center' })
  }, [prefixe])

  const changer = (pas) => setMois(new Date(mois.getFullYear(), mois.getMonth() + pas, 1))

  return (
    <>
      <EnTete titre={`${majuscule(MOIS[mois.getMonth()])} ${mois.getFullYear()}`}
        sousTitre={`${nbMissions} mission${nbMissions > 1 ? 's' : ''} · ${duree(total)}`}
        droite={
          <div className="flex gap-1">
            <Button variant="secondary" size="icon" onClick={() => changer(-1)} aria-label="Mois précédent"><ChevronLeft /></Button>
            <Button variant="secondary" size="icon" onClick={() => changer(1)} aria-label="Mois suivant"><ChevronRight /></Button>
          </div>
        } />
      <Page className="gap-2">
        {jours.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground">Aucune mission ce mois-ci.</p>
        ) : jours.map(([jour, missions]) => (
          <section key={jour} ref={jour === prochainJour ? refAujourdhui : undefined} className="scroll-mt-32">
            <h2 className={cn('mb-1.5 mt-3 px-1 text-[13px] font-semibold',
              jour === aujourdhui ? 'text-primary' : 'text-muted-foreground')}>
              {libelleJour(jour, true)}
            </h2>
            <Card className="gap-0 divide-y overflow-hidden py-0">
              {missions.map((m) => <MissionRow key={m.id} mission={m} passee={finDe(m) < auj} />)}
            </Card>
          </section>
        ))}
      </Page>
    </>
  )
}
