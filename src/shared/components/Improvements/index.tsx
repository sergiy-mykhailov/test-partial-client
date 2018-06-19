import * as React from 'react';
import * as classnames from 'classnames';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Improvement } from '../../../types';
import { ImprovementForm } from './ImprovementForm';
import SaleService from '../../../services/sales';

export interface ImprovementsProps {
  fetchImprovements: () => Promise<Improvement[]>;
  createImprovement: (improvement: Improvement) => Promise<Improvement>;
  updateImprovement: (id: number, improvement: Improvement) => Promise<Improvement>;
  deleteImprovement: (id: number) => void;
}

export interface ImprovementsSate {
  modalOpen: boolean;
  improvements: Improvement[];
  newButtonEnabled: boolean;
}

export class Improvements extends React.Component<ImprovementsProps, ImprovementsSate> {
  state = {
    modalOpen: false,
    improvements: [],
    newButtonEnabled: true
  };

  componentDidMount() {
    this.fetchImprovements();
  }

  async fetchImprovements() {
    let improvements = await this.props.fetchImprovements();
    this.setState({ improvements: improvements });
  }

  addNewImprovement() {
    let { improvements } = this.state;
    improvements.push({} as Improvement);
    this.setState({ improvements, newButtonEnabled: false });
  }

  onImprovementSaved(savedImprovement: Improvement, isNew: boolean) {
    let { improvements } = this.state;
    let improvementIndex;
    if (isNew) {
      this.setState({ newButtonEnabled: true });
      improvementIndex = improvements.findIndex(i => i.id == undefined);
    } else {
      improvementIndex = improvements.findIndex(i => i.id == savedImprovement.id);
    }
    improvements.splice(improvementIndex, 1, savedImprovement);
    this.setState({ improvements: improvements });
  }

  onImprovementDelete(improvement_id: number) {
    let { improvements } = this.state;
    let index = improvements.findIndex(i => i.id == improvement_id);
    improvements.splice(index, 1);
    this.setState({ improvements: improvements });
    if (improvement_id == undefined) this.setState({ newButtonEnabled: true });
  }

  render() {
    let { modalOpen, improvements, newButtonEnabled } = this.state;

    return (
      <div>
        <Modal
          show={modalOpen}
          showOk={false}
          showCancel={true}
          onCancel={() => this.setState({ modalOpen: false })}
          cancelText="Close"
        >
          {improvements.map((imp, i) => {
            return (
              <ImprovementForm
                improvement={imp}
                onSave={this.onImprovementSaved.bind(this)}
                onDelete={this.onImprovementDelete.bind(this)}
                createImprovement={this.props.createImprovement}
                updateImprovement={this.props.updateImprovement}
                deleteImprovement={this.props.deleteImprovement}
                key={i + imp.id}
              />
            );
          })}
          <Button onClick={this.addNewImprovement.bind(this)} disabled={!newButtonEnabled}>
            + New Improvement
          </Button>
        </Modal>
        <Button onClick={() => this.setState({ modalOpen: true })}>Improvements</Button>
      </div>
    );
  }
}
