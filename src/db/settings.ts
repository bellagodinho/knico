import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import type { UnitSystem } from '../units'

export const setSetting = (key: string, value: unknown) => db.settings.put({ key, value })

// useLiveQuery re-runs when the data changes, so the UI always reflects the database.
export function useUnits(): [UnitSystem, (u: UnitSystem) => void] {
  const row = useLiveQuery(() => db.settings.get('units'), [])
  const units = (row?.value as UnitSystem | undefined) ?? 'metric'
  return [units, (u) => void setSetting('units', u)]
}
