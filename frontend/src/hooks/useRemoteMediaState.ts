import { useCallback, useSyncExternalStore } from 'react'
import type { RemoteParticipant } from 'twilio-video'

export interface RemoteMediaState {
  audioEnabled: boolean
  videoEnabled: boolean
}

// True when the participant currently publishes an enabled track of that kind.
function kindEnabled(participant: RemoteParticipant, kind: 'audio' | 'video'): boolean {
  const publications =
    kind === 'audio' ? participant.audioTracks : participant.videoTracks
  let enabled = false
  publications.forEach((pub) => {
    if (pub.isTrackEnabled) enabled = true
  })
  return enabled
}

export function useRemoteMediaState(participant: RemoteParticipant): RemoteMediaState {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      participant.on('trackEnabled', onStoreChange)
      participant.on('trackDisabled', onStoreChange)
      participant.on('trackSubscribed', onStoreChange)
      participant.on('trackUnsubscribed', onStoreChange)
      return () => {
        participant.removeListener('trackEnabled', onStoreChange)
        participant.removeListener('trackDisabled', onStoreChange)
        participant.removeListener('trackSubscribed', onStoreChange)
        participant.removeListener('trackUnsubscribed', onStoreChange)
      }
    },
    [participant],
  )

  const audioEnabled = useSyncExternalStore(subscribe, () =>
    kindEnabled(participant, 'audio'),
  )
  const videoEnabled = useSyncExternalStore(subscribe, () =>
    kindEnabled(participant, 'video'),
  )

  return { audioEnabled, videoEnabled }
}
