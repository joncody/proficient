# `proficient.js` – Signaling-Agnostic WebRTC

A powerful, event-driven wrapper for WebRTC peer-to-peer connections.

**proficient.js** abstracts the complexity of `RTCPeerConnection`, ICE candidates, and Data Channels. It is **signaling agnostic**, meaning it does not handle the server communication (WebSocket, Socket.io, Firebase, etc.). Instead, it provides simple hooks (`gotOffer`, `gotAnswer`) to feed data in, and events (`local-description`, `candidate`) to send data out.

---

## ✅ Features

- 📹 **Unified API:** Simple methods for Video/Audio calls and Data chats.
- 🔌 **Signaling Agnostic:** Works with *any* backend (Socket.io, WebSocket, Firebase, etc.).
- 🫧 **Event Bubbling:** Connection events bubble up to the main instance for easy management.
- 🗃️ **Multi-Connection:** Manages multiple concurrent connections per peer.
- 🔒 **Immutable:** Returns frozen API objects for safety.
- 📦 **Zero dependencies** (other than the included `utils` and `emitter`), modern ES module.

---

## 📦 Installation

Copy `proficient.js` (and dependencies `utils.js`, `emitter.js`) into your project.

Import as a module:

```js
import proficient from './proficient.js';
```

---

## 🧠 Quick Examples

### 1. Setup & Media

```js
import proficient from "./proficient.js";

// Initialize as "Alice" in "Room1"
const pro = proficient("Alice", "Room1");

// 1. Get Local Camera/Mic
pro.getMedia("both"); // or "audio", "video"

pro.on("media", (type, stream) => {
    // 2. Store the stream (Required before calling!)
    pro.stream(stream);
    
    // Show local video
    document.querySelector("#localVideo").srcObject = stream;
});
```

### 2. Wiring up Signaling (The "Glue")

Since `proficient` doesn't know about your server, you must wire the events.
*Assume `socket` is your WebSocket connection.*

```js
// --- OUTBOUND: Send signals to your server --- //

// When WE generate an offer/answer (SDP)
pro.on("conn-local-description", (conn) => {
    socket.emit("signal", {
        target: conn.peer,
        type: conn.type, // "data" or "media"
        sdp: conn.pc.localDescription,
        id: conn.id // Unique ID for this specific connection
    });
});

// When WE generate an ICE Candidate
pro.on("conn-candidate", (conn, e, candidate) => {
    socket.emit("signal", {
        target: conn.peer,
        type: conn.type,
        candidate: candidate,
        id: conn.id
    });
});

// --- INBOUND: Feed signals from server into Proficient --- //

socket.on("signal", (msg) => {
    // msg contains: { sdp, candidate, type, id ... }
    const strMsg = JSON.stringify(msg); // Proficient expects JSON strings for input

    if (msg.sdp && msg.sdp.type === "offer") {
        pro.gotOffer(msg.sender, strMsg);
    } else if (msg.sdp && msg.sdp.type === "answer") {
        pro.gotAnswer(msg.sender, strMsg);
    } else if (msg.candidate) {
        pro.gotCandidate(msg.sender, strMsg);
    }
});
```

### 3. Making & Receiving Calls

```js
// --- STARTING A CALL --- //
// Ensure pro.stream() is set first!
const call = pro.call("Bob"); 


// --- RECEIVING A CALL --- //
pro.on("call", (conn) => {
    console.log("Incoming call from:", conn.peer);
    
    // Accept the call
    conn.answer();
    
    // Handle remote video
    conn.on("track", (e) => {
         document.querySelector("#remoteVideo").srcObject = e.streams[0];
    });
});
```

---

## 📚 API Reference

### 🟢 Initialization

| Function | Description |
|----------|-------------|
| `proficient(name, room)` | Creates a new instance. `name` is the local user ID, `room` is the context. |

### 📹 Media & Management

| Function | Description |
|----------|-------------|
| `pro.getMedia(type)` | Requests user permissions. `type`: `"audio"`, `"video"`, or `"both"`. Emits `media` on success. |
| `pro.stream([stream])` | Get or Set the local media stream. **Must be set before calling `pro.call`**. |
| `pro.connections()` | Returns a copy of all active connections. |
| `pro.purge()` | Closes all active connections and cleans up. |

### 📞 Connection Methods

| Function | Description |
|----------|-------------|
| `pro.call(peerId)` | Initiates a **Media** connection (Audio/Video). Returns the connection object. |
| `pro.chat(peerId)` | Initiates a **Data** connection (Text/Binary). Returns the connection object. |

### 📡 Inbound Signaling Hooks

Use these methods to feed data received from your signaling server into `proficient`.

| Function | Description |
|----------|-------------|
| `pro.gotOffer(peer, jsonString)` | Call this when you receive an SDP Offer. |
| `pro.gotAnswer(peer, jsonString)` | Call this when you receive an SDP Answer. |
| `pro.gotCandidate(peer, jsonString)` | Call this when you receive an ICE Candidate. |

---

## ⚡ Events

Events can be listened to on the main instance (`pro`) or specific connection objects.

### Main Instance Events

| Event | Arguments | Description |
|-------|-----------|-------------|
| `media` | `(type, stream)` | Fired when `getMedia` succeeds. |
| `call` | `(connection)` | Fired when receiving an incoming Media connection (Offer). |
| `chat` | `(connection)` | Fired when receiving an incoming Data connection (Offer). |
| `error` | `(type, err)` | Fired on errors. |

### Connection Events (Bubbled)

These events are emitted by connection objects, but bubble up to the main `pro` instance with the prefix `conn-`.

*Listener format:* `pro.on('conn-eventname', (connection, arg1, arg2) => { ... })`

| Event Suffix | Args (after `conn`) | Description |
|--------------|-------------------|-------------|
| `local-description` | *(none)* | SDP Offer/Answer created. Send `conn.pc.localDescription` to peer. |
| `remote-description` | *(none)* | Remote SDP received and set successfully. |
| `candidate` | `(e, candidate)` | New ICE candidate generated. Send to peer. |
| `track` | `(e, streams)` | **(Media Only)** Remote media track received. |
| `open` | *(none)* | **(Data Only)** Data Channel is open and ready. |
| `message` | `(data)` | **(Data Only)** Data received (ArrayBuffer). |
| `close` | *(none)* | Connection closed. |

---

## 📄 License

See the [LICENSE](./LICENSE) file for details.
