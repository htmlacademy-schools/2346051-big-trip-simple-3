import { render, replace, remove } from '../framework/render';
import PointView from '../view/point-view';
import EditForm from '../view/edit-form-view';
import { isEscapeKey } from '../utils';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING'
};

export default class PointPresenter {
  #handleModeChange = null;
  #pointList = null;
  #editFormComponent = null;
  #pointComponent = null;
  #point = null;
  #mode = Mode.DEFAULT;
  #offers = [];
  #destinations = [];
  #handleDataChange = null;

  constructor({pointList, onModeChange, offers, destinations, onDataChange}) {
    this.#pointList = pointList;
    this.#handleModeChange = onModeChange;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#handleDataChange = onDataChange;
  }

  init(point, destinations, offers) {
    this.#point = point;
    this.#destinations = destinations;
    this.#offers = offers;

    const prevPointComponent = this.#pointComponent;
    const prevEditFormComponent = this.#editFormComponent;

    this.#pointComponent = new PointView({
      tripPoint: this.#point,
      onEditClick: this.#handleEditClick,
      offers: this.#offers,
      destinations: this.#destinations,
    });

    this.#editFormComponent = new EditForm({
      point: point,
      onFormSubmit: this.#handleFormSubmit,
      offers: this.#offers,
      destinations: this.#destinations,
      onRollUpButton: this.#handleButtonClick,
    });

    if (prevPointComponent === null || prevEditFormComponent === null) {
      render(this.#pointComponent, this.#pointList);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#editFormComponent, prevEditFormComponent);
    }

    remove(prevEditFormComponent);
    remove(prevPointComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#editFormComponent);
  }

  resetView() {
    if (this.#mode !== Mode.DEFAULT) {
      this.#editFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
    }
  }

  #replacePointToForm = () => {
    replace(this.#editFormComponent, this.#pointComponent);
    this.#handleModeChange();
    this.#mode = Mode.EDITING;
  };

  #replaceFormToPoint = () => {
    replace(this.#pointComponent, this.#editFormComponent);
    this.#mode = Mode.DEFAULT;
  };

  #escKeydown = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#editFormComponent.reset(this.#point);
      this.#replaceFormToPoint();
      document.body.removeEventListener('keydown', this.#escKeydown);
    }
  };

  #handleEditClick = () => {
    this.#replacePointToForm();
    document.body.addEventListener('keydown', this.#escKeydown);
  };

  #handleFormSubmit = (point) => {
    this.#handleDataChange(point);
    this.#replaceFormToPoint();
    document.body.removeEventListener('keydown', this.#escKeydown);
  };

  #handleButtonClick = () => {
    this.#editFormComponent.reset(this.#point);
    this.#replaceFormToPoint();
    document.body.removeEventListener('keydown', this.#escKeydown);
  };
}
