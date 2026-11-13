// iPhone web apps cannot vibrate, so reminders use a banner plus a double beep.
let ctx: AudioContext | undefined

// iOS only allows audio after a user gesture, so call this synchronously inside a tap handler.
export function unlockAudio() {
  try {
    ctx ??= new AudioContext()
    void ctx.resume()
  } catch { /* no audio available: the banner still shows */ }
}

export function beep() {
  if (!ctx) return
  for (const t of [0, 0.18]) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.frequency.value = 880
    g.gain.value = 0.08
    o.connect(g)
    g.connect(ctx.destination)
    o.start(ctx.currentTime + t)
    o.stop(ctx.currentTime + t + 0.09)
  }
}
