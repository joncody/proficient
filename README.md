proficient
==========

A WebRTC client-side library.

## API
### utils
- utils.debug
- utils.defaultConfig
- utils.browser
- utils.supports
- utils.iceTimeout
- utils.chunksize
- utils.sendTimeout
- utils.uuid
- utils.stringifiable
- utils.parsable
- utils.stringify
- utils.parse
- utils.downloadDataURL
- utils.isTypedArray
- utils.getCodesFromString
- utils.getStringFromCodes
- utils.toUint8
- utils.toBuffer

### manager
- manager.iceCandidates
- manager.parseSDP
- manager.storeCandidate
- manager.releaseCandidates
- manager.makeOffer
- manager.makeAnswer
- manager.handleSDP
- manager.handleCandidate
- manager.setupListeners
- manager.createPeerConnection
- manager.startPeerConnection

### mediaConnection
- mc.id
- mc.constraints
- mc.metadata
- mc.options
- mc.peer
- mc.provider
- mc.type
- mc.setStart
- mc.start
- mc.setAnswer
- mc.answer
- mc.setPc
- mc.getPc
- mc.openConnection
- mc.addLocalStream
- mc.addRemoteStream
- mc.toggleRemoteMedia
- mc.toggleLocalMedia
- mc.getStats
- mc.close

### dataConnection
- dc.id
- dc.constraints
- dc.label
- dc.metadata
- dc.peer
- dc.provider
- dc.reliable
- dc.type
- dc.initialize
- dc.openConnection
- dc.cancelReceive
- dc.receiveData
- dc.parseData
- dc.sendChunks
- dc.send
- dc.cancelSend
- dc.getStats
- dc.close

### getPeer
- pro.config
- pro.connections
- pro.options
- pro.user
- pro.socket
- pro.openConnection
- pro.getMedia
- pro.chat
- pro.call
- pro.getConnection
- pro.addConnection
- pro.removeConnection
- pro.gotCandidate
- pro.gotAnswer
- pro.gotOffer
- pro.end
- pro.cleanupPeer
- pro.cleanup
- pro.destroy
- pro.close
- pro.error
