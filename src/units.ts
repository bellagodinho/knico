export type UnitSystem = 'metric' | 'imperial'

const YD_PER_M = 1.09361
const OZ_PER_G = 0.035274

// US needle sizes by millimetre (a common chart; brands differ slightly).
const NEEDLES: Record<number, string> = {
  2: '0', 2.25: '1', 2.5: '1.5', 2.75: '2', 3: '2.5', 3.25: '3', 3.5: '4', 3.75: '5',
  4: '6', 4.5: '7', 5: '8', 5.5: '9', 6: '10', 6.5: '10.5', 8: '11', 9: '13', 10: '15',
}

// Rule: data is stored in metric. Conversion happens only at the edges (display and input).
export const toMeters = (v: number, s: UnitSystem) => (s === 'metric' ? v : v / YD_PER_M)
export const toGrams = (v: number, s: UnitSystem) => (s === 'metric' ? v : v / OZ_PER_G)

export const formatLength = (m: number, s: UnitSystem) =>
  s === 'metric' ? `${Math.round(m)} m` : `${Math.round(m * YD_PER_M)} yd`

export const formatWeight = (g: number, s: UnitSystem) =>
  s === 'metric' ? `${Math.round(g)} g` : `${(g * OZ_PER_G).toFixed(1)} oz`

export function formatNeedle(mm: number, s: UnitSystem) {
  const us = NEEDLES[mm]
  return s === 'imperial' && us ? `US ${us} (${mm} mm)` : `${mm} mm`
}
