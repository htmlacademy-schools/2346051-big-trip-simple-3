import { convertToBasicTime, getItemFromItemsById, capitalizeType } from '../utils.js';
import { pointTypes } from '../const';
import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';

const BLANK_POINT = {
  basePrice: 1234,
  dateFrom: '2066-06-16T16:16:16.375Z',
  dateTo: '2066-06-16T16:20:00.375Z',
  destination: undefined,
  id: 0,
  offersIDs: [],
  type: 'taxi',
};

function createDetinationListTemplate(destinations) {
  return destinations.map((destination) => `
    <option value="${destination.name}"></option>`
  ).join('');
}

function createOffersTemplate(offersIDs, curTypeOffers, id) {
  return curTypeOffers.map((offer) => {
    const isOfferChecked = offersIDs.includes(offer.id) ? 'checked' : '';
    return `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.title.split(' ').at(-1)}-${id}" type="checkbox" name="event-offer-${offer.title.split(' ').at(-1)}" ${isOfferChecked}>
      <label class="event__offer-label" for="event-offer-${offer.title.split(' ').at(-1)}-${id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`;
  }).join('');
}

function createImgForDestion(destination) {
  if (!destination) {
    return '';
  }
  return destination.pictures.map((img) => `<img class="event__photo" src="${img.src}" alt="${img.description}">`).join('');
}

function createEventTypeListTemplate(currentType, id) {
  return pointTypes.map((type) => `
  <div class="event__type-item">
    <input id="event-type-${type}-${id}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}" ${(type === currentType) ? 'checked' : ''}>
    <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-${id}">${capitalizeType(type)}</label>
  </div>`
  ).join('');
}

function createEditFormTemplate(isEditForm, point, offers, destinations) {
  const visibility = point.offersIDs.length === 0 ? 'visually-hidden' : '';
  const destination = getItemFromItemsById(destinations, point.destination);
  const curTypeOffers = offers.find((element) => element.type === point.type).offers;
  return (
    `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
      <label class="event__type  event__type-btn" for="event-type-toggle-${point.id}">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="${point.type}">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${point.id}" type="checkbox">
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${createEventTypeListTemplate(point.type, point.id)}
          </fieldset>
        </div>
      </div>
      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-${point.id}">
        ${capitalizeType(point.type)}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-${point.id}" type="text" name="event-destination" value="${(destination) ? destination.name : ''}" list="destination-list-${point.id}" autocomplete="off">
        <datalist id="destination-list-${point.id}">
          ${createDetinationListTemplate(destinations)}
        </datalist>
      </div>
      <div class="event__field-group  event__field-group--time">
      <label class="visually-hidden" for="event-start-time-${point.id}">From</label>
      <input class="event__input  event__input--time" id="event-start-time-${point.id}" type="text" name="event-start-time" value="${convertToBasicTime(point.dateFrom)}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-${point.id}">To</label>
        <input class="event__input  event__input--time" id="event-end-time-${point.id}" type="text" name="event-end-time" value="${convertToBasicTime(point.dateFrom)}">
      </div>
      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-${point.id}">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-${point.id}" type="number" name="event-price" value="${point.basePrice}">
      </div>
      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">${(isEditForm) ? 'Delete' : 'Cancel'}</button>
       ${(isEditForm) ? `
       <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
       </button>` :
      ''}
    </header>
    <section class="event__details">
      <section class="event__section  event__section--offers ${(curTypeOffers.length === 0) ? 'visually-hidden' : ''}">
        <h3 class="event__section-title  event__section-title--offers ${visibility}">Offers</h3>
        <div class="event__available-offers">
          ${createOffersTemplate(point.offersIDs, curTypeOffers, point.id)}
        </div>
      </section>
      <section class="event__section  event__section--destination ${(!destination) ? 'visually-hidden' : ''}">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${(destination) ? destination.description : ''}</p>
         <div class="event__photos-container">
          <div class="event__photos-tape">
          ${createImgForDestion(destination)}
          </div>
        </div>
      </section>
    </section>
  </form>
  </li>`
  );
}
export default class EditForm extends AbstractStatefulView {
  #handleRollUp = null;
  #isEditForm = null;
  #fromDatepicker = null;
  #toDatepicker = null;
  #handleDeleteClick = null;
  #destinations = [];
  #offers = [];

