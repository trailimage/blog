"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const constants_1 = require("../constants");
const _1 = require("./");
const piDeg = Math.PI / 180.0;
const radiusMiles = 3958.756;
const radiusKm = 6371.0;
const feetPerMeter = 3.28084;
const units = { ENGLISH: 0, METRIC: 1 };
let earthRadius = radiusMiles;
let elevationConversion = feetPerMeter;
const length = (points) => points.reduce((total, p, i) => total + ((i > 0) ? pointDistance(points[i - 1], p) : 0), 0);
function speed(p1, p2) {
    const t = Math.abs(p1[_1.default.TIME] - p2[_1.default.TIME]);
    const d = pointDistance(p1, p2);
    return (t > 0 && d > 0) ? d / (t / constants_1.default.time.HOUR) : 0;
}
function duration(line) {
    const firstPoint = line[0];
    const lastPoint = line[line.length - 1];
    return (lastPoint[_1.default.TIME] - firstPoint[_1.default.TIME]) / (1000 * 60 * 60);
}
function pointDistance(p1, p2) {
    if (sameLocation(p1, p2)) {
        return 0;
    }
    const radLat1 = toRadians(p1[_1.default.LAT]);
    const radLat2 = toRadians(p2[_1.default.LAT]);
    const latDistance = toRadians(p2[_1.default.LAT] - p1[_1.default.LAT]);
    const lonDistance = toRadians(p2[_1.default.LON] - p1[_1.default.LON]);
    const a = Math.pow(Math.sin(latDistance / 2), 2)
        + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(lonDistance / 2), 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
}
const toRadians = (deg) => deg * piDeg;
function pointLineDistance(p, p1, p2) {
    let x = p1[_1.default.LON];
    let y = p1[_1.default.LAT];
    let Δx = p2[_1.default.LON] - x;
    let Δy = p2[_1.default.LAT] - y;
    if (Δx !== 0 || Δy !== 0) {
        const t = ((p[_1.default.LON] - x) * Δx + (p[_1.default.LAT] - y) * Δy) / (Δx * Δx + Δy * Δy);
        if (t > 1) {
            x = p2[_1.default.LON];
            y = p2[_1.default.LAT];
        }
        else if (t > 0) {
            x += Δx * t;
            y += Δy * t;
        }
    }
    Δx = p[_1.default.LON] - x;
    Δy = p[_1.default.LAT] - y;
    return Δx * Δx + Δy * Δy;
}
const sameLocation = (p1, p2) => p1[_1.default.LAT] == p2[_1.default.LAT] && p1[_1.default.LON] == p2[_1.default.LON];
function simplify(points) {
    if (config_1.default.map.maxPointDeviationFeet <= 0) {
        return points;
    }
    const yard = 3;
    const mile = yard * 1760;
    const equatorFeet = mile * radiusMiles;
    const len = points.length;
    const keep = new Uint8Array(len);
    const tolerance = config_1.default.map.maxPointDeviationFeet / equatorFeet;
    let first = 0;
    let last = len - 1;
    const stack = [];
    let maxDistance = 0;
    let distance = 0;
    let index = 0;
    keep[first] = keep[last] = 1;
    while (last) {
        maxDistance = 0;
        for (let i = first + 1; i < last; i++) {
            distance = pointLineDistance(points[i], points[first], points[last]);
            if (distance > maxDistance) {
                index = i;
                maxDistance = distance;
            }
        }
        if (maxDistance > tolerance) {
            keep[index] = 1;
            stack.push(first, index, index, last);
        }
        last = stack.pop();
        first = stack.pop();
    }
    return points.filter((p, i) => keep[i] == 1);
}
exports.default = {
    speed,
    length,
    duration,
    toRadians,
    sameLocation,
    pointDistance,
    simplify,
    set unitType(u) {
        if (u == units.ENGLISH) {
            earthRadius = radiusMiles;
            elevationConversion = feetPerMeter;
        }
        else {
            earthRadius = radiusKm;
            elevationConversion = 1;
        }
    }
};
//# sourceMappingURL=measure.js.map