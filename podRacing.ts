///<reference path="definitions.d.ts" />

interface Tracking {
    frames: number;
    boostAvailable: boolean;
    track: CheckPoint[];
    previousPosition: Pod,
    trackMapped: boolean,
    trackLength: number
}

class Point {
    positionX: number;
    positionY: number;

    constructor(pX: string, pY: string) {
        this.positionX = parseInt(pX);
        this.positionY = parseInt(pY);
    }
}

class Pod extends Point { };
class CheckPoint extends Point {
    id: string;
    distance: number;
    angle: number;
    constructor(pX: string, pY: string, distance: string, angle: string) {
        super(pX, pY);
        this.id = `${pX}${pY}`;
        this.distance = parseInt(distance);
        this.angle = parseInt(angle);
    }
};

function printDebug(value: any) {
    printErr(JSON.stringify(value));
}

function moveToCheckPoint(x: number, y: number, thrust: number | string) {
    printDebug({ moveTo: `${x} ${y} ${thrust} ${thrust}` });
    return print(`${x} ${y} ${thrust} ${thrust}`);
}

function isInAngleThreshold(angle: number, threshold: number): boolean {
    return (angle > threshold || angle < threshold)
}

function isLastCheckPoint(checkPoint: CheckPoint): boolean {
    return checkPoint.id === tracking.track[tracking.track.length - 1].id;
}

function getDistanceBetweenPods(pod1: Pod | CheckPoint, pod2: Pod | CheckPoint) {
    var a = pod1.positionX - pod2.positionX;
    var b = pod1.positionY - pod2.positionY;
    return Math.sqrt(a * a + b * b);
}

function isEnemyUsingBoostAtStart(): boolean {
    var enemyDistance = getDistanceBetweenPods(enemyPod, nextCheckPoint)
    var myDistance = getDistanceBetweenPods(myPod, nextCheckPoint)
    return (tracking.track.length == 1 && (enemyDistance - myDistance < -500))
}

function getAllowedAngleForPredicting(checkPoint: CheckPoint): number {
    var distanceToCheckpoint = checkPoint.distance;
    var checkPointRadius = 300;
    var angleOfAttack = Math.atan(checkPointRadius / distanceToCheckpoint) * (180 / Math.PI);
    return angleOfAttack;
}

function getRelativePositionFromCheckPoint(myPod: Pod, checkPoint: CheckPoint): Point {
    var point = new Point(checkPoint.positionX.toString(), checkPoint.positionY.toString());

    point.positionX = checkPoint.positionX - myPod.positionX;;
    point.positionY = checkPoint.positionY - myPod.positionY;

    return point;
}

var tracking = {
    frames: 0,
    boostAvailable: true,
    trackMapped: false,
    previousPosition: new Pod('0', '0'),
    track: new Array(),
    trackLength: 0,
} as Tracking;

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

    if (tracking.frames == 1) {
        tracking.previousPosition = myPod
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
    var thrust: number | string = 100;

    var angleOffSet = 0;

    if (nextCheckPoint.angle > 0) {
        angleOffSet = nextCheckPoint.angle;
    } else {
        angleOffSet = Math.abs(nextCheckPoint.angle);
    }

    if (angleOffSet > 90) {
        thrust = 0;
    } else {
        thrust = 100 - Math.floor(angleOffSet / 2);
    }

    if (nextCheckPoint.distance < 2000 && getDistanceBetweenPods(myPod, enemyPod) < 1000) {
        if (getDistanceBetweenPods(myPod, nextCheckPoint) > getDistanceBetweenPods(enemyPod, nextCheckPoint)) {
            thrust = "SHIELD";
        }
    } 

    if (tracking.trackMapped && angleOffSet < 90 && nextCheckPoint.distance < 2000 && angleOffSet < getAllowedAngleForPredicting(nextCheckPoint)) {
        var checkPointIndex = tracking.track.findIndex(cp => cp.id === nextCheckPoint.id);
        if (checkPointIndex > tracking.track.length - 1) {
            checkPointIndex = 0;
        }
        checkPointPredicted = tracking.track[checkPointIndex + 1];
    }

    if (isEnemyUsingBoostAtStart()) {
        useBoost = true;
    } else if (tracking.trackMapped && isLastCheckPoint(nextCheckPoint) && nextCheckPoint.distance > 3000 && angleOffSet === 0) {
        useBoost = true;
    }

    printDebug({ nextCheck: nextCheckPoint });
    printDebug({ pred: checkPointPredicted });
    printDebug({ velocity: getDistanceBetweenPods(tracking.previousPosition, myPod) });
    var relativePosition = getRelativePositionFromCheckPoint(myPod, nextCheckPoint);
    printDebug({ relative: relativePosition });

    if (useBoost && tracking.boostAvailable) {
        moveToCheckPoint(nextCheckPoint.positionX, nextCheckPoint.positionY, 'BOOST');
        tracking.boostAvailable = false;
    } else if (checkPointPredicted && checkPointPredicted.id != '' && angleOffSet < 45 && thrust > 50) {
        printDebug('STEERING TO PREDICTED');
        moveToCheckPoint(checkPointPredicted.positionX, checkPointPredicted.positionY, thrust);
    } else {
        printDebug('STEERING TO NEXT');
        moveToCheckPoint(nextCheckPoint.positionX, nextCheckPoint.positionY, thrust);
    }

}

