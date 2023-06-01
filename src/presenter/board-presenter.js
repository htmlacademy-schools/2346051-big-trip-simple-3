import SortView from '../view/sort-view';
import PointsListView from '../view/points-list-view';
import PointView from '../view/point-view';
import EditFormView from '../view/edit-form-view';
import CreationFormView from '../view/creation-form-view';
import NoPointsView from '../view/no-points-view';
import { render } from '../render';
import { isEscapeKey } from '../utils';

export default class BoardPresenter {
  #boardContainer = null;
  #tripPointsModel = null;
  #eventListComponent = null;
  #tripPoints = null;

  constructor({boardContainer, tripPointsModel}) {
    this.#boardContainer = boardContainer;
    this.#tripPointsModel = tripPointsModel;
  }

  init() {
    this.#tripPoints = [...this.#tripPointsModel.tripPoints];
    if (this.#tripPoints.length === 0) {
      render(new NoPointsView(), this.#boardContainer);
    } else {
      this.#eventListComponent = new PointsListView();
      render(new SortView(), this.#boardContainer);
      render(this.#eventListComponent, this.#boardContainer);

      render(new CreationFormView(this.#tripPoints[0]), this.#eventListComponent.element);

      for (let i = 1; i < this.#tripPoints.length - 1; i++) {
        this.#renderTripPoint(this.#tripPoints[i]);
      }
    }
  }

  #renderTripPoint(tripPoint) {
    const tripPointComponent = new PointView({tripPoint});
    const editFormComponent = new EditFormView(tripPoint);

    const replacePointToForm = () => {
      this.#eventListComponent.element.replaceChild(editFormComponent.element, tripPointComponent.element);
    };

    const replaceFormToPoint = () => {
      this.#eventListComponent.element.replaceChild(tripPointComponent.element, editFormComponent.element);
    };

    tripPointComponent.element.querySelector('.event__rollup-btn').addEventListener('click', () => {
      replacePointToForm();
      document.body.addEventListener('keydown', closeEditFormOnEcsapeKey);
    });

    editFormComponent.element.querySelector('.event__save-btn').addEventListener('click', (evt) => {
      evt.preventDefault();
      replaceFormToPoint();
      document.body.removeEventListener('keydown', closeEditFormOnEcsapeKey);
    });

    editFormComponent.element.querySelector('.event__rollup-btn').addEventListener('click', () => {
      replaceFormToPoint();
      document.body.removeEventListener('keydown', closeEditFormOnEcsapeKey);
    });

    function closeEditFormOnEcsapeKey(evt) {
      if (isEscapeKey(evt)) {
        evt.preventDefault();
        replaceFormToPoint();
        document.body.removeEventListener('keydown', closeEditFormOnEcsapeKey);
      }
    }

    render(tripPointComponent, this.#eventListComponent.element);
  }
}
