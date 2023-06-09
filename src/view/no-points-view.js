import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const';

const NoTasksTextType = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
};

function createNoPoitsTemplate(filterType) {
  return `<p class="trip-events__msg">${NoTasksTextType[filterType]}</p>`;
}

export default class NoPointsView extends AbstractView{
  #filterType = null;

  constructor({filterType}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createNoPoitsTemplate(this.#filterType);
  }

}
