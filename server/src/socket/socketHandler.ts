import * as socketio from "socket.io";
import dotenv from "dotenv";
dotenv.config();
import Queue from "../lib/queue";
import { getProfile, getUserRooms } from "../service/user";

export const setUpSocket = function (io: socketio.Server) {

  io.on("connection", (socket: socketio.Socket) => {
    
    setInterval(() => {
      console.log(Queue.size());
    }, 5000);
    
    console.log("A user connected:", socket.id);

    socket.on("fresh-connection", async (user) => {
      if (user.email && user.token) {
        console.log(`${user.email} fetching profile....`);

        getProfile({ user })
          .then((profile) => {
            socket.emit("fetched-pfp", profile);
          })
          .catch((err) => {
            console.error(`Error fetching profile for ${user.email}:`, err);
            socket.emit("error", "Error fetching profile");
          });

        console.log(`${user.email} connected ✅`);
      } else {
        console.error(
          "No valid email or token provided in fresh-connection event."
        );
      }
    });

    socket.on("user-rooms", async (user) => {
      console.log(`${user.email} fetching rooms....`);

      if (user.email && user.token) {
        getUserRooms({ user })
          .then((rooms) => {
            socket.emit("fetched rooms", rooms);
            console.log(`${user.email} rooms fetched ✅`);
          })
          .catch((err) => {
            console.error(`Error fetching rooms for ${user.email}:`, err);
            socket.emit("error", "Error fetching rooms");
          });
      } else {
        console.error("No valid email or token provided in user-rooms event.");
      }
    });

    /* <---- WebRTC Connection Logic ----> */

    socket.on("start-call", () => {
      console.log(socket.id, "initiating call...");
      if (Queue.size() < 1) {
        Queue.push(socket);
        socket.emit("waiting");
      } else {
        const pair = Queue.pairClients();
        if (!pair) {
          Queue.push(socket);
          socket.emit("waiting");
          return;
        }

        const { offer, answer } = pair;

        offer.data.otherPeer = answer;
        answer.data.otherPeer = offer;

        offer.emit("ready-to-call", { type: "offer" });
        answer.emit("ready-to-call", { type: "answer" });
      }
    });

    socket.on("ice-candidate", (candidate) => {
      console.log("ICE candidate received:", socket.id);
      const peer = socket.data.otherPeer;
      if (peer) peer.emit("ice-candidate", candidate);
    });

    socket.on("offer", (offer) => {
      console.log("Offer received:", socket.id);
      const peer = socket.data.otherPeer;
      if (peer) peer.emit("offer", offer);
    });

    socket.on("answer", (answer) => {
      console.log("Answer received:", socket.id);
      const peer = socket.data.otherPeer;
      if (peer) peer.emit("answer", answer);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      socket.data.disconnected = true;

      const peer = socket.data.otherPeer;
      if (peer) {
        peer.emit("call-ended");
        peer.data.otherPeer = null;
        peer.data.inCall = false;

        if (!peer.data.disconnected) {
          Queue.push(peer);
        }
      }

      socket.data.otherPeer = null;
      socket.data.inCall = false;

      Queue.removeClient(socket);
    });
  });
};

export default setUpSocket;
