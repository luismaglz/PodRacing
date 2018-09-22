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
function areWeInLine(me, enemy, checkpoint) {
    var slope1 = (enemy.positionY - enemy.positionX) / (me.positionY - me.positionX);
    var slope2 = (checkpoint.positionY - checkpoint.positionX) / (enemy.positionY - enemy.positionX);
    var slope3 = (checkpoint.positionY - checkpoint.positionX) / (me.positionY - me.positionX);
    return slope1 == slope2 && slope1 == slope3;
}
var tracking = {
    frames: 0,
    boostAvailable: true,
    trackMapped: false,
    track: new Array()
};
while (true) {
    tracking.frames++;
    var line = readline();
    var inputs = line.split(' ');
    var myPod = new Pod(inputs[0], inputs[1]);
    var nextCheckPoint = new CheckPoint(inputs[2], inputs[3], inputs[4], inputs[5]);
    printDebug(nextCheckPoint);
    // printDebug(tracking);
    var checkPointIndex = tracking.track.findIndex(checkpoint => checkpoint.id === nextCheckPoint.id);
    if (checkPointIndex === -1) {
        tracking.track.push(nextCheckPoint);
    }
    tracking.trackMapped = tracking.track.length > 1 && checkPointIndex === 0;
    var inputs = readline().split(' ');
    var enemyPod = new Pod(inputs[0], inputs[1]);
    var thrust = 100;
    if (nextCheckPoint.angle > 90 || nextCheckPoint.angle < -90) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 30;
    }
    else if (nextCheckPoint.angle > 45 || nextCheckPoint.angle < -45) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 80;
    }
    else {
        if (nextCheckPoint.distance < 1500 && nextCheckPoint.angle === 0) {
            thrust = 20;
        }
        else if (nextCheckPoint.distance < 600) {
            thrust = 20;
        }
        if (tracking.boostAvailable && Math.abs(nextCheckPoint.angle) < 3 && nextCheckPoint.distance < 4000) {
            thrust = 'BOOST';
            tracking.boostAvailable = false;
        }
    }
    printDebug({ areWeInLine: areWeInLine(myPod, enemyPod, nextCheckPoint) });
    moveToCheckPoint(nextCheckPoint.positionX, nextCheckPoint.positionY, thrust);
}
