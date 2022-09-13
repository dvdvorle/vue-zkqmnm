class Coordinate {
  constructor(decimalDegrees) {
    this.decimalDegrees = decimalDegrees;
  }

  get radians() {
    return (this.decimalDegrees * Math.PI) / 180;
  }

  get degrees() {
    return Math.trunc(this.decimalDegrees);
  }

  get decimalMinutes() {
    return (this.decimalDegrees - this.degrees) * 60;
  }

  get minutes() {
    return Math.trunc(this.decimalMinutes);
  }

  get decimalSeconds() {
    return (this.decimalMinutes - this.minutes) * 60;
  }

  get asDegrees() {
    return `${this.decimalDegrees}°`;
  }

  get asDegreesMinutes() {
    return `${this.degrees}°${this.decimalMinutes
      .toFixed(3)
      .padStart(6, '0')}'`;
  }

  get asDegreesMinutesSeconds() {
    return `${this.degrees}°${this.minutes}'${this.decimalSeconds
      .toFixed(3)
      .padStart(6, '0')}"`;
  }
}

class Position {
  constructor(position) {
    this.position = position;
    this.longitude = new Coordinate(position.coords.longitude);
    this.latitude = new Coordinate(position.coords.latitude);
  }

  get accuracy() {
    return this.position.coords.accuracy;
  }

  get timestamp() {
    return new Date(this.position.timestamp);
  }
}

const R = 6371e3; // metres

class Geodesic {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  calcBearing(from, to) {
    const φ1 = from.latitude.radians;
    const φ2 = to.latitude.radians;
    const λ1 = from.longitude.radians;
    const λ2 = to.longitude.radians;

    const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
    const θ = Math.atan2(y, x);
    const degrees = ((θ * 180) / Math.PI + 360) % 360; // in degrees
    return degrees;
  }

  get bearing() {
    return this.calcBearing(this.from, this.to);
  }
  get cog() {
    return this.calcBearing(this.to, this.from) + (180 % 360);
  }
  get distance() {
    const φ1 = this.from.latitude.radians;
    const φ2 = this.to.latitude.radians;
    const λ1 = this.from.longitude.radians;
    const λ2 = this.to.longitude.radians;
    const Δφ = φ2 - φ1;
    const Δλ = λ2 - λ1;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  }
  get speed() {
    return (
      this.distance /
      ((this.to.timestamp.getTime() - this.from.timestamp.getTime()) /
      1000)
    );
  }
}

export default {
  Position,
  Coordinate,
  Geodesic,
};
