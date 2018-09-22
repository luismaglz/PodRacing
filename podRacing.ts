///<reference path="definitions.d.ts" />

interface Tracking {
    frames: number;
    boostAvailable: boolean;
    track: CheckPoint[];
    trackMapped: boolean
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

function moveToCheckPoint(x: number, y: number, thrust: number | string) {
    return print(`${x} ${y} ${thrust}`);
}

function printDebug(value: any) {
    printErr(JSON.stringify(value));
}

function isInAngleThreshold(angle: number, threshold: number): boolean {
    return (angle > threshold || angle < threshold)
}

function areWeInLine(me: Pod, enemy: Pod, checkpoint: CheckPoint) {
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
} as Tracking;

while (true) {
    tracking.frames++;
    var line = readline();
    var inputs = line.split(' ');
    var myPod = new Pod(inputs[0], inputs[1]);
    var nextCheckPoint = new CheckPoint(inputs[2], inputs[3], inputs[4], inputs[5]);
    printDebug(nextCheckPoint);
    printDebug(tracking);

    var checkPointIndex = tracking.track.findIndex(checkpoint => checkpoint.id === nextCheckPoint.id);

    if (checkPointIndex === -1) {
        tracking.track.push(nextCheckPoint);
    }

    printDebug(checkPointIndex);


    if (tracking.track.length > 1 && checkPointIndex === 0 && tracking.trackMapped == false) {
        tracking.trackMapped = true;
    }

    var inputs = readline().split(' ');
    var enemyPod = new Pod(inputs[0], inputs[1]);

    var thrust: number | string = 100;


    if (nextCheckPoint.angle > 90 || nextCheckPoint.angle < -90) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 10;
    } else if (nextCheckPoint.angle > 70 || nextCheckPoint.angle < -70) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 30;
    } else if (nextCheckPoint.angle > 50 || nextCheckPoint.angle < -50) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 50;
    } else if (nextCheckPoint.angle > 45 || nextCheckPoint.angle < -45) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 80;
    }

    if (nextCheckPoint.distance < 2000) {
        var deaccelerateFactor = Math.floor(nextCheckPoint.distance / 40);
        if (deaccelerateFactor > thrust) {
            deaccelerateFactor = thrust;
        }
        thrust -= deaccelerateFactor;
    }

    if (tracking.boostAvailable &&  nextCheckPoint.distance > 3000 && Math.abs(nextCheckPoint.angle) < 6 && tracking.trackMapped && tracking.track[tracking.track.length - 1].id === nextCheckPoint.id) {
        thrust = 'BOOST';
        tracking.boostAvailable = false;
    }

    moveToCheckPoint(nextCheckPoint.positionX, nextCheckPoint.positionY, thrust);
}

