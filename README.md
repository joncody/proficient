proficient
==========

A tasteful, WebRTC library.

## API
#### Instance
```javascript
var name = "user";
var room = "lobby";
var instance = proficient(name, room);
```
- **name**
- **room**
- **stream**
- **getMedia**
- **addConnection**
- **remConnection**
- **getConnection**
- **gotCandidate**
- **gotAnswer**
- **gotOffer**
- **chat**
- **call**
##### Events
- **"error"**
- **"add-candidate"**
- **"media"**
- **"conn-open"**
- **"conn-message"**
- **"conn-close"**
- **"conn-error"**
- **"conn-local-description"**
- **"conn-remote-description"**
- **"conn-negotiationneeded"**
- **"conn-candidate"**
- **"conn-icecandidateerror"**
- **"conn-signalingstatechange"**
- **"conn-iceconnectionstatechange"**
- **"conn-icegatheringstatechange"**
- **"conn-connectionstatechange"**
- **"conn-track"**

#### Data Connection
```javascript
var dc = instance.chat("remote peer name");
```
- **provider**
- **peer**
- **type**
- **id**
- **name**
- **initiator**
- **channel**
- **setup**
- **pc**
- **start/answer**
- **quiet**
##### Events
- **"open"**
- **"message"**
- **"close"**
- **"error"**
- **"local-description"**
- **"remote-description"**
- **"negotiationneeded"**
- **"candidate"**
- **"icecandidateerror"**
- **"signalingstatechange"**
- **"iceconnectionstatechange"**
- **"icegatheringstatechange"**
- **"connectionstatechange"**

#### Media Connection
```javascript
var mc = instance.call("remote peer name");
```
- **provider**
- **peer**
- **type**
- **id**
- **name**
- **initiator**
- **pc**
- **audio**
- **video**
- **start/answer**
- **quiet**
##### Events
- **"track"**
- **"error"**
- **"local-description"**
- **"remote-description"**
- **"negotiationneeded"**
- **"candidate"**
- **"icecandidateerror"**
- **"signalingstatechange"**
- **"iceconnectionstatechange"**
- **"icegatheringstatechange"**
- **"connectionstatechange"**
