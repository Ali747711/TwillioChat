import { LocalVideoTrack, type Room } from 'twilio-video'

export function setAudioEnabled(room: Room, enabled: boolean): void {
  room.localParticipant.audioTracks.forEach((pub) => {
    if (enabled) pub.track.enable()
    else pub.track.disable()
  })
}

export function setVideoEnabled(room: Room, enabled: boolean): void {
  room.localParticipant.videoTracks.forEach((pub) => {
    if (enabled) pub.track.enable()
    else pub.track.disable()
  })
}

export async function startScreenShare(room: Room): Promise<LocalVideoTrack> {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
  const track = new LocalVideoTrack(stream.getVideoTracks()[0], { name: 'screen' })
  await room.localParticipant.publishTrack(track)
  return track
}

export function stopScreenShare(room: Room, track: LocalVideoTrack): void {
  room.localParticipant.unpublishTrack(track)
  track.stop()
}
