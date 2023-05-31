import { getRandomPoint } from '../mock/point';

const POINT_COUNT = 3;

export default class ModelPoint {
  tripPoints = Array.from({length: POINT_COUNT}, getRandomPoint);

  getTripPoints() {
    return this.tripPoints;
  }
}
