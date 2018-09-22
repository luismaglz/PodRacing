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
    return print(`${x} ${y} ${thrust} ${thrust}`);
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
function isLastCheckPoint(checkPoint) {
    return checkPoint.id === tracking.track[tracking.track.length - 1].id;
}
function getDistanceBetweenPods(pod1, pod2) {
    var a = pod1.positionX - pod2.positionX;
    var b = pod1.positionY - pod2.positionY;
    return Math.sqrt(a * a + b * b);
}
function isEnemyUsingBoostAtStart() {
    var enemyDistance = getDistanceBetweenPods(enemyPod, nextCheckPoint);
    var myDistance = getDistanceBetweenPods(myPod, nextCheckPoint);
    return (tracking.track.length == 1 && (enemyDistance - myDistance < -500));
}
function getAllowedAngleForPredicting(checkPoint) {
    var distanceToCheckpoint = checkPoint.distance;
    var checkPointRadius = 450;
    var angleOfAttack = Math.atan(checkPointRadius / distanceToCheckpoint) * (180 / Math.PI);
    return angleOfAttack;
}
var tracking = {
    frames: 0,
    boostAvailable: true,
    trackMapped: false,
    enemyPodLastPosition: new Pod('0', '0'),
    track: new Array(),
    trackLength: 0
};
while (true) {
    tracking.frames++;
    var line = readline();
    var inputs = line.split(' ');
    var myPod = new Pod(inputs[0], inputs[1]);
    var nextCheckPoint = new CheckPoint(inputs[2], inputs[3], inputs[4], inputs[5]);
    var checkPointPredicted = new CheckPoint('', '', '', '');
    var checkPointIndex = tracking.track.findIndex(checkpoint => checkpoint.id === nextCheckPoint.id);
    var useBoost = false;
    if (checkPointPredicted && (checkPointPredicted.id == nextCheckPoint.id)) {
        checkPointPredicted = new CheckPoint('', '', '', '');
    }
    if (checkPointIndex === -1) {
        tracking.track.push(nextCheckPoint);
    }
    if (tracking.track.length > 1 && checkPointIndex === 0 && tracking.trackMapped == false) {
        tracking.trackMapped = true;
        tracking.trackLength = tracking.track.length;
    }
    var inputs = readline().split(' ');
    var enemyPod = new Pod(inputs[0], inputs[1]);
    var thrust = 100;
    var angleOffSet = 0;
    if (nextCheckPoint.angle > 0) {
        angleOffSet = nextCheckPoint.angle;
    }
    else {
        angleOffSet = Math.abs(nextCheckPoint.angle);
    }
    if (angleOffSet > 90) {
        if (getDistanceBetweenPods(myPod, enemyPod) < 900) {
            thrust = 100;
        }
        else {
            thrust = 0;
        }
    }
    else {
        thrust = 100 - angleOffSet;
    }
    if (nextCheckPoint.distance < 2000 && getDistanceBetweenPods(myPod, enemyPod) < 1500) {
        thrust = 70;
        printDebug('BOOSTING');
    }
    else if (nextCheckPoint.distance < 2000 && getDistanceBetweenPods(myPod, enemyPod) > 1000) {
        var rate = Math.floor(100 - (nextCheckPoint.distance / 20));
        thrust = thrust - rate;
        if (thrust < 1) {
            thrust = 10;
        }
        printDebug('BREAKING');
    }
    if (tracking.trackMapped && angleOffSet < 90 && nextCheckPoint.distance < 1500 && angleOffSet < getAllowedAngleForPredicting(nextCheckPoint)) {
        var checkPointIndex = tracking.track.findIndex(cp => cp.id === nextCheckPoint.id);
        printDebug('PREDICTING');
        if (checkPointIndex > tracking.track.length - 1) {
            checkPointIndex = 0;
        }
        checkPointPredicted = tracking.track[checkPointIndex + 1];
    }
    if (isEnemyUsingBoostAtStart()) {
        useBoost = true;
    }
    else if (tracking.trackMapped && isLastCheckPoint && nextCheckPoint.distance > 3000 && angleOffSet < getAllowedAngleForPredicting(nextCheckPoint)) {
        useBoost = true;
    }
    if (checkPointPredicted) {
        printDebug({ predicted: checkPointPredicted });
        printDebug({ predictedAvailable: checkPointPredicted.id != '' });
    }
    printDebug({ angleOfAttack: getAllowedAngleForPredicting(nextCheckPoint) });
    printDebug({ nextCheck: nextCheckPoint });
    if (useBoost && tracking.boostAvailable) {
        moveToCheckPoint(nextCheckPoint.positionX, nextCheckPoint.positionY, 'BOOST');
        tracking.boostAvailable = false;
    }
    else if (checkPointPredicted && checkPointPredicted.id != '' && angleOffSet < 45) {
        printDebug('STEERING TO PREDICTED');
        moveToCheckPoint(checkPointPredicted.positionX, checkPointPredicted.positionY, thrust);
    }
    else {
        printDebug('STEERING TO NEXT');
        moveToCheckPoint(nextCheckPoint.positionX, nextCheckPoint.positionY, thrust);
    }
}
