import { CalendarDays, Clock3, House, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { aller } from '@/lib/router'

const ONGLETS = [
  { page: 'accueil', libelle: 'Accueil', Icone: House },
  { page: 'planning', libelle: 'Planning', Icone: CalendarDays },
  { page: 'heures', libelle: 'Heures', Icone: Clock3 },
  { page: 'reglages', libelle: 'Réglages', Icone: Settings },
]

export function EnTete({ titre, sousTitre, gauche, droite }) {
  return (
    <header className="pt-safe sticky top-0 z-10 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-end justify-between gap-3 px-5 pb-3 pt-2">
        <div className="min-w-0">
          {gauche}
          <h1 className="truncate text-[28px] font-bold leading-tight tracking-tight">{titre}</h1>
          {sousTitre ? <p className="text-sm text-muted-foreground">{sousTitre}</p> : null}
        </div>
        {droite}
      </div>
    </header>
  )
}

export function Page({ children, className }) {
  return <main className={cn('mx-auto flex max-w-md flex-col gap-3 px-4 pb-28 pt-4', className)}>{children}</main>
}

export function TitreSection({ children, droite }) {
  return (
    <div className="mt-3 flex items-end justify-between px-1">
      <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>
      {droite}
    </div>
  )
}

export function BarreOnglets({ actif }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/85 backdrop-blur-xl">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {ONGLETS.map(({ page, libelle, Icone }) => {
          const estActif = actif === page
          return (
            <li key={page}>
              <button type="button" onClick={() => aller(page)} aria-current={estActif ? 'page' : undefined}
                className={cn('flex w-full flex-col items-center gap-0.5 pb-1 pt-2 text-[11px] font-medium transition-colors',
                  estActif ? 'text-primary' : 'text-muted-foreground')}>
                <Icone className="size-6" strokeWidth={estActif ? 2.2 : 1.8} />
                {libelle}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
