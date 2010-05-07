var jid = "overseer@ubu", password = "themaster"
var xmpp = require("../xmppjs/xmpp")
var sys = require("sys")


var Pong = {}
Pong.overseer = {
  connect: function() {
    this.connection = new xmpp.Connection('ubu', 5222)
    this.connection.log = function(_, m) { sys.debug(m) }
    this.connection.connect(jid, password, Pong.overseer.on_connect)
  },

  on_connect: function(status, condition) {
    switch (status) {
      case xmpp.Status.CONNECTING:
        sys.debug("CONNECTING...")
        break
      case xmpp.Status.CONNFAIL:
        sys.debug("CONNECTION FAILED")
        break
      case xmpp.Status.AUTHENTICATING:
        sys.debug("AUTHENTICATING...")
        break
      case xmpp.Status.AUTHFAIL:
        sys.debug("AUTHENTICATION FAILED!")
        break
      case xmpp.Status.CONNECTED:
        sys.debug("CONNECTED!")
        this.connection.addHandler(on_message, null, 'message', null, null, null)
        this.connection.addHandler(on_iq, null, 'iq')
        
        setInterval(function() {
          id = new Date().getTime()
          ping = xmpp.iq({to: 'ubu', type: 'get', id: 'ping'+id}).c("ping", {xmlns: "urn:xmpp:ping"})
          Pong.overseer.connection.send(ping)
        }, 10000)

        break
      case xmpp.Status.DISCONNECTED:
        sys.debug("DISCONNECTED.")
        break
      case xmpp.Status.DISCONNECTING:
        sys.debug("DISCONNECTING...")
        break
      default:
        sys.debug(sys.inspect(xmpp.Status))
        sys.debug("ERROR: "+status+" ("+condition+")")
    }
  },

  on_message: function(message) {
    sys.debug(sys.inspect(message))
  },

  on_iq: function(iq) {
    sys.debug(sys.inspect(iq))
  }
}


Pong.overseer.connect()
