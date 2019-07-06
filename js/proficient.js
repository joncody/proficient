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
    var getPC = function (connection) {
        var pc = new RTCPeerConnection(null);

        pc.onnegotiationneeded = function (e) {
            connection.emit("negotiationneeded");
        };
        pc.onicecandidate = function (e) {
            var candidate = e.candidate;

            if (!candidate) {
                return;
            }
            connection.emit("candidate", e, candidate);
        };
        pc.onicecandidateerror = function (e) {
            connection.emit("icecandidateerror", e);
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
            connection.emit("signalingstatechange", state, e);
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
            connection.emit("iceconnectionstatechange", state, e);
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
            connection.emit("icegatheringstatechange", state, e);
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
            connection.emit("connectionstatechange", state, e);
        };
        return pc;
    };

    function mediaConnection(provider, peer, options) {
        var mc = gg.emitter();
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
                var audioSender = stream && stream.getAudioTracks().length > 0
                    ? pc.addTrack(stream.getAudioTracks()[0], stream)
                    : null;

                return function (sender) {
                    if (!gg.isUndefined(sender)) {
                        audioSender = sender;
                    }
                    return audioSender;
                };
            }());
            mc.video = (function () {
                var videoSender = stream && stream.getVideoTracks().length > 0
                    ? pc.addTrack(stream.getVideoTracks()[0], stream)
                    : null;

                return function (sender) {
                    if (!gg.isUndefined(sender)) {
                        videoSender = sender;
                    }
                    return videoSender;
                };
            }());
            pc.ontrack = function (e) {
                mc.emit("track", e, e.streams);
            };
            if (mc.initiator === true) {
                mc.start = function () {
                    var offerOptions = {
                        offerToReceiveAudio: mc.audio() ? 1 : 0,
                        offerToReceiveVideo: mc.video() ? 1 : 0
                    };

                    pc.createOffer(offerOptions).then(function (offer) {
                        return pc.setLocalDescription(offer);
                    }).then(function () {
                        mc.emit("local-description");
                    }).catch(function (err) {
                        console.log(err);
                    });
                };
            } else {
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

    function dataConnection(provider, peer, options) {
        var dc = gg.emitter();
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
                dc.emit("message", e.data);
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
                    dc.emit("channel", dc.channel());
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
        var pro = gg.emitter();
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
        pro.addConnection = function (connection) {
            if (!store.connections.hasOwnProperty(connection.peer)) {
                store.connections[connection.peer] = {
                    media: {},
                    data: {}
                };
            }
            store.connections[connection.peer][connection.type][connection.id] = connection;
        };
        pro.remConnection = function (connection) {
            if (!store.connections.hasOwnProperty(connection.peer)) {
                return;
            }
            if (!store.connections[connection.peer][connection.type].hasOwnProperty(connection.id)) {
                return;
            }
            delete store.connections[connection.peer][connection.type][connection.id];
        };
        pro.getConnection = function (peer, type, id) {
            if (!store.connections.hasOwnProperty(peer)) {
                return;
            }
            if (!store.connections[peer][type].hasOwnProperty(id)) {
                return;
            }
            return store.connections[peer][type][id];
        };
        pro.gotCandidate = function (peer, msg) {
            var jsonmsg = JSON.parse(msg);
            var connection = pro.getConnection(peer, jsonmsg.type, jsonmsg.id);

            if (!connection) {
                return;
            }
            connection.pc.addIceCandidate(jsonmsg.candidate).then(function () {
                connection.emit("add-candidate", jsonmsg.candidate);
            }).catch(function (err) {
                connection.emit("error", err);
            });
        };
        pro.gotAnswer = function (peer, msg) {
            var jsonmsg = JSON.parse(msg);
            var connection = pro.getConnection(peer, jsonmsg.type, jsonmsg.id);

            if (!connection) {
                return;
            }
            connection.pc.setRemoteDescription(jsonmsg.sdp).then(function () {
                connection.emit("remote-description");
            }).catch(function (err) {
                connection.emit("error", err);
            });
        };
        pro.gotOffer = function (peer, msg) {
            var jsonmsg = JSON.parse(msg);
            var connection = pro.getConnection(peer, jsonmsg.type, jsonmsg.id);

            if (connection) {
                return;
            }
            connection = jsonmsg.type === "data"
                ? dataConnection(pro, peer, jsonmsg)
                : mediaConnection(pro, peer, jsonmsg);
            pro.addConnection(connection);
            pro.emit(jsonmsg.type === "data"
                ? "chat"
                : "call", connection);
        };
        pro.chat = function (peer) {
            var connection = dataConnection(pro, peer, { initiator: true });

            pro.addConnection(connection);
            return connection;
        };
        pro.call = function (peer) {
            var connection = mediaConnection(pro, peer, { initiator: true });

            pro.addConnection(connection);
            return connection;
        };
        pro.store = store;
        return Object.freeze(pro);
    }

    global.proficient = Object.freeze(proficient);

}(window || this));
