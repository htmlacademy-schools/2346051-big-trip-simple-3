import {createElement} from '../render.js';

function createTripPointListTemplate() {
  return '<ul class="trip-events__list"></ul>';
}

export default class PointsListView {
  #element = null;
  get template() {
    return createTripPointListTemplate();
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  removeElement() {
    this.#element = null;
  }
}
