import Observable from '../framework/observable';
import { UpdateType } from '../const';

export default class ModelPoint extends Observable {
  #tripPoints = [];
  #pointsApiService = null;
  #destinations = [];
  constructor ({pointsApiService}) {
    super();
    this.#pointsApiService = pointsApiService;
  }

  get tripPoints() {
    return this.#tripPoints;
  }

  get destinations() {
    return this.#destinations;
  }

  async init() {
    try {
      const destinations = await this.#pointsApiService.destinations;
      this.#destinations = destinations;
    } catch(err) {
      this.#destinations = [];
    }
    try {
      const points = await this.#pointsApiService.points;
      this.#tripPoints = points.map(this.#adaptToClient);
    } catch(err) {
      this.#tripPoints = [];
    }
    this._notify(UpdateType.INIT);
  }

  async updatePoint(updateType, update) {
    const index = this.#tripPoints.findIndex((tripPoints) => tripPoints.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting tripPoints');
    }

    try {
      const response = await this.#pointsApiService.updatePoint(update);
      const updatedPoint = this.#adaptToClient(response);
      this.#tripPoints = [
        ...this.#tripPoints.slice(0, index),
        updatedPoint,
        ...this.#tripPoints.slice(index + 1),
      ];
      this._notify(updateType, updatedPoint);
    } catch(err) {
      throw new Error('Can\'t update point');
    }
  }

  async addPoint(updateType, update) {
    try {
      const response = await this.#pointsApiService.addPoint(update);
      const newPoint = this.#adaptToClient(response);
      this.#tripPoints = [newPoint, ...this.#tripPoints];
      this._notify(updateType, newPoint);
    } catch(err) {
      throw new Error('Can\'t add tripPoints');
    }
  }

  async deletePoint(updateType, update) {
    const index = this.#tripPoints.findIndex((tripPoints) => tripPoints.id === update.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting tripPoints');
    }

    try {
      await this.#pointsApiService.deletePoint(update);
      this.#tripPoints = [
        ...this.#tripPoints.slice(0, index),
        ...this.#tripPoints.slice(index + 1),
      ];
      this._notify(updateType);
    } catch (err) {
      throw new Error('Can\'t delete tripPoints');
    }
  }

  #adaptToClient(point) {
    const adaptedPoint = {
      ...point,
      dateFrom: point['date_from'],
      dateTo: point['date_to'],
      offersIDs: point['offers'],
      basePrice: point['base_price'],
    };

    delete adaptedPoint['date_from'];
    delete adaptedPoint['date_to'];
    delete adaptedPoint['base_price'];
    delete adaptedPoint['offers'];

    return adaptedPoint;
  }
}
