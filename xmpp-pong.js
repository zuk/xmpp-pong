var gWidth = 360
var gHeight = 480
var gFPS = 25

var Pong = {
  init: function() {
    $doodle.canvas('#pong')

    this.ball.init()

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
    this.ball.velocity = {speed: 5.0, angle: 0.75}

    $doodle.animate(function() {
      Pong.ball.go()
      Pong.ball.avatar.draw()
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
    this.velocity = {speed: 5.0, angle: Math.random() * 2.0}
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
      case this.falls_off_bottom():
        this.drop()
        break;
      case this.falls_off_top():
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

  falls_off_bottom: function() {
    return next.y - this.avatar.radius > gHeight
  },

  falls_off_top: function() {
    return next.y + this.avatar.radius < 0
  }
}

