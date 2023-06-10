import BoardPresenter from './presenter/board-presenter.js';
import ModelPoint from './model/model-point.js';
import ModelOffers from './model/offers-model';
import ModelFilters from './model/filter-model';
import FilterPresenter from './presenter/filter-presenter';
import NewPointButtonView from './view/new-point-button-view';
import { render } from './render';
import PointsApiService from './points-api-service.js';

const pageContainer = document.querySelector('.trip-events');
const siteFilterElement = document.querySelector('.trip-controls__filters');
const placeForButton = document.querySelector('.trip-main');

const AUTHORIZATION = 'Basic jdurbfsh523';
const END_POINT = 'https://18.ecmascript.pages.academy/big-trip';

const pointsApiService = new PointsApiService(END_POINT, AUTHORIZATION);
const modelOffers = new ModelOffers({pointsApiService});
const modelPoints = new ModelPoint({pointsApiService});
const modelFilter = new ModelFilters();

const boardPresenter = new BoardPresenter({
  boardContainer: pageContainer,
  pointsModel: modelPoints,
  modelOffers: modelOffers,
  modelFilter: modelFilter,
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
modelPoints.init()
  .finally(() => {
    render(newPointButtonComponent, placeForButton);
  });
