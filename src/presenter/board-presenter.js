import SortView from '../view/sort-view';
import PointsListView from '../view/points-list-view';
import PointView from '../view/point-view';
import EditFormView from '../view/edit-form-view';
import NewItemFormView from '../view/creation-form-view';
import { render } from '../render';

export default class BoardPresenter {
  eventListComponent = new PointsListView();

  constructor({boardContainer, tripPointsModel}) {
    this.boardContainer = boardContainer;
    this.tripPointsModel = tripPointsModel;
  }

  init() {
    this.tripPoints = [...this.tripPointsModel.getTripPoints()];

    render(new SortView(), this.boardContainer);
    render(this.eventListComponent, this.boardContainer);

    render(new NewItemFormView(), this.eventListComponent.getElement());
    render(new EditFormView(), this.eventListComponent.getElement());

    for (let i = 0; i < this.tripPoints.length; i++) {
      render(new PointView({tripPoint: this.tripPoints[i]}), this.eventListComponent.getElement());
    }
  }
}
