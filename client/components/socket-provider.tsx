import { createContext, useContext, useEffect } from "react";
import { socket } from "@/lib/socket";

const SocketContext = createContext<typeof socket | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        socket.connect();

        return () => {
            socket.disconnect(); 
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);

    if (context === undefined) {
        throw new Error("useSocket must be used within a SocketProvider");
    }

    return context;
}