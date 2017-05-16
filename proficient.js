//    Title: proficient.js
//    Author: Jon Cody
//
//    This program is free software: you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program.  If not, see <http://www.gnu.org/licenses/>.

(function (global) {
    'use strict';

    function typeOf(value) {
        var type = typeof value;

        if (type === 'object') {
            if (!type) {
                type = 'null';
            } else if (Array.isArray(type)) {
                type = 'array';
            }
        }
        return type;
    }

    var utils = {},
        manager = {};

// adapter
    if (!global.RTCPeerConnection) {
        global.RTCPeerConnection = global.mozRTCPeerConnection || global.webkitRTCPeerConnection;
    }
    if (!global.RTCDataChannel) {
        global.RTCDataChannel = global.mozRTCDataChannel || global.webkitRTCDataChannel;
    }
    if (!global.RTCSessionDescription) {
        global.RTCSessionDescription = global.mozRTCSessionDescription || global.webkitRTCSessionDescription;
    }
    if (!global.RTCIceCandidate) {
        global.RTCIceCandidate = global.mozRTCIceCandidate || global.webkitRTCIceCandidate;
    }
    if (!global.navigator.getUserMedia) {
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    }

// utils
    utils.debug = true;

    utils.defaultConfig = {
        iceServers: []
    };

    utils.browser = (function uaMatch() {
        var ua = window.navigator.userAgent.toLowerCase(),
            match = (/(edge)\/([\w.]+)/).exec(ua) ||
                    (/(opr)[\/]([\w.]+)/).exec(ua) ||
                    (/(chrome)[\/]([\w.]+)/).exec(ua) ||
                    (/(version)(applewebkit)[\/]([\w.]+).*(safari)[\/]([\w.]+)/).exec(ua) ||
                    (/(webkit)[\/]([\w.]+).*(version)[\/]([\w.]+).*(safari)[\/]([\w.]+)/).exec(ua) ||
                    (/(webkit)[\/]([\w.]+)/).exec(ua) ||
                    (/(opera)(?:.*version)?[\/]([\w.]+)/).exec(ua) ||
                    (/(msie)\s([\w.]+)/).exec(ua) ||
                    (ua.indexOf("trident") >= 0 && (/(rv)(?::)?([\w.]+)/).exec(ua)) ||
                    (ua.indexOf("compatible") < 0 && (/(mozilla)(?:.*?\srv:([\w.]+))?/).exec(ua)) ||
                    [],
            platform_match = (/(ipad)/).exec(ua) ||
                    (/(ipod)/).exec(ua) ||
                    (/(iphone)/).exec(ua) ||
                    (/(kindle)/).exec(ua) ||
                    (/(silk)/).exec(ua) ||
                    (/(android)/).exec(ua) ||
                    (/(windows\sphone)/).exec(ua) ||
                    (/(win)/).exec(ua) ||
                    (/(mac)/).exec(ua) ||
                    (/(linux)/).exec(ua) ||
                    (/(cros)/).exec(ua) ||
                    (/(playbook)/).exec(ua) ||
                    (/(bb)/).exec(ua) ||
                    (/(blackberry)/).exec(ua) ||
                    [],
            browser = {},
            matched = {
                browser: match[5] || match[3] || match[1] || '',
                version: match[2] || match[4] || '0',
                versionNumber: match[4] || match[2] || '0',
                platform: platform_match[0] || ''
            },
            ie = 'msie',
            blackberry = 'blackberry',
            playbook = 'playbook',
            bb = 'blackberry',
            opera = 'opera',
            android = 'android',
            kindle = 'kindle',
            silk = 'silk';

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
            browser.versionNumber = parseInt(matched.versionNumber, 10);
        }
        if (matched.platform) {
            browser[matched.platform] = true;
        }
        if (browser.android || browser.bb || browser.blackberry || browser.ipad || browser.iphone || browser.ipod || browser.kindle || browser.playbook || browser.silk || browser["windows phone"]) {
            browser.mobile = true;
        }
        if (browser.cros || browser.mac || browser.linux || browser.win) {
            browser.desktop = true;
        }
        if (browser.chrome || browser.opr || browser.safari) {
            browser.webkit = true;
        }
        if (browser.rv || browser.edge) {
            matched.browser = ie;
            browser[ie] = true;
        }
        if (browser.safari && browser.blackberry) {
            matched.browser = blackberry;
            browser[blackberry] = true;
        }
        if (browser.safari && browser.playbook) {
            matched.browser = playbook;
            browser[playbook] = true;
        }
        if (browser.bb) {
            matched.browser = bb;
            browser[bb] = true;
        }
        if (browser.opr) {
            matched.browser = opera;
            browser[opera] = true;
        }
        if (browser.safari && browser.android) {
            matched.browser = android;
            browser[android] = true;
        }
        if (browser.safari && browser.kindle) {
            matched.browser = kindle;
            browser[kindle] = true;
        }
        if (browser.safari && browser.silk) {
            matched.browser = silk;
            browser[silk] = true;
        }
        browser.name = matched.browser;
        browser.platform = matched.platform;

        return browser;
    }());

    utils.supports = (function supports() {
        var data = true,
            media = true,
            binaryBlob = false,
            sctp = false,
            pc,
            dc;

        try {
            pc = new RTCPeerConnection(utils.defaultConfig, {optional: [{RtpDataChannels: true}]});
        } catch (ignore) {
            data = false;
            media = false;
        }
        if (data) {
            try {
                dc = pc.createDataChannel('_TEST_');
            } catch (ignore) {
                data = false;
            }
        }
        if (data) {
            try {
                dc.binaryType = 'blob';
                binaryBlob = true;
            } catch (ignore) {}
        }
        if (dc) {
            dc.close();
            dc = null;
        }
        if (pc) {
            pc.close();
            pc = null;
        }
        if (data) {
            pc = new RTCPeerConnection(utils.defaultConfig, {});
            try {
                dc = pc.createDataChannel('_RELIABLE_TEST_', {});
                sctp = dc.reliable;
            } catch (ignore) {}
            if (dc) {
                dc.close();
            }
            pc.close();
        }
        return {
            data: data,
            media: media,
            binaryBlob: binaryBlob,
            sctp: sctp
        };
    }());

    utils.iceTimeout = 30000;

    utils.chunksize = utils.supports.sctp ? 16000 : 1600;

    utils.sendTimeout = utils.supports.sctp ? 100 : 400;

    utils.uuid = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    };

    utils.stringifiable = function (object) {
        try {
            JSON.stringify(object);
            return true;
        } catch (ignore) {
            return false;
        }
    };

    utils.parsable = function (string) {
        try {
            JSON.parse(string);
            return true;
        } catch (ignore) {
            return false;
        }
    };

    utils.stringify = function (object) {
        var result = object;

        try {
            result = JSON.stringify(object);
            if (result === "{}") {
                result = object;
            }
        } catch (ignore) {
            result = object;
        }
        return result;
    };

    utils.parse = function (string) {
        var result = string;

        try {
            result = JSON.parse(string);
        } catch (ignore) {
            result = string;
        }
        return result;
    };

    utils.downloadDataURL = function (uri, filename) {
        var link;

        if (!uri) {
            return;
        }
        link = document.createElement('a');
        link.download = filename || 'file';
        link.href = uri;
        link.target = '_blank';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    utils.isTypedArray = function (array) {
        var arrayTypes = [
                'Int8Array',
                'Uint8Array',
                'Uint8ClampedArray',
                'Int16Array',
                'Uint16Array',
                'Int32Array',
                'Uint32Array',
                'Float32Array',
                'Float64Array'
            ],
            type = Object.prototype.toString.call(array).replace(/\[object\s(\w+)\]/, '$1');

        return arrayTypes.indexOf(type) > -1;
    };

    utils.getCodesFromString = function (string) {
        var codes = [];

        if (typeof string === 'string') {
            string.split('').forEach(function (character) {
                codes.push(character.charCodeAt(0));
            });
        }
        return codes;
    };

    utils.getStringFromCodes = function (codes) {
        var string = '';

        Array.prototype.slice.call(codes).forEach(function (character) {
            string += String.fromCharCode(character);
        });
        return string;
    };

    utils.toUint8 = function (value) {
        if (isTypedArray(value) || Array.isArray(value) || value instanceof ArrayBuffer || typeof value === 'number') {
            value = new Uint8Array(value);
        } else if (typeof value === 'string') {
            value = new Uint8Array(getCodesFromString(value));
        } else {
            value = new Uint8Array(0);
        }
        return value;
    };

    utils.toBuffer = function (buffer) {
        return toUint8(buffer).buffer;
    };

    utils = Object.freeze(utils);

// manager
    manager.iceCandidates = {};

    manager.parseSDP = function (sdp) {
        var lineRegex = /^([\w]{1})=([.])*/,
            sdpString,
            sdpLines;

        if (typeOf(sdp) === 'object' && sdp.sdp) {
            sdpString = sdp.sdp;
            sdpLines = sdpString.split(/\n/).filter(function (line) {
                return lineRegex.test(line);
            });
        }
        return sdpLines;
    };

    manager.storeCandidate = function (connection, candidate) {
        var id;

        if (utils.debug) {
            console.log('storing ICE candidate: ' + connection.id);
        }
        if (!connection || !candidate) {
            return;
        }
        id = connection.id;
        if (!manager.iceCandidates.hasOwnProperty(id)) {
            manager.iceCandidates[id] = [];
        }
        manager.iceCandidates[id].push(candidate);
    };

    manager.releaseCandidates = function (connection) {
        var id,
            candidate;

        if (!connection || !manager.iceCandidates.hasOwnProperty(connection.id)) {
            return;
        }
        id = connection.id;
        while (manager.iceCandidates[id].length > 0) {
            candidate = manager.iceCandidates[id].shift();
            if (candidate) {
                if (utils.debug) {
                    console.log('releasing ICE candidate: ' + connection.id);
                }
                manager.handleCandidate(connection, candidate);
            }
        }
        delete manager.iceCandidates[id];
    };

    manager.makeOffer = function (connection) {
        function offerSuccess(offer) {
            function localDescriptionSuccess() {
                if (utils.debug) {
                    console.log('set local description, sending offer: ' + connection.id);
                    console.log(manager.parseSDP(offer));
                }
                connection.descriptions('local', true);
                connection.provider.socket.send('offer', JSON.stringify({
                    type: connection.type,
                    id: connection.id,
                    label: connection.label,
                    metadata: connection.metadata(),
                    reliable: connection.reliable,
                    session: connection.session(),
                    sdp: offer
                }), connection.peer);
                manager.releaseCandidates(connection);
            }
            function localDescriptionError(err) {
                connection.emit('error', err);
            }
            if (utils.debug) {
                console.log('created offer: ' + connection.id);
            }
            connection.pc().setLocalDescription(offer, localDescriptionSuccess, localDescriptionError);
        }
        function offerError(err) {
            connection.emit('error', err);
        }
        if (!connection || !connection.pc()) {
            return;
        }
        if (utils.debug) {
            console.log('creating offer: ' + connection.id);
        }
        connection.pc().createOffer(offerSuccess, offerError, connection.constraints);
    };

    manager.makeAnswer = function (connection) {
        function answerSuccess(answer) {
            function localDescriptionSuccess() {
                if (utils.debug) {
                    console.log('set local description, sending answer: ' + connection.id);
                    console.log(manager.parseSDP(answer));
                }
                connection.descriptions('local', true);
                connection.provider.socket.send('answer', JSON.stringify({
                    type: connection.type,
                    id: connection.id,
                    sdp: answer
                }), connection.peer);
                if (connection.type === 'media') {
                    connection.openConnection();
                }
                manager.releaseCandidates(connection);
            }
            function localDescriptionError(err) {
                connection.emit('error', err);
            }
            if (utils.debug) {
                console.log('created answer: ' + connection.id);
            }
            connection.pc().setLocalDescription(answer, localDescriptionSuccess, localDescriptionError);
        }
        function answerError(err) {
            connection.emit('error', err);
        }
        if (!connection || !connection.pc()) {
            return;
        }
        if (utils.debug) {
            console.log('creating answer: ' + connection.id);
        }
        connection.pc().createAnswer(answerSuccess, answerError, connection.constraints);
    };

    manager.handleSDP = function (type, connection, sdp) {
        function remoteDescriptionSuccess() {
            if (utils.debug) {
                console.log('set remote description: ' + connection.id);
                console.log(manager.parseSDP(sdp));
            }
            connection.descriptions('remote', true);
            if (type === 'offer') {
                manager.makeAnswer(connection);
            } else if (connection.type === 'media') {
                connection.openConnection();
            }
        }
        function remoteDescriptionError(err) {
            connection.emit('error', err);
        }
        if (!connection || !connection.pc() || !sdp) {
            return;
        }
        if (utils.debug) {
            console.log('setting remote description: ' + connection.id);
            console.log(manager.parseSDP(sdp));
        }
        sdp = new RTCSessionDescription(sdp);
        connection.pc().setRemoteDescription(sdp, remoteDescriptionSuccess, remoteDescriptionError);
    };

    manager.handleCandidate = function (connection, ice) {
        var candidate,
            sdpMLineIndex;

        if (typeOf(connection) !== 'object' || typeOf(ice) !== 'object' || !ice.candidate) {
            return;
        }
        candidate = ice.candidate;
        sdpMLineIndex = ice.sdpMLineIndex;
        if (utils.debug) {
            console.log('adding ICE candidate: ' + connection.id);
        }
        connection.pc().addIceCandidate(new RTCIceCandidate({
            sdpMLineIndex: sdpMLineIndex,
            candidate: candidate
        }));
    };

    manager.setupListeners = function (connection, pc) {
        if (!connection || !pc) {
            return;
        }
        pc.onicecandidate = function (evt) {
            if (!evt.candidate) {
                return;
            }
            if (utils.debug) {
                console.log('sending ice candidate: ' + connection.id);
            }
            connection.provider.socket.send('candidate', JSON.stringify({
                type: connection.type,
                id: connection.id,
                candidate: evt.candidate
            }), connection.peer);
        };
        pc.oniceconnectionstatechange = function () {
            var state = pc.iceConnectionState,
                iceTimeout = null;

            if (utils.debug) {
                console.log('ice connection state ' + state + ': ' + connection.id);
            }
            if (iceTimeout) {
                global.clearTimeout(iceTimeout);
                iceTimeout = null;
            }
            switch (state) {
            case 'disconnected':
            case 'failed':
                iceTimeout = global.setTimeout(connection.close.bind(connection), utils.iceTimeout);
                break;
            case 'checking':
                break;
            case 'completed':
                pc.onicecandidate = null;
                break;
            default:
                break;
            }
        };
        pc.ondatachannel = function (evt) {
            if (!evt.channel) {
                return;
            }
            if (utils.debug) {
                console.log('adding data channel: ' + connection.id);
            }
            connection.initialize(evt.channel);
        };
        pc.onaddstream = function (evt) {
            if (!evt.stream) {
                return;
            }
            if (utils.debug) {
                console.log('adding remote stream: ' + connection.id);
            }
            connection.addRemoteStream(evt.stream);
        };
    };

    manager.createPeerConnection = function (connection) {
        var pc,
            type,
            pcOptions = {
                optional: [],
                mandatory: {}
            };

        if (typeOf(connection) !== 'object') {
            return;
        }
        type = connection.type;
        if (type === 'data' && utils.supports.sctp === false) {
            pcOptions.optional[0] = {RtpDataChannels: true};
        } else if (type === 'media') {
            pcOptions.optional[0] = {DtlsSrtpKeyAgreement: true};
        }
        pc = new RTCPeerConnection(connection.provider.config, pcOptions);
        if (pc) {
            manager.setupListeners(connection, pc);
        }
        return pc;
    };

    manager.startPeerConnection = function (connection) {
        var pc,
            type,
            dataChannel,
            options;

        if (!connection) {
            return;
        }
        type = connection.type;
        options = connection.options;
        pc = manager.createPeerConnection(connection);
        if (!pc) {
            return;
        }
        connection.pc(pc);
        if (options.originator) {
            if (type === 'data') {
                dataChannel = pc.createDataChannel(connection.label, {reliable: connection.reliable});
                if (dataChannel) {
                    connection.initialize(dataChannel);
                }
                connection.start(manager.makeOffer.bind(manager, connection));
            } else if (type === 'media') {
                connection.start(function () {
                    var stream;

                    if (connection.session() === 'both') {
                        connection.constraints({
                            mandatory: {
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true
                            }
                        });
                        stream = connection.provider.video();
                    } else if (connection.session() === 'audio') {
                        connection.constraints({
                            mandatory: {
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: false
                            }
                        });
                        stream = connection.provider.audio();
                    } else if (connection.session() === 'video') {
                        connection.constraints({
                            mandatory: {
                                offerToReceiveAudio: false,
                                offerToReceiveVideo: true
                            }
                        });
                        stream = connection.provider.video();
                    }
                    connection.addLocalStream(stream);
                    manager.makeOffer(connection);
                });
            }
        } else if (options.sdp) {
            if (type === 'data') {
                connection.answer(manager.handleSDP.bind(manager, 'offer', connection, options.sdp));
            } else if (type === 'media') {
                connection.answer(function () {
                    var stream;

                    if (connection.session() === 'both') {
                        connection.constraints({
                            mandatory: {
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: true
                            }
                        });
                        stream = connection.provider.video();
                    } else if (connection.session() === 'audio') {
                        connection.constraints({
                            mandatory: {
                                offerToReceiveAudio: true,
                                offerToReceiveVideo: false
                            }
                        });
                        stream = connection.provider.audio();
                    } else if (connection.session() === 'video') {
                        connection.constraints({
                            mandatory: {
                                offerToReceiveAudio: false,
                                offerToReceiveVideo: true
                            }
                        });
                        stream = connection.provider.video();
                    }
                    connection.addLocalStream(stream);
                    manager.handleSDP('offer', connection, options.sdp);
                });
            }
        }
    };

// media
    function mediaConnection(provider, peer, options) {
        var mc = emitter(),
            store = {
                open: false,
                remoteStream: null,
                setLocalDescription: false,
                setRemoteDescription: false,
                start: function () {},
                answer: function () {}
            };

        if (!provider || !peer || typeof peer !== 'string') {
            return;
        }
        if (typeOf(options) !== 'object') {
            options = {};
        }
        mc.options = options;
        store.session = options.session || 'both';
        store.constraints =  options.constraints || {
            optional: [],
            mandatory: {}
        };
        store.metadata = options.metadata || '';
        mc.id = options.id || 'mc_' + utils.uuid();
        mc.peer = peer;
        mc.provider = provider;
        mc.type = 'media';
        mc.on('error', function (err) {
            console.log(err);
        });
        mc.metadata = function (metadata) {
            if (metadata) {
                store.metadata = metadata;
            }
            return store.metadata;
        };
        mc.session = function (session) {
            if (typeof session === 'string') {
                store.session = session;
            }
            return store.session;
        };
        mc.descriptions = function (type, set) {
            if (type === 'local') {
                if (typeof set === 'boolean') {
                    store.setLocalDescription = set;
                }
                return store.setLocalDescription;
            } else if (type === 'remote') {
                if (typeof set === 'boolean') {
                    store.setRemoteDescription = set;
                }
                return store.setRemoteDescription;
            }
        };
        mc.constraints = function (constraints) {
            if (typeof constraints === 'object') {
                store.contsraints = constraints;
            }
            return store.constraints;
        };
        mc.start = function (start) {
            if (typeof start === 'function') {
                return store.start = start;
            }
            store.start();
        };
        mc.answer = function (answer) {
            if (typeof answer === 'function') {
                return store.answer = answer;
            }
            store.answer();
        };
        mc.pc = function (pc) {
            if (pc) {
                store.pc = pc;
            }
            return store.pc;
        };
        mc.openConnection = function () {
            store.open = true;
            mc.emit('open');
        };
        mc.addLocalStream = function (stream) {
            if (!store.pc || !stream) {
                return;
            }
            store.pc.addStream(stream);
        };
        mc.addRemoteStream = function (stream) {
            if (!store.pc || !stream) {
                return;
            }
            store.remoteStream = stream;
            mc.emit('stream', stream);
        };
        mc.toggleRemoteMedia = function (type) {
            var tracks,
                stream = store.remoteStream;

            if (!stream) {
                return;
            }
            if (type === 'audio') {
                tracks = stream.getAudioTracks();
            } else if (type === 'video') {
                tracks = stream.getVideoTracks();
            } else if (type === 'both') {
                tracks = stream.getAudioTracks();
                tracks.concat(stream.getVideoTracks());
            }
            tracks.forEach(function (track) {
                if (track) {
                    track.enabled = !track.enabled;
                }
            });
        };
        mc.toggleLocalMedia = function (type) {
            var tracks,
                stream = type === 'audio' ? mc.provider.audio : mc.provider.video;

            if (!stream) {
                return;
            }
            if (type === 'audio') {
                tracks = stream.getAudioTracks();
            } else if (type === 'video') {
                tracks = stream.getVideoTracks();
            } else if (type === 'both') {
                tracks = stream.getAudioTracks();
                tracks.concat(stream.getVideoTracks());
            }
            tracks.forEach(function (track) {
                if (track) {
                    track.enabled = !track.enabled;
                }
            });
        };
        mc.getStats = function (callback) {
            if (utils.browser.name === 'mozilla') {
                store.pc.getStats(null, function (report) {
                    callback(report);
                }, callback);
            } else if (utils.browser.name === 'chrome') {
                store.pc.getStats(function (report) {
                    var items = [];

                    report.result().forEach(function (result) {
                        var item = {};

                        result.names().forEach(function (name) {
                            item[name] = result.stat(name);
                        });
                        item.id = result.id;
                        item.type = result.type;
                        item.timestamp = result.timestamp;
                        items.push(item);
                    });
                    callback(items);
                }, callback);
            }
        };
        mc.close = function () {
            var pc = store.pc;

            if (store.open === false) {
                return;
            }
            if (pc && (pc.readyState !== 'closed' || pc.signalingState !== 'closed')) {
                pc.close();
                store.pc = null;
            }
            store.open = false;
            mc.emit('close');
            mc.provider.removeConnection(mc);
            mc.provider.socket.send('end', JSON.stringify({id: mc.id}), mc.peer);
        };
        mc = Object.freeze(mc);
        manager.startPeerConnection(mc);
        return mc;
    }

// data
    function dataConnection(provider, peer, options) {
        var dc = emitter(),
            store = {
                open: false,
                buffer: {},
                queue: [],
                incomingBlacklist: [],
                outgoingBlacklist: [],
                sending: null,
                setRemoteDescription: false,
                setLocalDescription: false,
                lastPacketSent: null,
                lastPacketReceived: null,
                dataChannel: null,
                start: function () {},
                answer: function () {}
            };

        if (!provider || !peer || typeof peer !== 'string') {
            return;
        }
        if (typeOf(options) !== 'object') {
            options = {};
        }
        dc.options = options;
        store.session = 'none';
        store.constraints = options.constraints || {
            optional: [],
            mandatory: {
                offerToReceiveVideo: false,
                offerToReceiveAudio: false
            }
        };
        store.metadata = options.metadata || '';
        dc.id = options.id || 'dc_' + utils.uuid();
        dc.label = options.label || dc.id;
        dc.peer = peer;
        dc.provider = provider;
        dc.reliable = options.reliable || utils.supports.sctp;
        dc.type = 'data';
        dc.on('error', function (err) {
            console.log(err);
        });
        dc.metadata = function (metadata) {
            if (metadata) {
                store.metadata = metadata;
            }
            return store.metadata;
        };
        dc.session = function (session) {
            if (typeof session === 'string') {
                store.session = session;
            }
            return store.session;
        };
        dc.descriptions = function (type, set) {
            if (type === 'local') {
                if (typeof set === 'boolean') {
                    store.setLocalDescription = set;
                }
                return store.setLocalDescription;
            } else if (type === 'remote') {
                if (typeof set === 'boolean') {
                    store.setRemoteDescription = set;
                }
                return store.setRemoteDescription;
            }
        };
        dc.constraints = function (constraints) {
            if (typeof constraints === 'object') {
                store.contsraints = constraints;
            }
            return store.constraints;
        };
        dc.start = function (start) {
            if (typeof start === 'function') {
                return store.start = start;
            }
            store.start();
        };
        dc.answer = function (answer) {
            if (typeof answer === 'function') {
                return store.answer = answer;
            }
            store.answer();
        };
        dc.pc = function (pc) {
            if (pc) {
                store.pc = pc;
            }
            return store.pc;
        };
        dc.initialize = function (dataChannel) {
            if (!dataChannel) {
                return;
            }
            store.dataChannel = dataChannel;
            if (utils.supports.sctp) {
                store.dataChannel.binaryType = 'arraybuffer';
            }
            store.dataChannel.onopen = dc.openConnection.bind(dc);
            store.dataChannel.onmessage = dc.parseData.bind(dc);
            store.dataChannel.onclose = dc.close.bind(dc);
            store.dataChannel.onerror = dc.emit.bind(dc, 'error');
        };
        dc.openConnection = function () {
            store.open = true;
            dc.emit('open');
        };
        dc.cancelReceive = function (id, remote) {
            if (!id || typeof id !== 'number') {
                id = store.lastPacketReceived && store.lastPacketReceived.id;
            }
            if (!id) {
                return;
            }
            if (store.incomingBlacklist.indexOf(id) === -1) {
                store.incomingBlacklist.push(id);
                dc.emit('cancel-receive', id);
            }
            if (store.buffer.hasOwnProperty(id)) {
                delete store.buffer[id];
            }
            if (!remote) {
                store.dataChannel.send(JSON.stringify({type: 'cancel-receive', id: id}));
            }
        };
        dc.receiveData = function (data) {
            var chunks,
                type = data.type,
                id = data.id,
                count = data.count,
                total = data.total,
                metadata = data.metadata,
                payload = data.payload,
                combined;

            if (!type || !id || !count || !total || store.incomingBlacklist.indexOf(id) !== -1) {
                return;
            }
            if (!store.buffer.hasOwnProperty(id)) {
                store.buffer[id] = [];
            }
            chunks = store.buffer[id];
            chunks.push(payload);
            store.lastPacketReceived = data;
            dc.emit('chunk-received', {
                type: type,
                id: id,
                total: total,
                count: count,
                metadata: metadata
            });
            if (chunks.length !== total) {
                return;
            }
            if (type === 1) {
                combined = chunks.join('');
            } else {
                combined = new Uint8Array((total - 1) * utils.chunksize + payload.length);
                chunks.forEach(function (chunk, index) {
                    combined.set(chunk, index * utils.chunksize);
                });
            }
            if (typeOf(metadata) === 'object' && metadata.name && metadata.type) {
                if (type === 1) {
                    utils.downloadDataURL(combined, metadata.name);
                } else {
                    utils.downloadDataURL(global.URL.createObjectURL(new Blob([combined.buffer], {type: metadata.type})), metadata.name);
                }
            } else {
                dc.emit('data', {
                    type: type,
                    id: id,
                    payload: combined,
                    metadata: metadata
                });
            }
            delete store.buffer[id];
        };
        dc.parseData = function (e) {
            var data = e.data || e,
                filereader,
                packet,
                view;

            if (data instanceof Blob) {
                filereader = new FileReader();
                filereader.onloadend = function () {
                    if (filereader.readyState !== 2 || !filereader.result) {
                        return;
                    }
                    dc.parseData(filereader.result);
                };
                filereader.readAsArrayBuffer(data);
            } else if (data instanceof ArrayBuffer) {
                view = betterview(data);
                packet = {
                    type: view.getUint8(),
                    id: view.getUint32(),
                    count: view.getUint32(),
                    total: view.getUint32()
                };
                packet.metadata = utils.parse(view.getString(view.getUint32()));
                packet.payload = packet.type === 1 ? view.getString() : view.getBytes();
            } else if (utils.parsable(data)) {
                packet = utils.parse(data);
                if (packet.type === 'cancel-send') {
                    dc.cancelReceive(packet.id, true);
                    return;
                }
                if (packet.type === 'cancel-receive') {
                    dc.cancelSend(packet.id, true);
                    return;
                }
                packet.metadata = utils.parse(packet.metadata);
            }
            if (packet) {
                dc.receiveData(packet);
            }
        };
        dc.sendChunks = function () {
            var chunk,
                info = {},
                data;

            chunk = store.queue.shift();
            if (!chunk) {
                global.clearTimeout(store.sending);
                store.sending = null;
                return;
            }
            if (chunk.betterview === true) {
                chunk.seek(0);
                info.type = chunk.getUint8();
                info.id = chunk.getUint32();
                info.count = chunk.getUint32();
                info.total = chunk.getUint32();
                info.metadata = utils.parse(chunk.getString(chunk.getUint32()));
                chunk.seek(0);
                data = chunk.getBytes();
            } else if (typeOf(chunk) === 'object') {
                info.type = chunk.type;
                info.id = chunk.id;
                info.count = chunk.count;
                info.total = chunk.total;
                info.metadata = utils.parse(chunk.metadata);
                data = utils.stringify(chunk);
            }
            if (store.outgoingBlacklist.indexOf(info.id) !== -1) {
                return;
            }
            store.dataChannel.send(data);
            store.lastPacketSent = info;
            dc.emit('chunk-sent', info);
            store.sending = global.setTimeout(dc.sendChunks.bind(dc), utils.sendTimeout);
        };
        dc.send = (function () {
            var gid = (function () {
                var i = 0,
                    maxint = Math.pow(2, 53) - 1;

                return function () {
                    i += 1;
                    if (i > maxint) {
                        store.incomingBlacklist = [];
                        store.outgoingBlacklist = [];
                        i = 1;
                    }
                    return i;
                };
            }());

            function sendMessage(data, metadata) {
                var type = typeof data === 'string' ? 1 : 2,
                    chunksize = utils.chunksize,
                    size = data.size || data.byteLength || data.length,
                    total = Math.ceil(size / chunksize),
                    start = 0,
                    end = start + chunksize < size ? start + chunksize : size,
                    count = 1,
                    id = gid(),
                    chunk;

                function process() {
                    var filereader = new FileReader();

                    if (data instanceof Blob) {
                        filereader.onloadend = function (e) {
                            var result = e.target.result;

                            if (filereader.readyState !== 2 || !result) {
                                return;
                            }
                            process(result);
                        };
                        filereader.readAsArrayBuffer(data.slice(start, end));
                        return;
                    }
                    if (utils.supports.sctp) {
                        chunk = betterview(17 + metadata.length + end - start);
                        chunk.writeUint8(type);
                        chunk.writeUint32(id);
                        chunk.writeUint32(count);
                        chunk.writeUint32(total);
                        chunk.writeUint32(metadata.length);
                        chunk.writeString(metadata);
                        if (type === 1) {
                            chunk.writeString(data.slice(start, end));
                        } else {
                            chunk.writeBytes(data);
                        }
                    } else {
                        chunk = {
                            type: type,
                            id: id,
                            count: count,
                            total: total,
                            metadata: metadata,
                            payload: data
                        };
                    }
                    if (store.outgoingBlacklist.indexOf(id) !== -1) {
                        return;
                    }
                    store.queue.push(chunk);
                    start = end;
                    count += 1;
                    if (end < size) {
                        end = start + chunksize < size ? start + chunksize : size;
                        process();
                    }
                    if (!store.sending) {
                        dc.sendChunks();
                    }
                }

                metadata = utils.stringify(metadata);
                if (typeof metadata !== 'string') {
                    metadata = '';
                }
                process();
            }

            return function send(data, metadata) {
                if (!store.open || !store.dataChannel) {
                    return;
                }
                if (data instanceof File) {
                    metadata = {
                        data: metadata,
                        name: data.name,
                        type: data.type
                    };
                }
                if (data instanceof Blob) {
                    sendMessage(data, metadata);
                } else if (data instanceof ArrayBuffer || typeof data === 'string') {
                    sendMessage(data, metadata);
                } else if (typeof data !== 'string' && utils.stringifiable(data)) {
                    sendMessage(utils.stringify(data), metadata);
                }
            };
        }());
        dc.cancelSend = function (id, remote) {
            if (!id || typeof id !== 'number') {
                id = store.lastPacketSent && store.lastPacketSent.id;
            }
            if (!id) {
                return;
            }
            if (store.sending) {
                global.clearTimeout(store.sending);
                store.sending = null;
            }
            if (store.outgoingBlacklist.indexOf(id) === -1) {
                store.outgoingBlacklist.push(id);
                dc.emit('cancel-send', id);
            }
            store.queue = [];
            if (!remote) {
                store.dataChannel.send(JSON.stringify({type: 'cancel-send', id: id}));
            }
        };
        dc.getStats = function (callback) {
            if (utils.browser.name === 'mozilla') {
                store.pc.getStats(null, function (report) {
                    callback(report);
                }, callback);
            } else if (utils.browser.name === 'chrome') {
                store.pc.getStats(function (report) {
                    var items = [];

                    report.result().forEach(function (result) {
                        var item = {};

                        result.names().forEach(function (name) {
                            item[name] = result.stat(name);
                        });
                        item.id = result.id;
                        item.type = result.type;
                        item.timestamp = result.timestamp;
                        items.push(item);
                    });
                    callback(items);
                }, callback);
            }
        };
        dc.close = function () {
            var pc = dc.pc();

            if (!store.open) {
                return;
            }
            if (store.dataChannel) {
                store.dataChannel.close();
            }
            if (pc && (pc.readyState !== 'closed' || pc.signalingState !== 'closed')) {
                pc.close();
                store.pc = null;
            }
            store.open = false;
            dc.emit('close');
            dc.provider.removeConnection(dc);
            dc.provider.socket.send('end', JSON.stringify({id: dc.id}), dc.peer);
        };
        dc = Object.freeze(dc);
        manager.startPeerConnection(dc);
        return dc;
    }

// peer
    function getPeer(user, room, options) {
        var pro = emitter(),
            store = {
                connections: {},
                open: false,
                audio: null,
                video: null
            };

        if (!user || typeof user !== 'string' || !room || typeof room !== 'string') {
            return;
        }
        if (typeOf(options) !== 'object') {
            options = {};
        }
        pro.config = options.config || utils.defaultConfig;
        pro.options = options;
        pro.user = user;
        pro.socket = rtgo.socket.join(room);
        pro.openConnection = function () {
            store.open = true;
            pro.emit('open');
        };
        pro.video = function (stream) {
            if (stream) {
                store.video = stream;
            }
            return store.video;
        };
        pro.audio = function (stream) {
            if (stream) {
                store.audio = stream;
            }
            return store.audio;
        };
        pro.getMedia = function (type) {
            var constraints = {
                    audio: false,
                    video: false
                };

            function success(stream) {
                if (type === 'video') {
                    store.video = stream;
                } else if (type === 'audio') {
                    store.audio = stream;
                } else {
                    store.video = stream;
                    store.audio = stream;
                }
                pro.emit('media-success', type, stream);
            }

            function failure(err) {
                switch (err) {
                case 'PERMISSION_DENIED':
                    console.log('The user denied permission to use a media device required for the operation.');
                    break;
                case 'NOT_SUPPORTED_ERROR':
                    console.log('A constraint specified is not supported by the browser.');
                    break;
                case 'MANDATORY_UNSATISFIED_ERROR':
                    console.log('No media tracks of the type specified in the constraints are found.');
                    break;
                default:
                    break;
                }
                pro.emit('media-failure', type, err);
            }

            if (type === 'audio' || type === 'video') {
                constraints[type] = true;
            } else {
                constraints.audio = true;
                constraints.video = true;
            }
            navigator.getUserMedia(constraints, success, failure);
        };
        pro.chat = function (peer, options) {
            var connection,
                members = pro.socket.members();

            if (!store.open || typeof peer !== 'string' || members.indexOf(peer) === -1) {
                return;
            }
            options = typeOf(options) === 'object' ? options : {};
            options.originator = true;
            connection = dataConnection(pro, peer, options);
            pro.addConnection(connection);
            return connection;
        };
        pro.call = function (peer, options) {
            var connection,
                members = pro.socket.members();

            if (!store.open || typeof peer !== 'string' || members.indexOf(peer) === -1) {
                return;
            }
            options = typeOf(options) === 'object' ? options : {};
            options.originator = true;
            connection = mediaConnection(pro, peer, options);
            pro.addConnection(connection);
            return connection;
        };
        pro.getConnection = function (peer, id) {
            if (typeof peer !== 'string' || typeof id !== 'string' || !store.connections.hasOwnProperty(peer)) {
                return;
            }
            return store.connections[peer][id];
        };
        pro.addConnection = function (connection) {
            var peer,
                id;

            if (!connection) {
                return;
            }
            peer = connection.peer;
            id = connection.id;
            if (!store.connections.hasOwnProperty(peer)) {
                store.connections[peer] = {};
            }
            store.connections[peer][id] = connection;
        };
        pro.removeConnection = function (connection) {
            var id,
                peer;

            if (!connection) {
                return;
            }
            peer = connection.peer;
            id = connection.id;
            if (store.connections.hasOwnProperty(peer) && store.connections[peer].hasOwnProperty(id)) {
                connection.close();
                delete store.connections[peer][id];
            }
        };
        pro.gotCandidate = function (data, peer) {
            var payload = JSON.parse(utils.getStringFromCodes(data)),
                connection = pro.getConnection(peer, payload.id);

            if (!connection || !payload.candidate) {
                return;
            }
            if (!connection.descriptions('local')) {
                manager.storeCandidate(connection, payload.candidate);
            } else {
                manager.handleCandidate(connection, payload.candidate);
            }
        };
        pro.gotAnswer = function (data, peer) {
            var payload = JSON.parse(utils.getStringFromCodes(data)),
                connection = pro.getConnection(peer, payload.id);

            if (connection && payload.sdp) {
                manager.handleSDP(payload.type, connection, payload.sdp);
            }
        };
        pro.gotOffer = function (data, peer) {
            var payload = JSON.parse(utils.getStringFromCodes(data)),
                connection = pro.getConnection(peer, payload.id);

            if (connection || !payload.id || !payload.sdp) {
                return;
            }
            if (payload.type === 'media') {
                connection = mediaConnection(pro, peer, payload);
                pro.addConnection(connection);
                pro.emit('call', connection);
            } else if (payload.type === 'data') {
                connection = dataConnection(pro, peer, payload);
                pro.addConnection(connection);
                pro.emit('chat', connection);
            }
        };
        pro.end = function (data, peer) {
            var payload = JSON.parse(utils.getStringFromCodes(data)),
                connection = pro.getConnection(peer, payload.id);

            if (connection) {
                connection.close();
            }
        };
        pro.cleanupPeer = function (peer) {
            if (typeof peer !== 'string' || !store.connections.hasOwnProperty(peer)) {
                return;
            }
            Object.keys(store.connections[peer]).forEach(function (id) {
                store.connections[peer][id].close();
                delete store.connections[peer][id];
            }, pro);
        };
        pro.cleanup = function () {
            Object.keys(store.connections).forEach(function (peer) {
                pro.cleanupPeer(peer);
            }, pro);
        };
        pro.destroy = function (msg) {
            pro.cleanup();
            if (typeof msg === 'string') {
                pro.emit('error', msg);
            }
        };
        pro.close = function () {
            store.open = false;
            pro.emit('close');
        };
        pro.error = function (e) {
            pro.emit('error', e);
        };
        pro.socket.on('open', pro.openConnection.bind(pro), false);
        pro.socket.on('error', pro.error.bind(pro), false);
        pro.socket.on('close', pro.close.bind(pro), false);
        pro.socket.on('offer', pro.gotOffer.bind(pro), false);
        pro.socket.on('answer', pro.gotAnswer.bind(pro), false);
        pro.socket.on('candidate', pro.gotCandidate.bind(pro), false);
        pro.socket.on('end', pro.end.bind(pro), false);
        pro.socket.on('joined', pro.emit.bind(pro, 'joined'));
        pro.socket.on('left', pro.emit.bind(pro, 'left'));
        if (pro.socket.open()) {
            pro.openConnection();
        }
        return Object.freeze(pro);
    }


    function proficient(user, room, options) {
        return getPeer(user, room, options);
    };
    global.proficient = Object.freeze(proficient);

}(window || this));
