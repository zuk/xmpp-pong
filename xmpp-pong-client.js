
var BOSH_SERVICE = '/http-bind/'

Pong.Client = function() { this.init() }

Pong.Client.prototype.init = function () {
  this.nickname = prompt("Your name:")

  this.connection = new Strophe.Connection(BOSH_SERVICE)

  this.connection.xmlInput = function(data) {console.log($(data).children()[0])}
  this.connection.xmlOutput = function(data) {console.log(data)}

  this.pongJid = null
  this.pongRoom = null
}


Pong.Client.prototype.connect = function(username, password) {
  var client = this
  this.connection.connect(username, password,
    function(status){client.onConnect(status)})
}

Pong.Client.prototype.onConnect = function(status) {
  if (status == Strophe.Status.CONNECTING) {
    console.log("Connecting.");
  } else if (status == Strophe.Status.AUTHENTICATING) {
    console.log("Authenticating.");
  } else if (status == Strophe.Status.CONNFAIL) {
    alert("Connection failed!");
  } else if (status == Strophe.Status.DISCONNECTING) {
    console.log("Disconnecting.")
  } else if (status == Strophe.Status.DISCONNECTED) {
    console.log("Disconnected.")
  } else if (status == Strophe.Status.CONNECTED) {
    console.log("Connection established!")

    var client = this
    
    this.connection.addHandler(function(pres){client.onPresence(pres);return true},
      null, "presence")

    this.connection.addHandler(function(msg){client.onGroupchatMessage(msg);return true},
      null, "message", "groupchat")

    this.joinPong()
  }
}

Pong.Client.prototype.joinPong = function() {
  console.log("Joining Pong...")
  room = "pong@conference."+Strophe.getDomainFromJid(this.connection.jid)

  pres = $pres({to: room+"/"+this.nickname}).
    c('x', {xmlns: 'http://jabber.org/protocol/muc'})
  
  this.connection.send(pres.tree())
}

Pong.Client.prototype.onPresence = function(pres) {
  from = $(pres).attr('from')
  room = Strophe.getBareJidFromJid(from)
  nick = Strophe.getResourceFromJid(from)

  var client = this

  if ($(pres).attr('type') == 'error') {
    alert($(pres).find('error > text').text())
    console.log(pres)
    return
  }

  if ($(pres).attr('type') == 'unavailable') {
    $('#userlist').find('li[jid="'+from+'"]').fadeOut(2000).remove()
    return
  }

  $.unique($('#userlist > li'))

  li = $('#userlist').find('li[jid="'+from+'"]')
  if (li.length == 0) {
    li = $("<li jid='"+from+"' style='color: white'>"+nick+"</li>")
    $('#userlist').append(li)
  }
  
  if (from == room+'/'+this.nickname) {
    $('#blue-play').click(function() {
      pres2 = $pres({to: room}).c('status', 'blue')
      client.connection.send(pres2.tree())
    })
    $('#red-play').click(function() {
      pres2 = $pres({to: room}).c('status', 'red')
      client.connection.send(pres2.tree())
    })

    li.css('font-weight', 'bold')
    this.pongJid = from
  }

  status = $(pres).find('status').text()
  if (status == 'blue') {
    li.css('color', '#55a')
    $('#blue').text(nick)
    $('#blue-play').hide()
    if (from == room+'/'+this.nickname) {
      Pong.start(Pong.blue_paddle)
    }
  } else if (status == 'red') {
    li.css('color', '#b22')
    $('#red').text(nick)
    $('#red-play').hide()
    if (from == room+'/'+this.nickname) {
      Pong.start(Pong.red_paddle)
    }
  } else {
    if (!Pong.started) Pong.start()
  }
}

Pong.Client.prototype.onGroupchatMessage = function(msg) {
  from = $(msg).attr('from')
  room = Strophe.getBareJidFromJid(from)
  nick = Strophe.getResourceFromJid(from)

  if ($(msg).find('x[xmlns="jabber:x:delay"]').length > 0) {
    // ignore past pos messages
  } else {
    x = $(msg).find('pos').text()
    c = $(msg).find('pos').attr('paddle')
    if (c == 'blue')
      p = Pong.blue_paddle
    else
      p = Pong.red_paddle

    if (p != Pong.as_paddle) p.avatar.modify({x: x})
  }
}


