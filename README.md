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
- mc.options
- mc.peer
- mc.provider
- mc.type
- mc.metadata([_mixed_])
- mc.session([_string_])
- mc.descriptions(_string_[, _boolean_])
- mc.constraints([_object_])
- mc.start([_function_])
- mc.answer([_function_])
- mc.pc([_object_])
- mc.openConnection()
- mc.addLocalStream(_object_)
- mc.addRemoteStream(_object_)
- mc.toggleRemoteMedia(_string_)
- mc.toggleLocalMedia(_string_)
- mc.getStats(_function_)
- mc.close()

### dataConnection
- dc.id
- dc.label
- dc.options
- dc.peer
- dc.provider
- dc.reliable
- dc.type
- dc.metadata([_mixed_])
- dc.session([_string_])
- dc.descriptions(_string_[, _boolean_])
- dc.constraints([_object_])
- dc.start([_function_])
- dc.answer([_function_])
- dc.pc([_object_])
- dc.initialize(_object_)
- dc.openConnection()
- dc.cancelReceive(_string_, _boolean_)
- dc.receiveData(_object_)
- dc.parseData(_event_)
- dc.sendChunks()
- dc.send(_mixed_[, _mixed_])
- dc.cancelSend(_string_, _boolean_)
- dc.getStats(_function_)
- dc.close()

### getPeer
- pro.config
- pro.options
- pro.user
- pro.socket
- pro.video([_object_])
- pro.audio([_object_])
- pro.openConnection()
- pro.getMedia([_string_])
- pro.chat(_string_[, _object_])
- pro.call(_string_[, _object_])
- pro.getConnection(_string_, _string_)
- pro.addConnection(_object_)
- pro.removeConnection(_object_)
- pro.gotCandidate(_object_, _string_)
- pro.gotAnswer(_object_, _string_)
- pro.gotOffer(_object_, _string_)
- pro.end(_object_, _string_)
- pro.cleanupPeer(_string_)
- pro.cleanup()
- pro.destroy([_string_])
- pro.close()
- pro.error(_event_)
