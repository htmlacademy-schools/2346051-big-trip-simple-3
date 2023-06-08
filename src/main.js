import BoardPresenter from './presenter/board-presenter.js';
import ModelPoint from './model/model-point.js';
import { mockInit, tripPoints } from './mock/point.js';
import ModelOffers from './model/offers-model';
import ModelDestinations from './model/destination-model';
import { offersByType } from './mock/const';
import { destinations } from './mock/destination';
import ModelFilters from './model/filter-model';
import FilterPresenter from './presenter/filter-presenter';
import NewPointButtonView from './view/new-point-button-view';
import { render } from './render';

const pageContainer = document.querySelector('.trip-events');
const siteFilterElement = document.querySelector('.trip-controls__filters');
const placeForButton = document.querySelector('.trip-main');

mockInit(4, 10);

const modelPoints = new ModelPoint(tripPoints);
const modelOffers = new ModelOffers(offersByType);
const modelDestinations = new ModelDestinations(destinations);
const modelFilter = new ModelFilters();
const boardPresenter = new BoardPresenter({
  boardContainer: pageContainer,
  pointsModel: modelPoints,
  modelOffers,
  modelDestinations: modelDestinations,
  modelFilter,
  onNewPointDestroy: handleNewTaskFormClose
});

const filterPresenter = new FilterPresenter({
  filterContainer: siteFilterElement,
  modelFilter: modelFilter,
  modelTripPoints: modelPoints
});

const newPointButtonComponent = new NewPointButtonView({
  onClick: handleNewTaskButtonClick
});

function handleNewTaskFormClose() {
  newPointButtonComponent.element.disabled = false;
}

function handleNewTaskButtonClick() {
  boardPresenter.createPoint();
  newPointButtonComponent.element.disabled = true;
}

render(newPointButtonComponent, placeForButton);

filterPresenter.init();

boardPresenter.init();
