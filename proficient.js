"use strict";

import utils from "./include/utils.js";
import emitter from "./include/emitter.js";

const global = globalThis || window || this;

const getID = (function () {
    const maxint = Math.pow(2, 53) - 1;
    const ids = {};

    return function (peer, type, id) {
        if (!utils.isString(peer) || !(type === "data" || type === "media")) {
            return;
        }
        if (!ids.hasOwnProperty(peer)) {
            ids[peer] = {
                media: 0,
                data: 0
            };
        }
        if (utils.isNumber(id) && id <= maxint) {
            ids[peer][type] = id;
        } else {
            ids[peer][type] = ids[peer][type] < maxint
                ? ids[peer][type] + 1
                : 1;
        }
        return ids[peer][type];
    };
}());

const getPC = function (connection) {
    const pc = new RTCPeerConnection(null);

    pc.onnegotiationneeded = function (e) {
        connection.emit("negotiationneeded");
    };
    pc.onicecandidate = function (e) {
        const candidate = e.candidate;

        if (!candidate) {
            return;
        }
        connection.emit("candidate", e, candidate);
    };
    pc.onicecandidateerror = function (e) {
        connection.emit("icecandidateerror", e);
    };
    pc.onsignalingstatechange = function (e) {
        const state = pc.signalingState;

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
        const state = pc.iceConnectionState;

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
        const state = pc.iceGatheringState;

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
        const state = pc.connectionState;

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
    const mc = emitter();
    const store = {
        sdp: null,
        quiet: false
    };

    mc.emit = (function () {
        const oldemit = mc.emit;

        return function () {
            const args = utils.toArray(arguments);

            if (!store.quiet) {
                oldemit.apply(mc, args);
                args[0] = "conn-" + args[0];
                args.splice(1, 0, mc);
                mc.provider.emit.apply(mc.provider, args);
            }
        };
    }());
    options = utils.extend({}, options, true);
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
        const pc = getPC(mc);
        const stream = mc.provider.stream();

        mc.audio = (function () {
            let audioSender = stream && stream.getAudioTracks().length > 0
                ? pc.addTrack(stream.getAudioTracks()[0], stream)
                : null;

            return function (sender) {
                if (!utils.isUndefined(sender)) {
                    audioSender = sender;
                }
                return audioSender;
            };
        }());
        mc.video = (function () {
            let videoSender = stream && stream.getVideoTracks().length > 0
                ? pc.addTrack(stream.getVideoTracks()[0], stream)
                : null;

            return function (sender) {
                if (!utils.isUndefined(sender)) {
                    videoSender = sender;
                }
                return videoSender;
            };
        }());
        pc.ontrack = function (e) {
            mc.emit("track", e, e.streams);
        };
        if (mc.initiator === true) {
            mc.start = function (offeropts) {
                const offerOptions = utils.isObject(offeropts)
                    ? offeropts
                    : { offerToReceiveAudio: 1, offerToReceiveVideo: 1 };

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
        if (utils.isBoolean(bool)) {
            store.quiet = bool;
        }
        return store.quiet;
    };
    return Object.freeze(mc);
}

function dataConnection(provider, peer, options) {
    const dc = emitter();
    const store = {
        quiet: false,
        sdp: null,
        channel: null
    };

    dc.emit = (function () {
        const oldemit = dc.emit;

        return function () {
            const args = utils.toArray(arguments);

            if (!store.quiet) {
                oldemit.apply(dc, args);
                args[0] = "conn-" + args[0];
                args.splice(1, 0, dc);
                dc.provider.emit.apply(dc.provider, args);
            }
        };
    }());
    options = utils.extend({}, options, true);
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
        if (!utils.isUndefined(channel)) {
            store.channel = channel;
        }
        return store.channel;
    };
    dc.setup = function () {
        const channel = store.channel;

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
        const pc = getPC(dc);

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
                const channel = e.channel;

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
        if (utils.isBoolean(bool)) {
            store.quiet = bool;
        }
        return store.quiet;
    };
    return Object.freeze(dc);
}

export default function proficient(name, room) {
    const pro = emitter();
    const store = {
        connections: {},
        stream: null
    };

    if (!name || !utils.isString(name) || !room || !utils.isString(room)) {
        return;
    }
    pro.name = name;
    pro.room = room;
    pro.connections = function () {
        return utils.copy(store.connections);
    };
    pro.stream = function (stream) {
        if (!utils.isUndefined(stream)) {
            store.stream = stream;
        }
        return store.stream;
    };
    pro.getMedia = function (type) {
        const constraints = {
            audio: false,
            video: false
        };

        function success(stream) {
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
        const jsonmsg = JSON.parse(msg);
        const connection = pro.getConnection(peer, jsonmsg.type, jsonmsg.id);

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
        const jsonmsg = JSON.parse(msg);
        const connection = pro.getConnection(peer, jsonmsg.type, jsonmsg.id);

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
        const jsonmsg = JSON.parse(msg);
        let connection = pro.getConnection(peer, jsonmsg.type, jsonmsg.id);

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
        const connection = dataConnection(pro, peer, { initiator: true });

        pro.addConnection(connection);
        return connection;
    };
    pro.call = function (peer) {
        const connection = mediaConnection(pro, peer, { initiator: true });

        pro.addConnection(connection);
        return connection;
    };
    pro.purge = function () {
        utils.each(store.connections, function (typeobj, peer) {
            utils.each(typeobj, function (idobj, type) {
                utils.each(idobj, function (conn, id) {
                    conn.pc.close();
                    pro.remConnection(conn);
                    conn = null;
                });
            });
        });
    };
    return Object.freeze(pro);
}
