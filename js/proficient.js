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
    "use strict";

    var getID = (function () {
        var maxint = Math.pow(2, 53) - 1;
        var ids = {};

        return function (peer, type, id) {
            if (!gg.isString(peer) || !(type === "data" || type === "media")) {
                return;
            }
            if (!ids.hasOwnProperty(peer)) {
                ids[peer] = {
                    media: 0,
                    data: 0
                };
            }
            if (gg.isNumber(id) && id <= maxint) {
                ids[peer][type] = id;
            } else {
                ids[peer][type] = ids[peer][type] < maxint
                    ? ids[peer][type] + 1
                    : 1;
            }
            return ids[peer][type];
        };
    }());
    var getPC = function (conn) {
        var pc = new RTCPeerConnection(null);

        pc.onnegotiationneeded = function (e) {
            conn.emit("negotiationneeded");
        };
        pc.onicecandidate = function (e) {
            var candidate = e.candidate;

            if (!candidate) {
                return;
            }
            conn.emit("candidate", candidate, e);
        };
        pc.onicecandidateerror = function (e) {
            conn.emit("icecandidateerror", e);
        };
        pc.onsignalingstatechange = function (e) {
            var state = pc.signalingState;

            switch (state) {
                case "stable":
                    break;
                case "have-local-offer":
                    break;
                case "have-remote-offer":
                    break;
                case "have-local-pranswer":
                    break;
                case "have-remote-pranswer":
                    break;
                case "closed":
                    break;
                default:
                    break;
            }
            conn.emit("signalingstatechange", state, e);
        };
        pc.oniceconnectionstatechange = function (e) {
            var state = pc.iceConnectionState;

            switch (state) {
                case "new":
                    break;
                case "checking":
                    break;
                case "connected":
                    break;
                case "completed":
                    break;
                case "failed":
                    break;
                case "disconnected":
                    break;
                case "closed":
                    break;
                default:
                    break;
            }
            conn.emit("iceconnectionstatechange", state, e);
        };
        pc.onicegatheringstatechange = function (e) {
            var state = pc.iceGatheringState;

            switch (state) {
                case "new":
                    break;
                case "gathering":
                    break;
                case "complete":
                    break;
                default:
                    break;
            }
            conn.emit("icegatheringstatechange", state, e);
        };
        pc.onconnectionstatechange = function (e) {
            var state = pc.connectionState;

            switch (state) {
                case "new":
                    break;
                case "connecting":
                    break;
                case "connected":
                    break;
                case "disconnected":
                    break;
                case "failed":
                    break;
                case "closed":
                    break;
                default:
                    break;
            }
            conn.emit("connectionstatechange", state, e);
        };
        return pc;
    };

    function mediaConn(provider, peer, options) {
        var mc = emitter();
        var store = {
            sdp: null,
            quiet: false
        };

        mc.emit = (function () {
            var oldemit = mc.emit;

            return function () {
                var args = gg.toArray(arguments);

                if (!store.quiet) {
                    oldemit.apply(mc, args);
                    args[0] = "conn-" + args[0];
                    args.splice(1, 0, mc);
                    mc.provider.emit.apply(mc.provider, args);
                }
            };
        }());
        options = gg.extend({}, options, true);
        mc.provider = provider;
        mc.peer = peer;
        mc.type = "media";
        mc.id = getID(peer, "media", options.id);
        mc.name = "mc_" + peer + "_" + mc.id;
        mc.initiator = !!options.initiator;
        if (mc.initiator === false) {
            store.sdp = options.sdp;
        }
        mc.pc = (function () {
            var pc = getPC(mc);
            var stream = mc.provider.stream();

            mc.audio = (function () {
                var audio = pc.addTransceiver("audio");

                audio.sender.replaceTrack(stream.getAudioTracks()[0]);
                return function (transceiver) {
                    if (!gg.isUndefined(transceiver)) {
                        audio = transceiver;
                    }
                    return audio;
                };
            }());
            mc.video = (function () {
                var video = pc.addTransceiver("video");

                video.sender.replaceTrack(stream.getVideoTracks()[0]);
                return function (transceiver) {
                    if (!gg.isUndefined(transceiver)) {
                        video = transceiver;
                    }
                    return video;
                };
            }());
            if (mc.initiator === true) {
                mc.start = function () {
                    pc.createOffer().then(function (offer) {
                        return pc.setLocalDescription(offer);
                    }).then(function () {
                        mc.emit("local-description");
                    }).catch(function (err) {
                        console.log(err);
                    });
                };
            } else {
                pc.ontrack = function (e) {
                    if (!e.transceiver) {
                        return;
                    }
                    if (e.track.kind === "audio") {
                        mc.audio(e.transceiver).direction = "sendrecv";
                        mc.audio().sender.replaceTrack(stream.getAudioTracks()[0]);
                    } else if (e.track.kind === "video") {
                        mc.video(e.transceiver).direction = "sendrecv";
                        mc.video().sender.replaceTrack(stream.getVideoTracks()[0]);
                    }
                    mc.emit("track");
                };
                mc.answer = function () {
                    pc.setRemoteDescription(store.sdp).then(function () {
                        mc.emit("remote-description");
                        return pc.createAnswer();
                    }).then(function (answer) {
                        return pc.setLocalDescription(answer);
                    }).then(function () {
                        mc.emit("local-description");
                    }).catch(function (err) {
                        console.log(err);
                    });
                };
            }
            return pc;
        }());
        mc.quiet = function (bool) {
            if (gg.isBoolean(bool)) {
                store.quiet = bool;
            }
            return store.quiet;
        };
        return Object.freeze(mc);
    }

    function dataConn(provider, peer, options) {
        var dc = emitter();
        var store = {
            quiet: false,
            sdp: null,
            channel: null
        };

        dc.emit = (function () {
            var oldemit = dc.emit;

            return function () {
                var args = gg.toArray(arguments);

                if (!store.quiet) {
                    oldemit.apply(dc, args);
                    args[0] = "conn-" + args[0];
                    args.splice(1, 0, dc);
                    dc.provider.emit.apply(dc.provider, args);
                }
            };
        }());
        options = gg.extend({}, options, true);
        dc.provider = provider;
        dc.peer = peer;
        dc.type = "data";
        dc.id = getID(peer, "data", options.id);
        dc.name = "dc_" + peer + "_" + dc.id;
        dc.initiator = !!options.initiator;
        if (dc.initiator === false) {
            store.sdp = options.sdp;
        }
        dc.channel = function (channel) {
            if (!gg.isUndefined(channel)) {
                store.channel = channel;
            }
            return store.channel;
        };
        dc.setup = function () {
            var channel = store.channel;

            if (!channel) {
                return;
            }
            channel.binaryType = "arraybuffer";
            channel.onopen = function () {
                dc.emit("open");
            };
            channel.onmessage = function (e) {
                var data = JSON.parse(gg.getStringFromCodes(e.data));

                dc.emit("message", data);
            };
            channel.onclose = function () {
                dc.emit("close");
            };
            channel.onerror = function (err) {
                dc.emit("error", err);
            };
        };
        dc.pc = (function () {
            var pc = getPC(dc);

            if (dc.initiator === true) {
                dc.channel(pc.createDataChannel(dc.name, { ordered: true }));
                dc.setup();
                dc.start = function () {
                    pc.createOffer().then(function (offer) {
                        return pc.setLocalDescription(offer);
                    }).then(function () {
                        dc.emit("local-description");
                    }).catch(function (err) {
                        console.log(err);
                    });
                };
            } else {
                pc.ondatachannel = function (e) {
                    var channel = e.channel;

                    if (!channel) {
                        return;
                    }
                    dc.channel(channel);
                    dc.setup();
                };
                dc.answer = function () {
                    pc.setRemoteDescription(store.sdp).then(function () {
                        dc.emit("remote-description");
                        return pc.createAnswer();
                    }).then(function (answer) {
                        return pc.setLocalDescription(answer);
                    }).then(function () {
                        dc.emit("local-description");
                    }).catch(function (err) {
                        console.log(err);
                    });
                };
            }
            return pc;
        }());
        dc.quiet = function (bool) {
            if (gg.isBoolean(bool)) {
                store.quiet = bool;
            }
            return store.quiet;
        };
        return Object.freeze(dc);
    }

    function proficient(name, room) {
        var pro = emitter();
        var store = {
            connections: {},
            stream: null
        };

        if (!name || !gg.isString(name) || !room || !gg.isString(room)) {
            return;
        }
        pro.name = name;
        pro.room = room;
        pro.stream = function (stream) {
            if (!gg.isUndefined(stream)) {
                store.stream = stream;
            }
            return store.stream;
        };
        pro.getMedia = function (type) {
            var constraints = {
                audio: false,
                video: false
            };

            function success(stream) {
                store.stream = stream;
                pro.emit("media", type, stream);
            }

            function failure(err) {
                pro.emit("error", type, err);
            }

            if (type === "audio" || type === "video") {
                constraints[type] = true;
            } else {
                type = "both";
                constraints.audio = true;
                constraints.video = true;
            }
            navigator.mediaDevices.getUserMedia(constraints).then(success).catch(failure);
        };
        pro.addConn = function (conn) {
            if (!store.connections.hasOwnProperty(conn.peer)) {
                store.connections[conn.peer] = {};
            }
            store.connections[conn.peer][conn.id] = conn;
        };
        pro.remConn = function (conn) {
            if (!store.connections.hasOwnProperty(conn.peer)) {
                return;
            }
            if (!store.connections[conn.peer].hasOwnProperty(conn.id)) {
                return;
            }
            delete store.connections[conn.peer][conn.id];
        };
        pro.getConn = function (peer, id) {
            if (!store.connections.hasOwnProperty(peer)) {
                return;
            }
            if (!store.connections[peer].hasOwnProperty(id)) {
                return;
            }
            return store.connections[peer][id];
        };
        pro.gotCandidate = function (peer, msg) {
            var jsonmsg = JSON.parse(msg);
            var conn = pro.getConn(peer, jsonmsg.id);

            if (!conn) {
                return;
            }
            conn.pc.addIceCandidate(jsonmsg.candidate).then(function () {
                pro.emit("add-candidate", jsonmsg.candidate);
            }).catch(function (err) {
                pro.emit("error", err);
            });
        };
        pro.gotAnswer = function (peer, msg) {
            var jsonmsg = JSON.parse(msg);
            var conn = pro.getConn(peer, jsonmsg.id);

            if (!conn) {
                return;
            }
            conn.pc.setRemoteDescription(jsonmsg.sdp).then(function () {
                conn.emit("remote-description");
            }).catch(function (err) {
                conn.emit("error", err);
            });
        };
        pro.gotOffer = function (peer, msg) {
            var jsonmsg = JSON.parse(msg);
            var conn = pro.getConn(peer, jsonmsg.id);

            if (conn) {
                return;
            }
            conn = jsonmsg.type === "data"
                ? dataConn(pro, peer, jsonmsg)
                : mediaConn(pro, peer, jsonmsg);
            pro.emit(jsonmsg.type === "data"
                ? "chat"
                : "call", conn);
        };
        pro.chat = function (peer) {
            var conn = dataConn(pro, peer, { initiator: true });

            pro.addConn(conn);
            return conn;
        };
        pro.call = function (peer) {
            var conn = mediaConn(pro, peer, { initiator: true });

            pro.addConn(conn);
            return conn;
        };
        return Object.freeze(pro);
    }

    global.proficient = Object.freeze(proficient);

}(window || this));
