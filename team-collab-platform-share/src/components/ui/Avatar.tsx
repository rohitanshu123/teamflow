import { cn, initials } from '../../lib/utils'

const COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-lime-600',
]

function colorFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

export function Avatar({ name, id, className }: { name: string; id?: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
        colorFor(id ?? name),
        'h-8 w-8',
        className,
      )}
      title={name}
    >
      {initials(name)}
    </span>
  )
}
