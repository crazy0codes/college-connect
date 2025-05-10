import { Socket, DefaultEventsMap } from "socket.io";

// Define the socket type for clients in the queue
export type ClientSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

class Queue {
  private queue: ClientSocket[] = [];

  push(client: ClientSocket): void {
    if (!this.queue.includes(client) && !client.data.inCall && !client.disconnected) {
      this.queue.push(client);
    }
  }

  pairClients(): { offer: ClientSocket; answer: ClientSocket } | null {
    while (this.queue.length >= 2) {
      const offer = this.queue.shift()!;
      const answer = this.queue.shift()!;

      if (
        offer.disconnected ||
        answer.disconnected ||
        offer.data.inCall ||
        answer.data.inCall
      ) {
        continue;
      }

      offer.data.inCall = true;
      answer.data.inCall = true;

      return { offer, answer };
    }
    return null;
  }

  removeClient(client: ClientSocket): void {
    this.queue = this.queue.filter(c => c !== client);
  }

  size(): number {
    return this.queue.length;
  }

  print(): void {
    this.queue.forEach(c => console.log(c.id));
  }
}

// Export a singleton queue instance
const queueInstance = new Queue();
export default queueInstance;
