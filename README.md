proficient
==========

A tasteful, WebRTC library.

# API
## Table Of Contents
- [Instance]
  - [name]
  - [room]
  - [stream]
  - [getMedia]
  - [addConnection]
  - [remConnection]
  - [getConnection]
  - [gotCandidate]
  - [gotAnswer]
  - [gotOffer]
  - [chat]
  - [call]
- [DataConnection]
  - [provider]
  - [peer]
  - [type]
  - [id]
  - [name]
  - [initiator]
  - [channel]
  - [setup]
  - [pc]
  - [start/answer]
  - [quiet]
- [MediaConnection]
  - [provider]
  - [peer]
  - [type]
  - [id]
  - [name]
  - [initiator]
  - [pc]
  - [audio]
  - [video]
  - [start/answer]
  - [quiet]


### Instance
```javascript
var name = "user";
var room = "lobby";
var instance = proficient(name, room);
```
#### Methods
##### stream(stream)
> Gets or sets the current [media stream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream).
###### Parameters
Name | Type | Description
---- | ---- | -----------
stream | [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) | The [media stream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream).
<br/>

##### getMedia(type)
> Gets a [media stream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream).
###### Parameters
Name | Type | Description
---- | ---- | -----------
type | String | One of 'audio', 'video', or 'both'; specifies the type of media to get.
<br/>

##### addConnection(conn)
> Adds a connection.
###### Parameters
Name | Type | Description
---- | ---- | -----------
conn | Object | The data or media connection.
<br/>

##### remConnection(conn)
> Removes a connection.
###### Parameters
Name | Type | Description
---- | ---- | -----------
conn | Object | The data or media connection.
<br/>

##### getConnection(peer, type, id)
> Gets a data or media connection.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
type | String | Type of connection - either 'data' or 'media'.
id | String | The unique connection id.
<br/>

##### gotCandidate(peer, msg)
> Handles an ice candidate sent by a peer.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
msg | JSON String | The stringified JSON object containing the ice candidate.
<br/>

##### gotAnswer(peer, msg)
> Handles an answered offer.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
msg | JSON String | The stringified JSON object containing the answer (remote description).
<br/>

##### gotOffer(peer, msg)
> Handles an offer.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
msg | JSON String | The stringified JSON object containing the offer (remote description).
<br/>

##### chat(peer)
> Creates a DataConnection.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
<br/>

##### call(peer)
> Creates a MediaConnection.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
<br/>

#### Properties
Name | Type | Description
---- | ---- | -----------
name | String | Username.
room | String | Room name.
store | Object | The stored connections and media stream.

#### Events
Name | Parameters | Description
---- | ---------- | -----------
error | |
add-candidate | |
media | |
conn-open | |
conn-message | |
conn-close | |
conn-error | |
conn-local-description | |
conn-remote-description | |
conn-negotiationneeded | |
conn-candidate | |
conn-icecandidateerror | |
conn-signalingstatechange | |
conn-iceconnectionstatechange | |
conn-icegatheringstatechange | |
conn-connectionstatechange | |
conn-track | |

<br/>

#### Data Connection
```javascript
var dc = instance.chat("remote peer name");
```
#### Methods
##### channel(channel)
> Gets or sets the current data channel.
###### Parameters
Name | Type | Description
---- | ---- | -----------
channel | [RTCDataChannel](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) | The data channel.
<br/>

##### setup()
> Used internally to assign event handlers and the binary type of the data channel.

<br/>

##### start()
> Creates an offer and sets the local description.

<br/>

##### answer()
> Sets the remote description, local description, and creates an answer.

<br/>

##### quiet(bool)
> Controls event emission.
###### Parameters
Name | Type | Description
---- | ---- | -----------
bool | Boolean | True for on and false for off.
<br/>

#### Properties
Name | Type | Description
---- | ---- | -----------
provider | Instance |
peer | |
type | |
id | |
name | |
initiator | |
pc | |

#### Events
Name | Parameters | Description
---- | ---------- | -----------
open | |
message | |
close | |
error | |
local-description | |
remote-description | |
negotiationneeded | |
candidate | |
icecandidateerror | |
signalingstatechange | |
iceconnectionstatechange | |
icegatheringstatechange | |
connectionstatechange | |

<br/>

#### Media Connection
```javascript
var mc = instance.call("remote peer name");
```
#### Methods
##### audio(sender)
> Gets or sets the current [audio track](https://developer.mozilla.org/en-US/docs/Web/API/AudioTrack).
###### Parameters
Name | Type | Description
---- | ---- | -----------
sender | [AudioTrack](https://developer.mozilla.org/en-US/docs/Web/API/AudioTrack) | The [audio track](https://developer.mozilla.org/en-US/docs/Web/API/AudioTrack).
<br/>

##### video(sender)
> Gets or sets the current [video track](https://developer.mozilla.org/en-US/docs/Web/API/VideoTrack).
###### Parameters
Name | Type | Description
---- | ---- | -----------
sender | [VideoTrack](https://developer.mozilla.org/en-US/docs/Web/API/VideoTrack) | The [video track](https://developer.mozilla.org/en-US/docs/Web/API/VideoTrack).
<br/>

##### start()
> Creates an offer and sets the local description.

<br/>

##### answer()
> Sets the remote description, local description, and creates an answer.

<br/>

##### quiet(bool)
> Controls event emission.
###### Parameters
Name | Type | Description
---- | ---- | -----------
bool | Boolean | True for on and false for off.
<br/>

#### Properties
Name | Type | Description
---- | ---- | -----------
provider | |
peer | |
type | |
id | |
name | |
initiator | |
pc | |

#### Events
Name | Parameters | Description
---- | ---------- | -----------
track | |
error | |
local-description | |
remote-description | |
negotiationneeded | |
candidate | |
icecandidateerror | |
signalingstatechange | |
iceconnectionstatechange | |
icegatheringstatechange | |
connectionstatechange | |

