import { ChevronRight, Shirt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { aller } from '@/lib/router'

// Une mission dans une liste : horaires à gauche, client et lieu à droite
export function MissionRow({ mission, passee, className }) {
  const lieu = mission.adresse ? mission.adresse.split(' - ')[0] : ''
  return (
    <button type="button" onClick={() => aller('mission', mission.id)}
      className={cn('flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted', passee && 'opacity-45', className)}>
      <div className="w-12 shrink-0 tabular-nums">
        <div className="text-[15px] font-semibold">{mission.debut}</div>
        <div className="text-[13px] text-muted-foreground">{mission.fin}</div>
      </div>
      <div className="w-[3px] self-stretch rounded-full bg-primary" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-semibold">{mission.client}</div>
        <div className="flex items-center gap-1.5 truncate text-[13px] text-muted-foreground">
          <span className="truncate">{lieu}</span>
          {mission.tenue ? <span className="inline-flex shrink-0 items-center gap-0.5"><Shirt className="size-3" />{mission.tenue}</span> : null}
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}
