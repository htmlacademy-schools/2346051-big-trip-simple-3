import SortView from '../view/sort-view';
import PointsListView from '../view/points-list-view';
import { render, RenderPosition } from '../framework/render';
import NoPointsView from '../view/no-points-view';
import PointPresenter from '../presenter/point-presenter';
import { SortType } from '../mock/const';
import { sorts } from '../mock/sort';
import { updatePoint } from '../utils';
import EditForm from '../view/edit-form-view';

export default class BoardPresenter {
  #boardContainer = null;
  #pointsModel = null;
  #noPoints = new NoPointsView();
  #sort = new SortView();
  #pointPresenter = new Map();
  #pointsList = new PointsListView();
  #points = null;
  #currentSortType = SortType.DAY;
  #sourcedPoints = [];
  #offers = [];
  #destinations = [];
  #modelOffers = null;
  #modelDestinations = null;

  constructor({boardContainer, pointsModel, modelOffers, modelDestinations}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#modelOffers = modelOffers;
    this.#modelDestinations = modelDestinations;
  }

  init() {
    this.#points = [...this.#pointsModel.tripPoints];
    this.#sourcedPoints = [...this.#pointsModel.tripPoints];
    this.#offers = [...this.#modelOffers.offers];
    this.#destinations = [...this.#modelDestinations.destinations];
    this.#renderBoard();
  }

  #renderSort() {
    render(this.#sort, this.#boardContainer, RenderPosition.AFTERBEGIN);
    this.#sort.setSortTypeChangeHandler(this.#handleSortTypeChange);
  }

  #renderNoPoint() {
    render(this.#noPoints, this.#boardContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPointsList() {
    render(this.#pointsList, this.#boardContainer);
    this.#points.forEach((point) => this.#renderPoint(point));
  }

  #renderHandleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointList: this.#pointsList.element,
      offers: this.#offers,
      destinations: this.#destinations,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#renderHandleModeChange,
    });
    pointPresenter.init(point, this.#destinations, this.#offers);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #renderBoard() {
    if (this.#points.length === 0) {
      render(this.#renderNoPoint, this.#boardContainer);
      return;
    }

    this.#renderSort();

    render(new EditForm({
      destinations: this.#destinations,
      offers: this.#offers,
      isEditForm: false
    }), this.#pointsList.element);
    this.#renderPointsList();
  }

  #clearPointList() {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  }

  #sortPoints(sortType) {
    if (sorts[sortType]) {
      this.#points.sort(sorts[sortType]);
    } else {
      this.#points = [...this.#sourcedPoints];
    }
    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#sortPoints(sortType);
    this.#clearPointList();
    this.#renderPointsList();
  };

  #handlePointChange = (updatedPoint) => {
    this.#points = updatePoint(this.#points, updatedPoint);
    this.#pointPresenter.get(updatedPoint.id).init(updatedPoint, this.#destinations, this.#offers);
  };

}
