import * as React from 'react';
import { Workfile, WorkfileDuplicateParams } from '../../../types';
import * as styles from './styles.css';
import * as classnames from 'classnames';
import { Button } from '../../../shared/components/Button';
import WorkfileService from '../../../services/workfiles';
import { WorkfileDuplicateModal } from './WorkfileDuplicateModal';

interface WorkfileMenuProps {
  workfileId: string;
  updateWorkfiles: Function;
}

export interface WorkfileMenuState {
  moreMenuOpen: boolean;
  showModal: boolean;
}

export class WorkfileMenu extends React.Component<WorkfileMenuProps, WorkfileMenuState> {
  state = {
    moreMenuOpen: false,
    showModal: false
  };

  toggleMoreMenu() {
    this.setState({ moreMenuOpen: !this.state.moreMenuOpen });
  }

  onDuplicateClick() {
    this.setState({ showModal: true });
  }

  async onDuplicateModalOk(params: WorkfileDuplicateParams) {
    await WorkfileService.duplicateWorkfile(parseInt(this.props.workfileId), params);
    this.setState({ showModal: false });
    this.props.updateWorkfiles();
  }

  async onDeleteClick() {
    await WorkfileService.deleteWorkfile(parseInt(this.props.workfileId));
    this.props.updateWorkfiles();
  }

  render() {
    let { showModal, moreMenuOpen } = this.state;

    return (
      <div className={styles.WorkfileEdit}>
        <div
          className={classnames(styles.WorkfileMenu, {
            [styles.WorkfileMenuOpen]: moreMenuOpen
          })}
        >
          <WorkfileDuplicateModal
            show={showModal}
            onOk={this.onDuplicateModalOk.bind(this)}
            workfileId={this.props.workfileId}
          />
          <div className={styles.WorkfileMenuItem} onClick={this.onDuplicateClick.bind(this)}>
            Duplicate
          </div>
          <div className={styles.WorkfileMenuItem} onClick={this.onDeleteClick.bind(this)}>
            Delete
          </div>
        </div>
        <div
          className={classnames('fa fa-ellipsis-v', styles.WorkfileMenuButton)}
          onClick={this.toggleMoreMenu.bind(this)}
        />
      </div>
    );
  }
}