  static parsePointToState(point, offers) {
    return {
      ...point,
      curTypeOffers: offers.find((el) => el.type === point.type).offers
    };
  }

  static parseStateToPoint(state) {
    const point = {...state};
    delete point.curTypeOffers;
    return point;
  }

  constructor({
    point = BLANK_POINT,
    offers,
    destinations,
    isEditForm = true,
    onFormSubmit = () => (0),
    onRollUpButton,
    onDeleteClick
  }) {
    super();
    this._setState(EditForm.parsePointToState(point, offers));
    this.#offers = offers;
    this.#destinations = destinations;
    this.#isEditForm = isEditForm;
    this._callback.onFormSubmit = onFormSubmit;
    this.#handleRollUp = onRollUpButton;
    this._restoreHandlers();
    this.#handleDeleteClick = onDeleteClick;
  }

  _restoreHandlers() {
    if (this.#isEditForm) {
      this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollUpButtonHandler);
    }
    this.element.querySelector('.event--edit').addEventListener('submit', this.#submitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#eventTypeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);
    this.element.querySelector('.event__available-offers').addEventListener('change', this.#offersHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);

    this.#setFromDatePicker();
    this.#setToDatePicker();
  }

  removeElement() {
    super.removeElement();

    if (this.#fromDatepicker) {
      this.#fromDatepicker.destroy();
      this.#fromDatepicker = null;
    }

    if (this.#toDatepicker) {
      this.#toDatepicker.destroy();
      this.#toDatepicker = null;
    }
  }

  get template() {
    return createEditFormTemplate(this.#isEditForm, this._state, this.#offers, this.#destinations);
  }

  reset(point) {
    this.updateElement(
      EditForm.parsePointToState(point, this.#offers),
    );
  }

  #submitHandler = (evt) => {
    evt.preventDefault();
    this._callback.onFormSubmit(EditForm.parseStateToPoint(this._state));
  };

  #rollUpButtonHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollUp();
  };

  #eventTypeHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      type: evt.target.value,
      offersIDs: [],
      curTypeOffers: this.#offers.find((el) => el.type === evt.target.value).offers
    });
  };

  #destinationHandler = (evt) => {
    evt.preventDefault();
    this.updateElement({
      destination: this.#destinations.find((destination) => destination.name === evt.target.value).id,
    });
  };

  #priceInputHandler = (evt) => {
    evt.preventDefault();
    this._setState({
      basePrice: evt.target.value,
    });
  };

  #offersHandler = (evt) => {
    evt.preventDefault();
    const clickedOfferId = this._state.curTypeOffers.find((offer) => offer.title.split(' ').at(-1) === evt.target.name.split('-').at(-1)).id;
    const newOffersIds = this._state.offersIDs.slice();
    if (newOffersIds.includes(clickedOfferId)) {
      newOffersIds.splice(newOffersIds.indexOf(clickedOfferId), 1);
    } else {
      newOffersIds.push(clickedOfferId);
    }
    this._setState({
      offersIDs: newOffersIds
    });
  };

  #fromDateChangeHandler = ([userDate]) => {
    this.updateElement({
      dateFrom: userDate.toISOString(),
    });
    this.#toDatepicker.set('minDate', userDate);
  };

  #toDateChangeHandler = ([userDate]) => {
    this.updateElement({
      dateTo: userDate.toISOString(),
    });
  };

  #setFromDatePicker() {
    this.#fromDatepicker = flatpickr(
      this.element.querySelector(`#event-start-time-${this._state.id}`),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: convertToBasicTime(this._state.dateFrom),
        onChange: this.#fromDateChangeHandler,
      },
    );
  }

  #setToDatePicker() {
    this.#toDatepicker = flatpickr(
      this.element.querySelector(`#event-end-time-${this._state.id}`),
      {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        defaultDate: convertToBasicTime(this._state.dateTo),
        minDate: convertToBasicTime(this._state.dateFrom),
        onChange: this.#toDateChangeHandler,
      },
    );
  }

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EditForm.parseStateToPoint(this._state));
  };

}
