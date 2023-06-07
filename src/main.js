import FilterView from './view/filter-view.js';
import { render } from './framework/render.js';
import BoardPresenter from './presenter/board-presenter.js';
import ModelPoint from './model/model-point.js';
import { mockInit, tripPoints } from './mock/point.js';
import { generateFilter } from './mock/filter.js';
import ModelOffers from './model/offers-model';
import ModelDestinations from './model/destination-model';
import { offersByType } from './mock/const';
import { destinations } from './mock/destination';

const pageContainer = document.querySelector('.trip-events');
const siteFilterElement = document.querySelector('.trip-controls__filters');
mockInit(4, 10);
const filters = generateFilter();

const modelPoints = new ModelPoint(tripPoints);
const modelOffers = new ModelOffers(offersByType);
const modelDestinations = new ModelDestinations(destinations);
const boardPresenter = new BoardPresenter({
  boardContainer: pageContainer,
  pointsModel: modelPoints,
  modelOffers,
  modelDestinations
});
render(new FilterView(filters), siteFilterElement);

boardPresenter.init();
