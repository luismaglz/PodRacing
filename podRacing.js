"use strict";
///<reference path="definitions.d.ts" />
class Point {
    constructor(pX, pY) {
        this.positionX = parseInt(pX);
        this.positionY = parseInt(pY);
    }
}
class Pod extends Point {
}
;
class CheckPoint extends Point {
    constructor(pX, pY, distance, angle) {
        super(pX, pY);
        this.id = `${pX}${pY}`;
        this.distance = parseInt(distance);
        this.angle = parseInt(angle);
    }
}
;
function moveToCheckPoint(x, y, thrust) {
    return print(`${x} ${y} ${thrust}`);
}
function printDebug(value) {
    printErr(JSON.stringify(value));
}
function isInAngleThreshold(angle, threshold) {
    return (angle > threshold || angle < threshold);
}
var tracking = {
    frames: 0,
    boostAvailable: true,
    track: new Array(),
    trackMapped: false
};
while (true) {
    tracking.frames++;
    var line = readline();
    var inputs = line.split(' ');
    var myPod = new Pod(inputs[0], inputs[1]);
    var nextCheckPoint = new CheckPoint(inputs[2], inputs[3], inputs[4], inputs[5]);
    printDebug(nextCheckPoint);
    printDebug(tracking);
    if (!tracking.trackMapped && tracking.track.findIndex(checkpoint => checkpoint.id === nextCheckPoint.id) === -1) {
        tracking.track.push(nextCheckPoint);
    }
    else {
        tracking.trackMapped = true;
    }
    var inputs = readline().split(' ');
    var opponentX = parseInt(inputs[0]);
    var opponentY = parseInt(inputs[1]);
    var thrust = 100;
    var offSet = 0;
    if (nextCheckPoint.angle > 90 || nextCheckPoint.angle < -90) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 30;
    }
    else {
        if (nextCheckPoint.angle !== 0) {
            offSet = 100;
            if (nextCheckPoint.angle < 0) {
                offSet = -100;
            }
        }
        // if (nextCheckPoint.distance > 6000 && tracking.boostAvailable && nextCheckPoint.angle === 0 && tracking.frames > 100) {
        //     thrust = 'BOOST';
        //     tracking.boostAvailable = false;
        // } else 
        if (nextCheckPoint.distance < 1500 && nextCheckPoint.angle === 0) {
            thrust = 20;
        }
        else if (nextCheckPoint.distance < 600) {
            thrust = 20;
        }
    }
    moveToCheckPoint(nextCheckPoint.positionX + offSet, nextCheckPoint.positionY + offSet, thrust);
}
