
var BOSH_SERVICE = '/http-bind/'

var Client = function(box) { this.init(box) }

Client.prototype.init = function (box) {
  this.box = box
  this.nickname = prompt("Enter nickname for "+box.attr('id')+":")

  this.connection = new Strophe.Connection(BOSH_SERVICE)

  this.connection.xmlInput = function(data) {console.log($(data).children()[0])}
  this.connection.xmlOutput = function(data) {console.log(data)}
}


Client.prototype.connect = function(username, password) {
  var client = this
  this.connection.connect(username, password,
    function(status){Client.events.on_connect(client, status)})
}

Client.prototype.subscribe = function(jid) {
  this.log('sending subscription request to '+jid)
  pres = $pres({to: jid, type: 'subscribe'}).c('status', "matt")
  this.connection.send(pres.tree())
}

Client.prototype.log = function(msg) {
  this.box.append("<p>&raquo; "+msg+"</p>")
} 

Client.prototype.join_room = function() {
  var client = this

  room = "pong@conference."+Strophe.getDomainFromJid(this.connection.jid)+"/"+this.nickname

  pres = $pres({to: room}).
    c('x', {xmlns: 'http://jabber.org/protocol/muc'})
  this.connection.send(pres.tree())
}

Client.events = {
  on_connect: function(client, status) {
    if (status == Strophe.Status.CONNECTING) {
      client.log(client.box.attr('id')+' connecting.');
    } else if (status == Strophe.Status.AUTHENTICATING) {
      client.log(client.box.attr('id')+' authenticating.');
    } else if (status == Strophe.Status.CONNFAIL) {
      client.log(client.box.attr('id')+'failed to connect.');
    } else if (status == Strophe.Status.DISCONNECTING) {
      client.log(client.box.attr('id')+' disconnecting.');
    } else if (status == Strophe.Status.DISCONNECTED) {
      client.log(client.box.attr('id')+' disconnected.');
    } else if (status == Strophe.Status.CONNECTED) {
      client.log(client.box.attr('id')+' connected!')

 
      client.connection.addHandler(function(pres){Client.events.on_subscribe(client,pres);return true}, 
        null, "presence", "subscribe")

      client.connection.addHandler(function(pres){Client.events.on_subscribe(client,pres);return true}, 
        null, "presence", "subscribed")

      client.connection.addHandler(function(pres){Client.events.on_presence(client,pres);return true}, 
        null, "presence")

      client.connection.addHandler(function(msg){Client.events.on_groupchat_message(client,msg);return true}, 
        null, "message", "groupchat")




      client.box.children('.jid').text(client.connection.jid)


      /*this.sendIQ(
        $iq({type: 'get', id: 'roster1'}).c("query", {xmlns: "jabber:iq:roster"}),
        function() {
          Pong.xmpp.connection.send($pres())
        }
      )*/

      //this.send(
      //  $iq({type: 'get', id: 'reg1'}).c("query", {xmlns: "jabber:iq:register"})
      //)

      //this.send(
      //  $iq({to: 'carbon', type: 'get', id: 'disco1'})
      //    .c("query", {xmlns: "http://jabber.org/protocol/disco#info"})
      //)

       
      //msg = $msg({to: 'green@carbon', from: 'blue@carbon', type: 'chat'})
      //  .cnode("I'm here!")
      //this.connection.send(msg.tree())

      client.join_room()
    }
  },

  on_subscribe: function(client, pres) {
    from = pres.getAttribute('from')
    client.log("got subscription request from "+from)
    pres = $pres({to: from, type: 'subscribed'})
    client.log("accepting request...")
    client.connection.send(pres.tree())
  },

  on_subscribed: function(client, pres) {
    from = pres.getAttribute('from')
    client.log(from+" accepted the subscription request")
  },

  on_presence: function(client, pres) {
    from = pres.getAttribute('from')
    room = Strophe.getBareJidFromJid(from)
    nick = Strophe.getResourceFromJid(from)

    if ($(pres).attr('type') == 'error') {
      client.error('Presence error from '+from)
      console.log(pres)
      return
    } 

    if ($(pres).attr('type') == 'unavailable') {
      client.log(nick+" has left room "+room)
      return
    }

    if ($(pres).find('status[code="201"]').length > 0) {
      client.log("Room "+room+" created.")
    } else if (from == room+'/'+client.nickname) {
      client.log("Room "+room+" joined.")
    } else {
      client.log(nick+" entered room "+room)
    }
  },

  on_groupchat_message: function(client, msg) {
    from = msg.getAttribute('from')
    room = Strophe.getBareJidFromJid(from)
    nick = Strophe.getResourceFromJid(from)

    if ($(msg).find('x[xmlns="jabber:x:delay"]').length > 0) {
      client.log("{"+nick+"}"+$(msg).find('body').text())
    } else {
      client.log("["+nick+"] "+$(msg).find('body').text())
    }
  }

}


