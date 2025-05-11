'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { AppLayout } from '@/components/app-layout';
import { Mic, MicOff, Video, VideoOff, SkipForward, Flag, Phone } from 'lucide-react';
import socket from '@/lib/socket';
import {
    createPeerConnection,
    startLocalStream,
    addLocalTracks,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    createAndSendOffer,
    cleanup,
    toggleAudio,
    toggleVideo,
} from '@/lib/webrtc';

export default function VideoCallPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSearching, setIsSearching] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [peerName, setPeerName] = useState('');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const setupConnection = async () => {
            console.log('Attempting to connect to Socket.IO server...');
            try {
                socket.connect();
                console.log('Socket connected');
            } catch (error) {
                console.error('Socket connection error:', error);
                return;
            }

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            socket.on('connect', async () => {
                console.log('Socket connected, setting up WebRTC...');
                // Emit fresh-connection if required
                if (user?.email && user?.token) {
                    socket.emit('fresh-connection', {
                        email: user.email,
                        token: user.token,
                    });
                }

                const stream = await startLocalStream();
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;

                createPeerConnection(socket, (remoteStream) => {
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
                    setIsSearching(false);
                    setIsConnected(true);
                });

                addLocalTracks();
                socket.emit('start-call');
            });

            socket.on('fetched-pfp', (profile) => {
                console.log('Received profile:', profile);
            });

            socket.on('error', (message) => {
                console.error('Socket error:', message);
            });

            socket.on('ready-to-call', async ({ type }: { type: 'offer' | 'answer' }) => {
                console.log(`Received ready-to-call event with type: ${type}`);
                if (type === 'offer') await createAndSendOffer(socket);
            });

            socket.on('offer', async (offer) => {
                console.log('Received offer:', offer);
                await handleOffer(offer, socket);
            });

            socket.on('answer', async (answer) => {
                console.log('Received answer:', answer);
                await handleAnswer(answer);
            });

            socket.on('ice-candidate', async (candidate) => {
                console.log('Received ICE candidate:', candidate);
                await handleIceCandidate(candidate);
            });

            socket.on('call-ended', () => {
                console.log('Call ended');
                cleanup();
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                setIsSearching(true);
                setIsConnected(false);
            });
        };

        setupConnection();

        return () => {
            cleanup();
            socket.disconnect();
        };
    }, [user]);

    const handleSkip = () => {
        socket.emit('skip');
        setIsConnected(false);
        setIsSearching(true);
    };

    const handleEndCall = () => {
        socket.emit('end-call');
        router.push('/chat/global');
    };

    const handleReport = () => {
        alert('User reported');
        handleSkip();
    };

    const toggleMute = () => {
        toggleAudio(isMuted);
        setIsMuted(!isMuted);
    };

    const toggleCam = () => {
        toggleVideo(isVideoOff);
        setIsVideoOff(!isVideoOff);
    };

    return (
        <AppLayout>
            <div className="flex h-full flex-col">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
                            You ({user?.displayName})
                        </div>
                    </div>
                    <div className="relative rounded-lg overflow-hidden bg-black">
                        {isSearching ? (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                <div className="mb-4">
                                    <div className="h-12 w-12 rounded-full border-4 border-t-transparent border-primary animate-spin"></div>
                                </div>
                                <p className="text-xl font-medium">Finding someone to chat with...</p>
                                <p className="text-sm text-white/70 mt-2">This may take a few moments</p>
                            </div>
                        ) : (
                            <>
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
                                    {peerName || 'Stranger'}
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="border-t p-4 flex justify-center">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleMute}
                            className={isMuted ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                        >
                            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={toggleCam}
                            className={isVideoOff ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                        >
                            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                            <span className="sr-only">{isVideoOff ? 'Turn on camera' : 'Turn off camera'}</span>
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleSkip}>
                            <SkipForward className="h-5 w-5" />
                            <span className="sr-only">Skip</span>
                        </Button>
                        <Button variant="outline" size="icon" onClick={handleReport}>
                            <Flag className="h-5 w-5" />
                            <span className="sr-only">Report</span>
                        </Button>
                        <Button variant="destructive" size="icon" onClick={handleEndCall}>
                            <Phone className="h-5 w-5" />
                            <span className="sr-only">End call</span>
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}