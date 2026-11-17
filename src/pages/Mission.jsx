import { CalendarDays, ChevronLeft, Clock3, ClipboardList, ExternalLink, FileText, MapPin, Navigation, Phone, Shirt } from 'lucide-react'
import { useDonnees } from '@/lib/store'
import { duree, libelleJour, lienItineraire, lienPdf, ordresPourMission } from '@/lib/data'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Page, TitreSection } from '@/components/Layout'

function Ligne({ icone: Icone, libelle, children, href }) {
  const contenu = (
    <>
      <Icone className="mt-0.5 size-5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] text-muted-foreground">{libelle}</div>
        <div className="text-[15px] leading-snug">{children}</div>
      </div>
      {href ? <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground" /> : null}
    </>
  )
  return href
    ? <a href={href} target="_blank" rel="noreferrer" className="flex items-start gap-3 px-4 py-3 active:bg-muted">{contenu}</a>
    : <div className="flex items-start gap-3 px-4 py-3">{contenu}</div>
}

export default function Mission({ id }) {
  const { entrees, missions, ordres } = useDonnees()
  const mission = entrees.find((e) => e.id === id)
  const retour = () => (window.history.length > 1 ? window.history.back() : (window.location.hash = '/planning'))

  const barre = (
    <header className="pt-safe sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto max-w-md px-2 pb-2">
        <Button variant="ghost" onClick={retour} className="px-2 text-primary hover:bg-transparent"><ChevronLeft className="size-5" />Retour</Button>
      </div>
    </header>
  )

  if (!mission) {
    return <>{barre}<Page><p className="mt-16 text-center text-muted-foreground">Mission introuvable. Elle a peut-être été retirée du planning.</p></Page></>
  }

  const pdf = Object.values(missions).find((p) => p.periode === mission.periode)?.pdf
  const ordresLies = ordresPourMission(mission, ordres)

  return (
    <>
      {barre}
      <Page>
        <div className="px-1">
          <div className="text-[15px] text-muted-foreground">{libelleJour(mission.jour, true)}</div>
          <div className="text-[40px] font-bold leading-tight tracking-tight tabular-nums">{mission.debut} – {mission.fin}</div>
          <h1 className="text-xl font-semibold leading-snug">{mission.client}</h1>
        </div>

        {mission.adresse ? (
          <Button asChild size="lg" href={lienItineraire(mission.adresse)} target="_blank" rel="noreferrer" className="mt-2 w-full">
            <Navigation />Itinéraire
          </Button>
        ) : null}

        <TitreSection>Détails</TitreSection>
        <Card className="gap-0 divide-y overflow-hidden py-0">
          {mission.adresse ? <Ligne icone={MapPin} libelle="Adresse" href={lienItineraire(mission.adresse)}>{mission.adresse}</Ligne> : null}
          <Ligne icone={Clock3} libelle="Durée">
            {duree(mission.duree_min)}{mission.majoration_min ? ` + ${duree(mission.majoration_min)} de majoration` : ''}
          </Ligne>
          {mission.tenue ? <Ligne icone={Shirt} libelle="Tenue">Tenue {mission.tenue}</Ligne> : null}
          {mission.code || mission.description ? (
            <Ligne icone={ClipboardList} libelle="Poste">{[mission.code, mission.description].filter(Boolean).join(' → ')}</Ligne>
          ) : null}
          <Ligne icone={Phone} libelle="SOC">{mission.soc ? 'Mission marquée SOC sur le planning' : 'Pas de mention SOC'}</Ligne>
        </Card>

        <TitreSection>Documents</TitreSection>
        <Card className="gap-0 divide-y overflow-hidden py-0">
          {ordresLies.map((o, i) => (
            <Ligne key={o.lien || i} icone={FileText} libelle="Ordre de service (e-mail)" href={o.lien}>{o.sujet}</Ligne>
          ))}
          {pdf ? <Ligne icone={CalendarDays} libelle="Planning du mois" href={lienPdf(pdf)}>Ouvrir le PDF sur GitHub</Ligne> : null}
        </Card>
        {!ordresLies.length ? <p className="px-1 text-[13px] text-muted-foreground">Aucun ordre de service trouvé pour cette mission.</p> : null}
      </Page>
    </>
  )
}
