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
    // printDebug(tracking);

    var checkPointIndex = tracking.track.findIndex(checkpoint => checkpoint.id === nextCheckPoint.id);

    if (checkPointIndex === -1) {
        tracking.track.push(nextCheckPoint);
    }

    tracking.trackMapped = tracking.track.length > 1 && checkPointIndex === 0;

    var inputs = readline().split(' ');
    var enemyPod = new Pod(inputs[0], inputs[1]);

    var thrust: number | string = 100;


    if (nextCheckPoint.angle > 90 || nextCheckPoint.angle < -90) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 30;
    } else if (nextCheckPoint.angle > 45 || nextCheckPoint.angle < -45) {
        var angle = Math.abs(nextCheckPoint.angle);
        thrust = 80;
    }
    else {

        if (nextCheckPoint.distance < 1500 && nextCheckPoint.angle === 0) {
            thrust = 20;
        } else if (nextCheckPoint.distance < 600) {
            thrust = 20;
        }

        if (tracking.boostAvailable && Math.abs(nextCheckPoint.angle) < 3 && nextCheckPoint.distance < 4000) {
            thrust = 'BOOST';
            tracking.boostAvailable = false;
        }

    }
    printDebug({areWeInLine:areWeInLine(myPod, enemyPod, nextCheckPoint)});
    moveToCheckPoint(nextCheckPoint.positionX, nextCheckPoint.positionY, thrust);
}

