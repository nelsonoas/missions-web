import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useDonnees } from '@/lib/store'
import { MOIS, bornesMois, bornesSemaine, chf, duree, estimerSalaire, minutesPayees } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { EnTete, Page, TitreSection } from '@/components/Layout'
import { cn } from '@/lib/utils'

const majuscule = (t) => t.charAt(0).toUpperCase() + t.slice(1)
const TYPES_PAYES = ['mission', 'releve', 'ajustement']

export default function Heures() {
  const { entrees, taux } = useDonnees()
  const auj = new Date()
  const [mois, setMois] = useState(() => new Date(auj.getFullYear(), auj.getMonth(), 1))
  const [du, au] = bornesMois(mois.getFullYear(), mois.getMonth())

  const dansMois = entrees.filter((e) => TYPES_PAYES.includes(e.type))
    .filter((e) => { const d = new Date(`${e.jour}T00:00`); return d >= du && d < au })
  const normal = dansMois.reduce((s, e) => s + (e.duree_min || 0), 0)
  const majo = dansMois.reduce((s, e) => s + (e.majoration_min || 0), 0)
  const salaire = estimerSalaire(normal + majo, taux)

  // Semaines touchant le mois (lundi → dimanche)
  const semaines = []
  for (let [sDu, sAu] = bornesSemaine(du); sDu < au; [sDu, sAu] = bornesSemaine(sAu)) {
    const fin = new Date(sAu); fin.setDate(fin.getDate() - 1)
    semaines.push({ du: sDu, fin, minutes: minutesPayees(entrees, sDu, sAu), courante: auj >= sDu && auj < sAu })
  }
  const max = Math.max(60, ...semaines.map((s) => s.minutes))
  const changer = (pas) => setMois(new Date(mois.getFullYear(), mois.getMonth() + pas, 1))
  const court = (d) => `${d.getDate()}.${d.getMonth() + 1}`

  return (
    <>
      <EnTete titre="Heures" sousTitre={`${majuscule(MOIS[mois.getMonth()])} ${mois.getFullYear()}`}
        droite={
          <div className="flex gap-1">
            <Button variant="secondary" size="icon" onClick={() => changer(-1)} aria-label="Mois précédent"><ChevronLeft /></Button>
            <Button variant="secondary" size="icon" onClick={() => changer(1)} aria-label="Mois suivant"><ChevronRight /></Button>
          </div>
        } />
      <Page>
        <Card>
          <CardContent>
            <div className="text-[13px] text-muted-foreground">Heures payées</div>
            <div className="text-[40px] font-bold leading-tight tracking-tight tabular-nums">{duree(normal + majo)}</div>
            <div className="text-sm text-muted-foreground">
              {duree(normal)} normales + {duree(majo)} de majoration
            </div>
          </CardContent>
        </Card>

        <TitreSection>Par semaine</TitreSection>
        <Card className="gap-3 py-4">
          <CardContent className="flex flex-col gap-3">
            {semaines.map((s) => (
              <div key={s.du.toISOString()} className="grid grid-cols-[88px_1fr_56px] items-center gap-3">
                <div className={cn('text-[13px] tabular-nums', s.courante ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                  {court(s.du)} – {court(s.fin)}
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full rounded-full', s.courante ? 'bg-primary' : 'bg-primary/45')}
                    style={{ width: `${(s.minutes / max) * 100}%` }} />
                </div>
                <div className="text-right text-[15px] font-semibold tabular-nums">{duree(s.minutes)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <TitreSection>Salaire estimé</TitreSection>
        <Card className="gap-0 py-2">
          <CardContent className="flex flex-col">
            {[
              [`${salaire.heures.toFixed(2)} h × ${taux.toFixed(2)} CHF`, chf(salaire.base)],
              ['Part vacances 8,33 %', chf(salaire.vacances)],
              ['Brut', chf(salaire.brut), true],
              ['Déductions sociales', `− ${chf(salaire.deductions)}`],
            ].map(([libelle, valeur, fort]) => (
              <div key={libelle}>
                <div className="flex justify-between py-2.5 text-[15px]">
                  <span className={fort ? 'font-semibold' : 'text-muted-foreground'}>{libelle}</span>
                  <span className={cn('tabular-nums', fort && 'font-semibold')}>{valeur}</span>
                </div>
                <Separator />
              </div>
            ))}
            <div className="flex items-baseline justify-between pt-3 pb-1">
              <span className="font-semibold">Net estimé</span>
              <span className="text-2xl font-bold tabular-nums">{chf(salaire.net)}</span>
            </div>
          </CardContent>
        </Card>
        <p className="px-1 text-[13px] text-muted-foreground">
          Estimation à partir du planning (majoration de 10 % la nuit, le dimanche et les jours fériés).
          Les heures de formation et les corrections ultérieures n'y figurent pas : ta fiche de salaire fait foi.
        </p>
      </Page>
    </>
  )
}
