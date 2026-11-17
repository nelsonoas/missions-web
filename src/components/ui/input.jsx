import { cn } from '@/lib/utils'

function Input({ className, type, ...props }) {
  return <input type={type} data-slot="input"
    className={cn('placeholder:text-muted-foreground flex h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]', className)}
    {...props} />
}

export { Input }
