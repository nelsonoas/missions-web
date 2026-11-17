import { useEffect, useState } from 'react'
import { CloudOff, FileText, MapPin, Navigation, RefreshCw, Shirt } from 'lucide-react'
import { useDonnees } from '@/lib/store'
import {
  bornesMois, bornesSemaine, compteARebours, debutDe, duree, finDe, libelleJour, lienItineraire, minutesPayees,
  prochaines,
} from '@/lib/data'
import { aller } from '@/lib/router'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EnTete, Page, TitreSection } from '@/components/Layout'
import { MissionRow } from '@/components/MissionRow'
import { cn } from '@/lib/utils'

function salutation(d) {
  const h = d.getHours()
  return h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'
}

export default function Accueil() {
  const { entrees, ordres, chargement, erreur, synchroniser, jeton, synchroLe } = useDonnees()
  const [maintenant, setMaintenant] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setMaintenant(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const boutonSynchro = (
    <Button variant="ghost" size="icon" onClick={synchroniser} aria-label="Synchroniser" disabled={!jeton}>
      <RefreshCw className={cn('size-5', chargement && 'animate-spin')} />
    </Button>
  )

  if (!jeton) {
    return (
      <>
        <EnTete titre="Missions" />
        <Page>
          <Card>
            <CardContent className="flex flex-col gap-3">
              <h2 className="text-xl font-semibold">Bienvenue</h2>
              <p className="text-muted-foreground">Pour afficher tes missions, ajoute ton jeton GitHub dans Réglages.</p>
              <Button onClick={() => aller('reglages')} className="mt-1">Ouvrir Réglages</Button>
            </CardContent>
          </Card>
        </Page>
      </>
    )
  }

  const aVenir = prochaines(entrees, maintenant)
  const suivante = aVenir[0]
  const enCours = suivante && debutDe(suivante) <= maintenant
  const [sDu, sAu] = bornesSemaine(maintenant)
  const [mDu, mAu] = bornesMois(maintenant.getFullYear(), maintenant.getMonth())
  const semaine = minutesPayees(entrees, sDu, sAu)
  const mois = minutesPayees(entrees, mDu, mAu)
  const ordresRecents = [...ordres].sort((a, b) => b.recu_le.localeCompare(a.recu_le)).slice(0, 3)

  return (
    <>
      <EnTete titre={salutation(maintenant)}
        sousTitre={maintenant.toLocaleDateString('fr-CH', { weekday: 'long', day: 'numeric', month: 'long' })}
        droite={boutonSynchro} />
      <Page>
        {erreur ? (
          <div className="flex items-start gap-2 rounded-lg bg-warning/12 px-4 py-3 text-sm text-warning">
            <CloudOff className="mt-0.5 size-4 shrink-0" />
            <span>{erreur} Dernières données enregistrées affichées.</span>
          </div>
        ) : null}

        <TitreSection>{enCours ? 'Mission en cours' : 'Prochaine mission'}</TitreSection>
        {suivante ? (
          <Card className="gap-0 overflow-hidden py-0">
            <button type="button" onClick={() => aller('mission', suivante.id)} className="flex flex-col gap-1 p-5 text-left active:bg-muted">
              <Badge variant={enCours ? 'warning' : 'accent'}>
                {enCours ? `Se termine ${compteARebours(finDe(suivante), maintenant)}` : compteARebours(debutDe(suivante), maintenant)}
              </Badge>
              <div className="mt-2 text-[40px] font-bold leading-none tracking-tight tabular-nums">
                {suivante.debut}<span className="text-muted-foreground"> – {suivante.fin}</span>
              </div>
              <div className="text-[15px] text-muted-foreground">{libelleJour(suivante.jour, true)}</div>
              <div className="mt-3 text-lg font-semibold leading-snug">{suivante.client}</div>
              <div className="flex items-start gap-1.5 text-[15px] text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />{suivante.adresse}
              </div>
              {suivante.tenue ? (
                <div className="flex items-center gap-1.5 text-[15px]"><Shirt className="size-4 text-muted-foreground" />Tenue {suivante.tenue}</div>
              ) : null}
            </button>
            {suivante.adresse ? (
              <div className="border-t px-5 py-3">
                <Button asChild href={lienItineraire(suivante.adresse)} target="_blank" rel="noreferrer" className="w-full">
                  <Navigation />Itinéraire
                </Button>
              </div>
            ) : null}
          </Card>
        ) : (
          <Card><CardContent className="text-muted-foreground">Aucune mission prévue pour l'instant.</CardContent></Card>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[['Cette semaine', semaine], ['Ce mois', mois]].map(([libelle, minutes]) => (
            <Card key={libelle} className="gap-1 py-4">
              <button type="button" onClick={() => aller('heures')} className="px-5 text-left">
                <div className="text-[13px] text-muted-foreground">{libelle}</div>
                <div className="text-2xl font-bold tabular-nums">{duree(minutes)}</div>
              </button>
            </Card>
          ))}
        </div>

        {aVenir.length > 1 ? (
          <>
            <TitreSection droite={<button type="button" onClick={() => aller('planning')} className="text-sm font-medium text-primary">Tout voir</button>}>
              Ensuite
            </TitreSection>
            <Card className="gap-0 divide-y overflow-hidden py-0">
              {aVenir.slice(1, 6).map((m, i, liste) => {
                const nouveauJour = i === 0 ? m.jour !== suivante.jour : m.jour !== liste[i - 1].jour
                return (
                  <div key={m.id} className={cn(!nouveauJour && 'border-t-0')}>
                    {nouveauJour ? (
                      <div className="px-4 pt-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{libelleJour(m.jour)}</div>
                    ) : null}
                    <MissionRow mission={m} className={nouveauJour ? 'pt-1.5' : ''} />
                  </div>
                )
              })}
            </Card>
          </>
        ) : null}

        {ordresRecents.length ? (
          <>
            <TitreSection>Ordres de service</TitreSection>
            <Card className="gap-0 divide-y overflow-hidden py-0">
              {ordresRecents.map((o, i) => (
                <a key={o.lien || i} href={o.lien} target="_blank" rel="noreferrer"
                  className="flex items-start gap-3 px-4 py-3 active:bg-muted">
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-[15px]">{o.sujet}</div>
                    <div className="text-[13px] text-muted-foreground">
                      Reçu le {new Date(o.recu_le).toLocaleDateString('fr-CH', { day: 'numeric', month: 'long' })}
                    </div>
                  </div>
                </a>
              ))}
            </Card>
          </>
        ) : null}

        {synchroLe ? (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Synchronisé le {new Date(synchroLe).toLocaleString('fr-CH', { dateStyle: 'short', timeStyle: 'short' })}
          </p>
        ) : null}
      </Page>
    </>
  )
}
