var gWidth = 360
var gHeight = 480
var gFPS = 25

var BOSH_SERVICE = '/http-bind'

var Pong = {
  init: function() {
    $doodle.canvas('#pong')

    this.ball.init()

    this.red_field = $doodle.rect({x: 0, y: 0, width: gWidth, height: gHeight * 0.4, fill: '#533', alpha: 0.5})
    this.blue_field = $doodle.rect({x: 0, y: gHeight - (gHeight * 0.4), width: gWidth, height: gHeight * 0.4, fill: '#335', alpha: 0.5})

    /* angle is in radians, so:
     *   0    ==> east
     *   0.25 ==> south-east
     *   0.5  ==> south
     *   0.75 ==> south-west
     *   1    ==> west
     *   1.25 ==> north-west
     *   1.5  ==> north
     *   1.75 ==> north-east
     *
     *          1.5
     *           |
     *           |
     *   1 <---- * ----> 0
     *           |
     *           |
     *          0.5
     */
    this.ball.velocity = {speed: 10.0, angle: 0.75}

    this.blue_paddle = new Pong.Paddle()

    $(window).mousemove(function (event) {
      Pong.blue_paddle.avatar.modify({x: event.pageX - $('#pong').offset().left - Pong.blue_paddle.avatar.width/2.0})
    })


    Pong.xmpp.connect()

    
    $doodle.animate(function() {
      Pong.red_field.draw()
      Pong.blue_field.draw()

      Pong.ball.go()
      Pong.ball.avatar.draw()

      Pong.blue_paddle.avatar.draw()
    }, ''+gFPS+'fps')
    /*Pong.ball.go()*/
  }
}


Pong.ball = {
  init: function() {
    this.avatar = $doodle.circle({x: gWidth/2.0, y: gHeight/2.0, radius: 10, fill: '#ffffff'})
    this.drop()
    this.avatar.draw()
  },

  next_pos: function() {
    return {
      x: (Math.cos(this.velocity.angle * Math.PI) * this.velocity.speed) + this.avatar.x,
      y: (Math.sin(this.velocity.angle * Math.PI) * this.velocity.speed) + this.avatar.y
    }
  },

  go: function () {
    // check for collisions and adjust things accordignly, so that the following
    // nextPos() call generates post-collision coordinates
    this.detect_collision()

    to = this.next_pos()

    /*this.avatar.animate({cx: to.cx, cy: to.cy}, (1000/gFPS),
      function() {Pong.ball.go()})*/
    /*this.avatar.attr({cx: to.cx, cy: to.cy})*/
    this.avatar.modify({x: to.x, y: to.y})
  },

  drop: function() {
    do {
      a = Math.random() * 2.0
    } while (a < 0.2 || (a > 0.8 && a < 1.2) || a > 1.8)
    this.velocity = {speed: 10.0, angle: a}
    this.avatar.modify({x: gWidth / 2.0, y: gHeight / 2.0})
  },

  detect_collision: function () {
    next = this.next_pos()
    switch (true) {
      case this.collides_with_right_wall():
        this.velocity.angle = 1 - this.velocity.angle
        break;
      case this.collides_with_left_wall():
        this.velocity.angle = 1 - this.velocity.angle
        break;
      case this.collides_with_blue_paddle():
        this.velocity.angle = -this.velocity.angle
        break;
      case this.falls_off_bottom():
        $('#red-score').text(parseInt($('#red-score').text()) + 1).show('puff')
        this.drop()
        break;
      case this.falls_off_top():
        $('#blue-score').text(parseInt($('#blue-score').text()) + 1).show('puff')
        this.drop()
        break;
    }
  },

  collides_with_right_wall: function() {
    return next.x + this.avatar.radius > gWidth
  },

  collides_with_left_wall: function() {
    return next.x - this.avatar.radius < 0
  },

  collides_with_blue_paddle: function() {
    return next.y > gHeight - Pong.blue_paddle.height - 2 &&
      next.x > Pong.blue_paddle.avatar.x && next.x < Pong.blue_paddle.avatar.x + Pong.blue_paddle.avatar.width
  },

  falls_off_bottom: function() {
    return next.y - this.avatar.radius > gHeight
  },

  falls_off_top: function() {
    return next.y + this.avatar.radius < 0
  }
}


Pong.Paddle = function() {
  this.width = 60
  this.height = 8
  this.colour = '#55f'
  this.avatar = $doodle.rect({x: gWidth/2.0 - this.width/2.0, y: gHeight - this.height,
    width: this.width, height: this.height, fill: this.colour})
}


Pong.xmpp = {
  connect: function() {
    this.strophe = new Strophe.Connection(BOSH_SERVICE)
    
    this.strophe.xmlInput = function(data) {console.log($(data).children()[0])}
    //this.strophe.xmlOutput = function(data) {console.log('SENT: '+data)}
    
    this.strophe.connect('blue@carbon', 'blueblue', function(status) {
      if (status == Strophe.Status.CONNECTING) {
        console.log('Strophe is connecting.');
      } else if (status == Strophe.Status.CONNFAIL) {
        console.log('Strophe failed to connect.');
      } else if (status == Strophe.Status.DISCONNECTING) {
        console.log('Strophe is disconnecting.');
      } else if (status == Strophe.Status.DISCONNECTED) {
        console.log('Strophe is disconnected.');
      } else if (status == Strophe.Status.CONNECTED) {
        console.log('Strophe is connected!')

        this.strophe.addHandler(function(iq) {
          console.log(iq)
        }, null, "iq", null, "ping1")
        
        console.log("DOMAIN IS: "+Strophe.getDomainFromJid(this.strophe.jid))
	
        pres = $pres().c('status', "HERE!")
        this.strophe.send(pres.tree())


        msg = $msg({to: 'green@carbon', from: 'blue@carbon', type: 'chat'})
          .cnode("I'm here!")
        this.strophe.send(msg.tree())

      }
    })
  }
}
