var arDrone         = require('ar-drone'),
    client          = arDrone.createClient(),
    XboxController  = require('xbox-controller'),
    xbox            = new XboxController;

console.log('Battery: ' + client.battery);

var stickMaxPos         = 32727,
    stickMaxNeg         = -32768,
    triggerMax          = 255,
    velocityMultiplier  = .01,
    lightTouch          = true,
    flipTimeout         = null,
    flip                = {
        left: false,
        right: false
    };

var ControlModes        = {
    DEFAULT: 0,
    RACING: 1
};
var currentControlMode = ControlModes.DEFAULT;


flipCopter = function() {
    if(flip.left && flip.right){
        client.animate('flipAhead', 400);
    } else if (flip.left) {
        client.animate('flipLeft', 400);
    } else if (flip.right) {
        client.animate('flipRight', 400);
    }

    flip.left = false;
    flip.right = false;

    flipTimeout = null;
};

xbox.on('start:release', function(key) {
    currentControlMode = !currentControlMode;
    console.log('change control mode to ' + currentControlMode);
});

xbox.on('a:release', function (key) {
    console.log('takeoff')
  client.takeoff();
});

xbox.on('b:release', function (key) {
    console.log('land')
  client.land();
});

xbox.on('y:release', function (key) {
    console.log('stop')
  client.stop();
});

xbox.on('x:release', function (key) {
    console.log('disableEmergency')
  client.disableEmergency();
});

xbox.on('leftshoulder:release', function(key){
    console.log('flipleft')
    if(!flipTimeout){
        flipTimeout = setTimeout(flipCopter, 100);
    }

    flip.left = true;
});

xbox.on('rightshoulder:release', function(key){
    console.log('flipright')
    if(!flipTimeout){
        flipTimeout = setTimeout(flipCopter, 100);
    }

    flip.right = true;
});

xbox.on('back:release', function(key){
    console.log('toggle light touch')
    lightTouch = !lightTouch;
    console.log(lightTouch ? "Light Touch Mode" : "Full Speed Mode");
    lightTouch ? xbox.setLed(0x01) : xbox.setLed(0x0A);
});

xbox.on('lefttrigger', function(position) {
    if (currentControlMode == ControlModes.DEFAULT) {
        leftTriggerDefault(position);
    } else {
        leftTriggerRacing(position);
    }
});

function leftTriggerRacing(position) {
    console.log('brake');
    client.back(velocityMultiplier*position);
}

function leftTriggerDefault(position) {
    console.log('spin left')
  client.counterClockwise(position / triggerMax);
}

xbox.on('righttrigger', function(position){
    if (currentControlMode === ControlModes.DEFAULT) {
        rightTriggerDefault(position);f
    } else {
        rightTriggerRacing(position);
    }
});

function rightTriggerRacing(position) {
    console.log('forwards');
    console.log('right trigger pressed ' + position);
    client.front(velocityMultiplier*position);
}

function rightTriggerDefault(position) {
    console.log('spin right');
    console.log('left trigger pressed ' + position);
    client.clockwise(position / triggerMax);
}

xbox.on('left:move', function(position) {
    if (currentControlMode == ControlModes.DEFAULT) {
        leftMoveDefault(position);
    } else {
        leftMoveRacing(position);
    }
});

function leftMoveRacing(position) {
    var normLeft = 0,
        left = true;

    var normRotateLeft  = 0,
        rotateLeft      = true;

    if(position.x < 0) {
        normLeft = position.x / stickMaxNeg;
    } else {
        left = false;
        normLeft = position.x / stickMaxPos;
    }

    if(normLeft != 0) {
        if(lightTouch) normLeft = normLeft / 2;
        left ? client.left(normLeft) : client.right(normLeft);
    } else {
        client.left(normLeft);
        client.right(normLeft);
    }

    if(position.x < 0) {
        rotateLeft = false;
        normRotateLeft = 10 * position.x / stickMaxNeg;
    } else {
        normRotateLeft = 10 * position.x / stickMaxPos;
    }

    if(normRotateLeft != 0) {
        if(lightTouch) normRotateLeft = normRotateLeft / 2;
        rotateLeft ? client.clockwise(normRotateLeft) : client.counterClockwise(normRotateLeft);
    } else {
        client.clockwise(normRotateLeft);
        client.counterClockwise(normRotateLeft);
    }
}

function leftMoveDefault(position) {
    var normFront = 0,
        normLeft = 0,
        forwards = true,
        left = true;

    if(position.y < 0) {
        normFront = position.y / stickMaxNeg;
    } else {
        forwards = false;
        normFront = position.y / stickMaxPos;
    }

    if(position.x < 0) {
        normLeft = position.x / stickMaxNeg;
    } else {
        left = false;
        normLeft = position.x / stickMaxPos;
    }

    if(normFront != 0) {
        if(lightTouch) normFront = normFront / 2;
        forwards ? client.front(normFront) : client.back(normFront);
    } else {
        client.front(normFront);
        client.back(normFront);
    }

    if(normLeft != 0) {
        if(lightTouch) normLeft = normLeft / 2;
        left ? client.left(normLeft) : client.right(normLeft);

    } else {
        client.left(normLeft);
        client.right(normLeft);
    }
};

xbox.on('right:move', function(position){
    var normUp      = 0;
    normRotateLeft  = 0,
    up              = true,
    left            = true;

  if(position.y < 0) {
    normUp = position.y / stickMaxNeg;
  } else {
    up = false;
    normUp = position.y / stickMaxPos;
  }

  if(position.x < 0) {
    left = false;
    normRotateLeft = position.x / stickMaxNeg;
  } else {

    normRotateLeft = position.x / stickMaxPos;
  }

  if(normUp != 0) {
    if(lightTouch) normUp = normUp / 2;
    up ? client.up(normUp) : client.down(normUp);
  } else {
    client.up(normUp);
    client.down(normUp);
  }

  if(normRotateLeft != 0) {
    if(lightTouch) normRotateLeft = normRotateLeft / 2;
    left ? client.clockwise(normRotateLeft) : client.counterClockwise(normRotateLeft);
  } else {
    client.clockwise(normRotateLeft);
    client.counterClockwise(normRotateLeft);
  }
});


xbox.setLed(0x01);
