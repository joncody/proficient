
# Proficient

**Proficient** is a lightweight, event-driven WebRTC library for JavaScript, designed to simplify the creation of **peer-to-peer audio/video calls** and **data channels**.

It supports multiple concurrent connections, handles offer/answer and ICE negotiation internally, and uses a modular design with event emitters.

---

## Features

- 📞 Media connections (audio/video) via WebRTC
- 💬 RTCDataChannel for real-time messaging
- 🔄 SDP offer/answer and ICE candidate negotiation
- 🔧 Custom event emitter system
- 🔁 Manage multiple connections per peer
- 🧱 Built with native APIs, zero third-party dependencies

---

## Installation

This library is not on npm. To use it:

```bash
your-project/
├── include/
│   ├── emitter.js
│   └── util.js
├── proficient.js
```

---

## Getting Started

### Import

```js
import proficient from './proficient.js';
```

### Create an Instance

```js
const pro = proficient('alice', 'room-1');
```

---

## Usage

### Acquire Media

```js
pro.getMedia('both'); // 'audio', 'video', or 'both'

pro.on('media', (type, stream) => {
  document.querySelector('#local').srcObject = stream;
});
```

### Make a Call

```js
const call = pro.call('bob');

call.on('track', (e, streams) => {
  document.querySelector('#remote').srcObject = streams[0];
});

call.start(); // Send SDP offer
```

### Open a Chat

```js
const chat = pro.chat('bob');

chat.on('open', () => {
  chat.channel().send('Hello Bob!');
});

chat.on('message', data => {
  console.log('Message from Bob:', data);
});

chat.start(); // Send SDP offer
```

---

## Receiving Offers & ICE Candidates

These are typically handled through your signaling server:

```js
// When you receive an offer:
pro.gotOffer('bob', JSON.stringify({ type: 'media', id: 1, sdp }));

// When you receive an answer:
pro.gotAnswer('bob', JSON.stringify({ type: 'media', id: 1, sdp }));

// When you receive a candidate:
pro.gotCandidate('bob', JSON.stringify({ type: 'media', id: 1, candidate }));
```

---

## API

### Instance

```js
const pro = proficient(name, room);
```

#### Methods

| Method                        | Description                              |
|------------------------------|------------------------------------------|
| `getMedia(type)`             | Request local media (`audio`, `video`, `both`) |
| `call(peer)`                 | Create a media connection                |
| `chat(peer)`                 | Create a data channel connection         |
| `gotOffer(peer, msg)`        | Handle incoming SDP offer                |
| `gotAnswer(peer, msg)`       | Handle incoming SDP answer               |
| `gotCandidate(peer, msg)`    | Handle incoming ICE candidate            |
| `addConnection(conn)`        | Manually add a connection (internal)     |
| `remConnection(conn)`        | Remove an existing connection            |
| `getConnection(peer, type, id)` | Retrieve a specific connection         |
| `purge()`                    | Close and remove all connections         |

#### Properties

| Property       | Description                     |
|----------------|---------------------------------|
| `name`         | The local username              |
| `room`         | The current room name           |
| `stream()`     | Get/set local media stream      |
| `connections()`| Return a snapshot of all connections |

---

## Events

Events are emitted at two levels:

- **Instance events** (e.g. `pro.on('call', ...)`)
- **Connection events** (prefixed internally with `conn-`)

| Event                     | From         | Description                         |
|---------------------------|--------------|-------------------------------------|
| `media`                   | instance     | Fired when local media is acquired |
| `call`                    | instance     | Fired when a remote peer calls     |
| `chat`                    | instance     | Fired when a remote peer starts chat |
| `conn-open`               | data conn    | Data channel opened                 |
| `conn-message`            | data conn    | Message received on data channel   |
| `conn-close`              | data conn    | Data channel closed                 |
| `conn-error`              | all conns    | Generic connection error            |
| `conn-track`              | media conn   | Media track received                |
| `conn-local-description`  | all conns    | Local SDP set                       |
| `conn-remote-description` | all conns    | Remote SDP set                      |
| `conn-candidate`          | all conns    | ICE candidate gathered              |
| `conn-icecandidateerror`  | all conns    | ICE error                           |
| `conn-signalingstatechange` | all conns  | Signaling state changed             |
| `conn-iceconnectionstatechange` | all conns | ICE connection state changed     |
| `conn-icegatheringstatechange` | all conns | ICE gathering state changed      |
| `conn-connectionstatechange` | all conns | Peer connection state changed      |

---

## Advanced Notes

- Connections are internally tracked by peer + type (`data` / `media`) + ID.
- You can have multiple connections per peer of the same type.
- Local and remote SDP management is handled internally but can be overridden if needed.
- Use `.quiet(true)` on a connection to suppress event emission.

---

## License

See [`LICENSE`](./LICENSE)
