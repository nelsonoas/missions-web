// État partagé : données, jeton, taux, synchronisation
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  enregistrerJeton, enregistrerTaux, lireCache, lireJeton, lireTaux, telechargerDonnees, toutesLesEntrees,
} from './data'

const Contexte = createContext(null)

export function DonneesProvider({ children }) {
  const [donnees, setDonnees] = useState(() => lireCache())
  const [jeton, setJeton] = useState(() => lireJeton())
  const [taux, setTaux] = useState(() => lireTaux())
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)

  const synchroniser = useCallback(async (j = jeton) => {
    if (!j) return
    setChargement(true)
    setErreur(null)
    try {
      setDonnees(await telechargerDonnees(j))
    } catch (e) {
      setErreur(e.message || 'Synchronisation impossible')
    } finally {
      setChargement(false)
    }
  }, [jeton])

  // Synchro à l'ouverture et à chaque retour sur le site (ex. réouverture depuis l'écran d'accueil)
  useEffect(() => {
    synchroniser()
    const auRetour = () => document.visibilityState === 'visible' && synchroniser()
    document.addEventListener('visibilitychange', auRetour)
    return () => document.removeEventListener('visibilitychange', auRetour)
  }, [synchroniser])

  const valeur = useMemo(() => ({
    jeton, taux, chargement, erreur,
    missions: donnees?.missions || {},
    ordres: donnees?.ordres || [],
    synchroLe: donnees?.synchroLe,
    entrees: toutesLesEntrees(donnees?.missions),
    synchroniser: () => synchroniser(),
    changerJeton: async (nouveau) => {
      enregistrerJeton(nouveau)
      setJeton(nouveau || null)
      if (nouveau) await synchroniser(nouveau)
    },
    changerTaux: (nouveau) => { enregistrerTaux(nouveau); setTaux(nouveau) },
  }), [jeton, taux, chargement, erreur, donnees, synchroniser])

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useDonnees = () => useContext(Contexte)
