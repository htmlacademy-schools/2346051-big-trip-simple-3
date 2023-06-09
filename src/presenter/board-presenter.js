import SortView from '../view/sort-view';
import PointsListView from '../view/points-list-view';
import { remove, render, RenderPosition } from '../framework/render';
import NoPointsView from '../view/no-points-view';
import PointPresenter from '../presenter/point-presenter';
import { FilterType, SortType, UpdateType, UserAction } from '../const';
import { sorts } from '../sort';
import { filter } from '../utils';
import NewPointPresenter from './new-point-presenter';
import LoadingView from '../view/loading-view';
import UiBlocker from '../framework/ui-blocker/ui-blocker';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class BoardPresenter {
  #noPoints = null;
  #sort = null;
  #pointPresenter = new Map();
  #boardContainer = null;
  #pointsModel = null;
  #pointsList = new PointsListView();
  #modelOffers = null;
  #modelDestinations = null;
  #currentSortType = SortType.DAY;
  #filterType = FilterType.EVERYTHING;
  #loadingComponent = new LoadingView();
  #isLoading = true;
  #modelFilter = null;
  #newPointPresenter = null;
  #uiBlocker = new UiBlocker({
    lowerLimit: TimeLimit.LOWER_LIMIT,
    upperLimit: TimeLimit.UPPER_LIMIT
  });

  constructor({boardContainer, pointsModel, modelOffers, modelDestinations, modelFilter, onNewPointDestroy}) {
    this.#boardContainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#modelOffers = modelOffers;
    this.#modelDestinations = modelDestinations;
    this.#modelFilter = modelFilter;
    this.#newPointPresenter = new NewPointPresenter({
      pointListContainer: this.#pointsList.element,
      onDataChange: this.#handleViewAction,
      onDestroy: onNewPointDestroy
    });

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#modelFilter.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#modelFilter.filter;
    const points = this.#pointsModel.tripPoints.sort(sorts[SortType.TIME]);
    const filteredPoints = filter[this.#filterType](points);
    return (sorts[this.#currentSortType]) ? filteredPoints.sort(sorts[this.#currentSortType]) : filteredPoints;
  }

  get destinations() {
    return this.#modelDestinations.destinations;
  }

  get offers() {
    return this.#modelOffers.offers;
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    this.#currentSortType = SortType.DAY;
    this.#modelFilter.setFilter(UpdateType.MAJOR, FilterType.EVERYTHING);
    this.#newPointPresenter.init(this.destinations, this.offers);
  }

  #renderSort() {
    this.#sort = new SortView({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sort, this.#boardContainer, RenderPosition.AFTERBEGIN);
  }

  #renderNoPoint() {
    this.#noPoints = new NoPointsView({
      filterType: this.#filterType
    });
    render(this.#noPoints, this.#boardContainer, RenderPosition.AFTERBEGIN);
  }

  #renderPointsList(points) {
    points.forEach((point) => this.#renderPoint(point));
  }

  #renderHandleModeChange = () => {
    this.#newPointPresenter.destroy();
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointList: this.#pointsList.element,
      offers: this.offers,
      destinations: this.destinations,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#renderHandleModeChange,
    });
    pointPresenter.init(point, this.destinations, this.offers);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #renderBoard() {
    if (this.#isLoading) {
      this.#renderLoading();
      return;
    }
    const points = this.points;
    if (points.length === 0) {
      this.#renderNoPoint();
      return;
    }

    this.#renderSort();

    render(this.#pointsList, this.#boardContainer);
    this.#renderPointsList(points);
  }

  #renderLoading() {
    render(this.#loadingComponent, this.#boardContainer, RenderPosition.AFTERBEGIN);
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard();
    this.#renderBoard();
  };

  #handleViewAction = async (actionType, updateType, update) => {
    this.#uiBlocker.block();
    switch (actionType) {
      case UserAction.ADD_POINT:
        this.#newPointPresenter.setSaving();
        try {
          await this.#pointsModel.addPoint(updateType, update);
        } catch (err) {
          this.#pointPresenter.get(update.id).setAborting();
        }
        break;
      case UserAction.UPDATE_POINT:
        this.#pointPresenter.get(update.id).setSaving();
        try {
          await this.#pointsModel.updatePoint(updateType, update);
        } catch (err) {
          this.#pointPresenter.get(update.id).setAborting();
        }
        break;
      case UserAction.DELETE_POINT:
        this.#pointPresenter.get(update.id).setDeleting();
        try {
          await this.#pointsModel.deletePoint(updateType, update);
        } catch (err) {
          this.#pointPresenter.get(update.id).setAborting();
        }
        break;
    }
    this.#uiBlocker.unblock();
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case UpdateType.PATCH:
        this.#pointPresenter.get(data.id).init(data, this.destinations, this.offers);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case UpdateType.INIT:
        this.#isLoading = false;
        remove(this.#loadingComponent);
        this.#renderBoard();
        break;
    }
  };

  #clearBoard(resetSortType = false) {
    this.#newPointPresenter.destroy();
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();

    remove(this.#sort);
    remove(this.#loadingComponent);

    if (this.#noPoints) {
      remove(this.#noPoints);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

}
