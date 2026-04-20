"use client"

import { Heart } from "lucide-react"
import { useState, useTransition } from "react"
import { togglePinVote } from "./actions"

export function VoteButton({
  eventId,
  pinId,
  voted: initialVoted,
  count: initialCount,
}: {
  eventId: string
  pinId: string
  voted: boolean
  count: number
}) {
  const [isPending, startTransition] = useTransition()
  const [voted, setVoted] = useState(initialVoted)
  const [count, setCount] = useState(initialCount)

  function onClick() {
    const nextVoted = !voted
    setVoted(nextVoted)
    setCount((c) => Math.max(0, c + (nextVoted ? 1 : -1)))
    startTransition(() => {
      togglePinVote(eventId, pinId)
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-70 ${
        voted
          ? "bg-pink-600/20 text-pink-300 ring-1 ring-pink-500/40"
          : "bg-neutral-800/80 text-neutral-400 hover:bg-neutral-700/80 hover:text-neutral-200"
      }`}
    >
      <Heart size={13} fill={voted ? "currentColor" : "none"} />
      <span className="tabular-nums">{count}</span>
    </button>
  )
}
