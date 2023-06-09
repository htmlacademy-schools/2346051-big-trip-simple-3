import { render, RenderPosition } from '../render';
import { UpdateType, UserAction } from '../const';
import EditForm from '../view/edit-form-view';
import { remove } from '../framework/render';
import { isEscapeKey } from '../utils';

export default class NewPointPresenter {
  #handleDataChange = null;
  #handleDestroy = null;
  #pointListContainer = null;
  #pointEditComponent = null;

  constructor({pointListContainer, onDataChange, onDestroy}) {
    this.#pointListContainer = pointListContainer;
    this.#handleDataChange = onDataChange;
    this.#handleDestroy = onDestroy;
  }

  init(destinations, offers) {
    if (this.#pointEditComponent !== null) {
      return;
    }

    this.#pointEditComponent = new EditForm({
      destinations: destinations,
      offers: offers,
      onFormSubmit: this.#handleFormSubmit,
      onDeleteClick: this.#handleDeleteClick,
      isEditForm: false
    });

    render(this.#pointEditComponent, this.#pointListContainer,
      RenderPosition.AFTERBEGIN);

    document.body.addEventListener('keydown', this.#escKeyDownHandler);
  }

  setSaving() {
    this.#pointEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  }

  setAborting() {
    const resetFormState = () => {
      this.#pointEditComponent.updateElement({
        isDisabled: false,
        isSavinf: false,
        isDeleting: false,
      });
    };

    this.#pointEditComponent.shake(resetFormState);
  }

  destroy() {
    if (this.#pointEditComponent === null) {
      return;
    }

    this.#handleDestroy();

    remove(this.#pointEditComponent);
    this.#pointEditComponent = null;

    document.body.removeEventListener('keydown', this.#escKeyDownHandler);
  }


  #escKeyDownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.destroy();
    }
  };

  #handleFormSubmit = (point) => {
    this.#handleDataChange(
      UserAction.ADD_POINT,
      UpdateType.MINOR,

      this.#deleteId(point)
    );

    this.destroy();
  };

  #handleDeleteClick = () => {
    this.destroy();
  };

  #deleteId = (point) => {
    delete point.id;
    return point;
  };
}
