import SortView from '../view/sort-view';
import PointsListView from '../view/points-list-view';
import { render, RenderPosition } from '../framework/render';
import CreationFormView from '../view/creation-form-view';
import NoPointsView from '../view/no-points-view';
import PointPresenter from '../presenter/point-presenter';
import { SortType } from '../mock/const';
import { sorts } from '../mock/sort';

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

  constructor({boardContainer, pointsModel}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#points = [...this.#pointsModel.tripPoints];
    this.#renderBoard();
    this.#sourcedPoints = [...this.#pointsModel.tripPoints];
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
    this.#renderPoints();
  }

  #renderHandleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointList: this.#pointsList.element,
      onModeChange: this.#renderHandleModeChange
    });
    pointPresenter.init(point);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #renderPoints() {
    this.#points.forEach((point) => this.#renderPoint(point));
  }

  #renderBoard() {
    if (this.#points.length === 0) {
      render(this.#renderNoPoint, this.#boardContainer);
      return;
    }

    this.#renderSort();

    render(new CreationFormView(this.#points[0]), this.#pointsList.element);
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

}
