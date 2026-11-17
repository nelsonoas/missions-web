import { useState } from 'react'
import { Check, KeyRound, RefreshCw, Share, SquarePlus } from 'lucide-react'
import { useDonnees } from '@/lib/store'
import { DEPOT } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EnTete, Page } from '@/components/Layout'
import { cn } from '@/lib/utils'

export default function Reglages() {
  const { jeton, taux, changerJeton, changerTaux, synchroniser, chargement, erreur, synchroLe } = useDonnees()
  const [saisieJeton, setSaisieJeton] = useState('')
  const [saisieTaux, setSaisieTaux] = useState(String(taux))
  const [tauxEnregistre, setTauxEnregistre] = useState(false)
  const installe = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone

  const sauverJeton = async (e) => {
    e.preventDefault()
    if (!saisieJeton.trim()) return
    await changerJeton(saisieJeton.trim())
    setSaisieJeton('')
  }

  const sauverTaux = (e) => {
    e.preventDefault()
    const n = parseFloat(saisieTaux.replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0) return
    changerTaux(n)
    setTauxEnregistre(true)
    setTimeout(() => setTauxEnregistre(false), 1500)
  }

  const supprimerJeton = () => {
    if (window.confirm("Supprimer le jeton ? Le site ne pourra plus se synchroniser.")) changerJeton(null)
  }

  return (
    <>
      <EnTete titre="Réglages" />
      <Page>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="size-4 text-primary" />Connexion GitHub</CardTitle>
            <CardDescription>
              {jeton ? 'Jeton enregistré sur ce téléphone.' : 'Aucun jeton enregistré.'} Dépôt : {DEPOT}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={sauverJeton} className="flex flex-col gap-3">
              <Label htmlFor="jeton" className="sr-only">Jeton GitHub</Label>
              <Input id="jeton" type="password" value={saisieJeton} onChange={(e) => setSaisieJeton(e.target.value)}
                placeholder={jeton ? 'Remplacer le jeton…' : 'github_pat_…'} autoCapitalize="none" autoCorrect="off" spellCheck={false} />
              <Button type="submit" disabled={!saisieJeton.trim() || chargement}>Enregistrer et synchroniser</Button>
              {jeton ? <Button type="button" variant="ghost" className="text-destructive" onClick={supprimerJeton}>Supprimer le jeton</Button> : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Synchronisation</CardTitle>
            <CardDescription className={cn(erreur && 'text-destructive')}>
              {chargement ? 'Synchronisation…' : erreur || (synchroLe
                ? `Dernière synchro : ${new Date(synchroLe).toLocaleString('fr-CH', { dateStyle: 'short', timeStyle: 'short' })}`
                : 'Jamais synchronisé')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={synchroniser} disabled={!jeton || chargement}>
              <RefreshCw className={cn(chargement && 'animate-spin')} />Synchroniser maintenant
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salaire</CardTitle>
            <CardDescription>Sert à estimer ton salaire dans l'onglet Heures.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={sauverTaux} className="flex items-end gap-2">
              <div className="flex flex-1 flex-col gap-2">
                <Label htmlFor="taux">Taux horaire brut (CHF)</Label>
                <Input id="taux" inputMode="decimal" value={saisieTaux} onChange={(e) => setSaisieTaux(e.target.value)} />
              </div>
              <Button type="submit" variant="secondary" className="h-11">
                {tauxEnregistre ? <Check /> : 'Enregistrer'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {!installe ? (
          <Card>
            <CardHeader>
              <CardTitle>Installer sur l'iPhone</CardTitle>
              <CardDescription>Pour ouvrir le site comme une app, en plein écran.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col gap-2 text-[15px]">
                <li className="flex items-center gap-2">1. Touche <Share className="size-4 text-primary" /> Partager dans Safari</li>
                <li className="flex items-center gap-2">2. Choisis <SquarePlus className="size-4 text-primary" /> Sur l'écran d'accueil</li>
                <li>3. Touche Ajouter</li>
              </ol>
            </CardContent>
          </Card>
        ) : null}
      </Page>
    </>
  )
}
