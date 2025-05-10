let peerConnection: RTCPeerConnection | null = null
let localStream: MediaStream | null = null
let remoteStream: MediaStream | null = null

type OnRemoteStream = (stream: MediaStream) => void

const createPeerConnection = (
  socket: any,
  onRemoteStream: OnRemoteStream
): RTCPeerConnection => {
  peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  })

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice-candidate", event.candidate)
    }
  }

  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0]
    onRemoteStream(remoteStream)
  }

  return peerConnection
}

const startLocalStream = async (): Promise<MediaStream> => {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  })
  return localStream
}

const addLocalTracks = (): void => {
  if (!peerConnection || !localStream) return
  localStream.getTracks().forEach((track) =>
    peerConnection!.addTrack(track, localStream!)
  )
}

const handleOffer = async (
  offer: RTCSessionDescriptionInit,
  socket: any
): Promise<void> => {
  if (!peerConnection) return
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)
  socket.emit("answer", answer)
}

const handleAnswer = async (
  answer: RTCSessionDescriptionInit
): Promise<void> => {
  if (!peerConnection) return
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
}

const handleIceCandidate = async (candidate: RTCIceCandidateInit): Promise<void> => {
  if (!peerConnection) return
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
}

const createAndSendOffer = async (socket: any): Promise<void> => {
  if (!peerConnection) return
  const offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)
  socket.emit("offer", offer)
}

const cleanup = (): void => {
  peerConnection?.close()
  peerConnection = null

  localStream?.getTracks().forEach((track) => track.stop())
  localStream = null
  remoteStream = null
}

const toggleAudio = (enabled: boolean) => {
  if (!localStream) return
  localStream.getAudioTracks().forEach((track) => {
    track.enabled = enabled
  })
}

const toggleVideo = (enabled: boolean) => {
  if (!localStream) return
  localStream.getVideoTracks().forEach((track) => {
    track.enabled = enabled
  })
}

export {
  createPeerConnection,
  startLocalStream,
  addLocalTracks,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  createAndSendOffer,
  toggleAudio,
  toggleVideo,
  cleanup,
}
