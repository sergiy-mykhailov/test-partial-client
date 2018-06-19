import * as React from 'react';
import * as styles from './styles.css';
import * as classnames from 'classnames';
import { Input } from '../Input';
import { Button } from '../Button';
import { Label } from '../Label';
import SaleService from '../../../services/sales';
import { improvementsLabels, IImprovementLabel } from '../labels';
import { Improvement } from '../../../types';

export interface ImprovementFormProps {
  improvement: Improvement;
  onSave: (improvement: Improvement, isNew: boolean) => void;
  onDelete: (improvement_id: number) => void;
  createImprovement: (improvement: Improvement) => Promise<Improvement>;
  updateImprovement: (id: number, improvement: Improvement) => Promise<Improvement>;
  deleteImprovement: (id: number) => void;
}

export interface ImprovementFormSate {
  editableImprovement: Partial<Improvement>;
}

export class ImprovementForm extends React.Component<ImprovementFormProps, ImprovementFormSate> {
  state = {
    editableImprovement: {}
  };

  async componentDidMount() {
    this.setState({ editableImprovement: this.props.improvement });
  }

  async saveImprovement() {
    let { editableImprovement } = this.state;
    let newImprovement: Improvement;
    if (editableImprovement['id'] != undefined) {
      newImprovement = await this.props.updateImprovement(
        editableImprovement['id'],
        editableImprovement as Improvement
      );
    } else {
      newImprovement = await this.props.createImprovement(editableImprovement as Improvement);
    }
    this.setState({ editableImprovement: newImprovement });
    this.props.onSave(newImprovement, editableImprovement['id'] != undefined);
  }

  async deleteImprovement() {
    let { editableImprovement } = this.state;
    if (editableImprovement['id'] != undefined) {
      await this.props.deleteImprovement(editableImprovement['id']);
    }
    this.props.onDelete(editableImprovement['id']);
  }

  updateImprovement(key: string, value: string) {
    let { editableImprovement } = this.state;
    this.setState({
      editableImprovement: {
        ...editableImprovement,
        [key]: value
      }
    });
  }

  render() {
    let { improvement } = this.props;
    let { editableImprovement } = this.state;

    return (
      <div className={styles.ImprovementFormSection}>
        {improvementsLabels.map(label => {
          return (
            <div key={improvement.id + label.key} className={styles.InputContainer}>
              <Label>{label.label}</Label>
              <Input
                placeholder={label.label}
                value={editableImprovement[label.key] || ''}
                onChange={e => this.updateImprovement(label.key, e.target.value)}
              />
            </div>
          );
        })}
        <div className={styles.ImprovementFormSubmit}>
          <Button buttonType="submit" onClick={this.saveImprovement.bind(this)}>
            Save
          </Button>
          <Button onClick={this.deleteImprovement.bind(this)}>Delete</Button>
        </div>
      </div>
    );
  }
}
