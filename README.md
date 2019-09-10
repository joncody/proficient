proficient
==========

A tasteful, WebRTC library.

# API
## Table Of Contents
- [Instance](#instance)
  - [stream](#streamstream)
  - [getMedia](#getmediatype)
  - [addConnection](#addconnectionconn)
  - [remConnection](#remconnectionconn)
  - [getConnection](#getconnectionpeer-type-id---object)
  - [gotCandidate](#gotcandidatepeer-msg)
  - [gotAnswer](#gotanswerpeer-msg)
  - [gotOffer](#gotofferpeer-msg)
  - [chat](#chatpeer---object)
  - [call](#callpeer---object)
  - [purge](#purge)
  - [name](#properties)
  - [room](#properties)
- [DataConnection](#data-connection)
  - [channel](#channelchannel---rtcdatachannel)
  - [setup](#setup)
  - [start](#start)
  - [answer](#answer)
  - [quiet](#quietbool---boolean)
  - [provider](#properties-1)
  - [peer](#properties-1)
  - [type](#properties-1)
  - [id](#properties-1)
  - [name](#properties-1)
  - [initiator](#properties-1)
  - [pc](#properties-1)
- [MediaConnection](#media-connection)
  - [audio](#audiosender---audiotrack)
  - [video](#videosender---videotrack)
  - [start](#start-1)
  - [answer](#answer-1)
  - [quiet](#quietbool---boolean-1)
  - [provider](#properties-2)
  - [peer](#properties-2)
  - [type](#properties-2)
  - [id](#properties-2)
  - [name](#properties-2)
  - [initiator](#properties-2)
  - [pc](#properties-2)


### Instance
```javascript
var name = "user";
var room = "lobby";
var instance = proficient(name, room);
```
#### Methods
##### stream(stream)
> Gets or sets the current media stream.
###### Parameters
Name | Type | Description
---- | ---- | -----------
stream | [MediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) | The media stream.
<br/>

##### getMedia(type)
> Gets a media stream.
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

##### getConnection(peer, type, id) _-> {Object}_
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

##### chat(peer) _-> {Object}_
> Creates a DataConnection.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
<br/>

##### call(peer) _-> {Object}_
> Creates a MediaConnection.
###### Parameters
Name | Type | Description
---- | ---- | -----------
peer | String | The unique member id.
<br/>

##### purge()
> Closes and removes all connections.

<br/>

#### Properties
Name | Type | Description
---- | ---- | -----------
name | String | Username.
room | String | Room name.

#### Events
Name | Parameters | Description
---- | ---------- | -----------
error | String, Event | Fired when getting a media stream fails.
media | String, MediaStream | Fired when getting a media stream succeeds.
conn-add-candidate | Object (conn), [RTCICeCandidate](https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate) | Fired when an ice candidate is successfully added.
conn-open | Object (conn) | Fired when a data connection opens.
conn-message | Object (conn), ArrayBuffer or String | Fired when a data connection receives a message.
conn-close | Object (conn) | Fired when a data connection closes.
conn-error | Object (conn), Event | Fired when a data connection encounters an error.
conn-local-description | Object (conn) | Fired after a connection sets its local description.
conn-remote-description | Object (conn) | Fired after a connection sets its remote description.
conn-negotiationneeded | Object (conn) | Fired when a change has occurred which requires session negotiation.
conn-candidate | Object (conn), RTCIceCandidate | Fired when receiving a new RTCIceCandidate from a server
conn-icecandidateerror | Object (conn), Event | Fired when there as an error receiving a new RTCIceCandidate from a server
conn-signalingstatechange | Object (conn), String, Event | Fired when the signalingState of a connection changes.
conn-iceconnectionstatechange | Object (conn), String, Event | Fired when the iceConnectionState of a connection changes.
conn-icegatheringstatechange | Object (conn), String, Event | Fired when the iceGatheringState of a connection changes.
conn-connectionstatechange | Object (conn), String, Event | Fired when the connectionState of a connection changes.
conn-track | Object (conn), List of MediaStreams  | Fired when a track has been added to a connection.

<br/>

#### Data Connection
```javascript
var dc = instance.chat("remote peer name");
```
#### Methods
##### channel(channel) _-> {[RTCDataChannel](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel)}_
> Gets or sets the current data channel.
###### Parameters
Name | Type | Description
---- | ---- | -----------
channel | RTCDataChannel | The data channel.
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

##### quiet(bool) _-> {Boolean}_
> Controls event emission.
###### Parameters
Name | Type | Description
---- | ---- | -----------
bool | Boolean | True for on and false for off.
<br/>

#### Properties
Name | Type | Description
---- | ---- | -----------
provider | Instance | The instance from which this connection was created.
peer | String | The unique member id.
type | String | The type of connection: "data"
id | String | The unique connection id.
name | String | The unique connection name.
initiator | Boolean | If a connection initiates an offer then this is true, otherwise false.
pc | RTCPeerConnection | The wrapped peer connection object.

#### Events
Name | Parameters | Description
---- | ---------- | -----------
open | | Fired when a data connection opens.
message | ArrayBuffer or String | Fired when a data connection receives a message.
close | | Fired when a data connection closes.
error | Event | Fired when a data connection encounters an error.
local-description | | Fired after a connection sets its local description.
remote-description | | Fired after a connection sets its remote description.
negotiationneeded | | Fired when a change has occurred which requires session negotiation.
candidate | RTCIceCandidate | Fired when receiving a new RTCIceCandidate from a server
icecandidateerror | Event | Fired when there as an error receiving a new RTCIceCandidate from a server
signalingstatechange | String, Event | Fired when the signalingState of a connection changes.
iceconnectionstatechange | String, Event | Fired when the iceConnectionState of a connection changes.
icegatheringstatechange | String, Event | Fired when the iceGatheringState of a connection changes.
connectionstatechange | String, Event | Fired when the connectionState of a connection changes.

<br/>

#### Media Connection
```javascript
var mc = instance.call("remote peer name");
```
#### Methods
##### audio(sender) _-> {[AudioTrack](https://developer.mozilla.org/en-US/docs/Web/API/AudioTrack)}_
> Gets or sets the current audio track.
###### Parameters
Name | Type | Description
---- | ---- | -----------
sender | AudioTrack | The audio track.
<br/>

##### video(sender) _-> {[VideoTrack](https://developer.mozilla.org/en-US/docs/Web/API/VideoTrack)}_
> Gets or sets the current video track.
###### Parameters
Name | Type | Description
---- | ---- | -----------
sender | VideoTrack | The video track.
<br/>

##### start()
> Creates an offer and sets the local description.

<br/>

##### answer()
> Sets the remote description, local description, and creates an answer.

<br/>

##### quiet(bool) _-> {Boolean}_
> Controls event emission.
###### Parameters
Name | Type | Description
---- | ---- | -----------
bool | Boolean | True for on and false for off.
<br/>

#### Properties
Name | Type | Description
---- | ---- | -----------
provider | Instance | The instance from which this connection was created.
peer | String | The unique member id.
type | String | The type of connection: "media"
id | String | The unique connection id.
name | String | The unique connection name.
initiator | Boolean | If a connection initiates an offer then this is true, otherwise false.
pc | RTCPeerConnection | The wrapped peer connection object.

#### Events
Name | Parameters | Description
---- | ---------- | -----------
track | List of MediaStreams  | Fired when a track has been added to a connection.
error | Event | Fired when a data connection encounters an error.
local-description | | Fired after a connection sets its local description.
remote-description | | Fired after a connection sets its remote description.
negotiationneeded | | Fired when a change has occurred which requires session negotiation.
candidate | RTCIceCandidate | Fired when receiving a new RTCIceCandidate from a server
icecandidateerror | Event | Fired when there as an error receiving a new RTCIceCandidate from a server
signalingstatechange | String, Event | Fired when the signalingState of a connection changes.
iceconnectionstatechange | String, Event | Fired when the iceConnectionState of a connection changes.
icegatheringstatechange | String, Event | Fired when the iceGatheringState of a connection changes.
connectionstatechange | String, Event | Fired when the connectionState of a connection changes.

