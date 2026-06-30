import { useCallback, useSyncExternalStore } from 'react'
import type { Participant } from 'twilio-video'

// Twilio reports network quality as 0 (worst) to 5 (best), or null before the
// first measurement. Works for the local participant and remote participants.
export function useNetworkLevel(
  participant: Participant,
): number | null {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      participant.on('networkQualityLevelChanged', onStoreChange)
      return () => {
        participant.removeListener('networkQualityLevelChanged', onStoreChange)
      }
    },
    [participant],
  )

  const getSnapshot = useCallback(
    () => participant.networkQualityLevel ?? null,
    [participant],
  )

  return useSyncExternalStore(subscribe, getSnapshot)
}
