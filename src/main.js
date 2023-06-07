import FilterView from './view/filter-view.js';
import { render } from './framework/render.js';
import BoardPresenter from './presenter/board-presenter.js';
import ModelPoint from './model/model-point.js';
import { mockInit, tripPoints } from './mock/point.js';
import { generateFilter } from './mock/filter.js';

const pageContainer = document.querySelector('.trip-events');
const siteFilterElement = document.querySelector('.trip-controls__filters');
mockInit(4, 10);
const filters = generateFilter();

const tripPointsModel = new ModelPoint(tripPoints);
const boardPresenter = new BoardPresenter({boardContainer: pageContainer, pointsModel: tripPointsModel});
render(new FilterView(filters), siteFilterElement);

boardPresenter.init();
