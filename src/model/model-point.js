export default class ModelPoint {
  #tripPoints = null;
  constructor (tripPoints) {
    this.#tripPoints = tripPoints;
  }

  get tripPoints() {
    return this.#tripPoints;
  }
}
