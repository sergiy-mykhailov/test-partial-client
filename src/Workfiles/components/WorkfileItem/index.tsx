import * as React from 'react';
import { Workfile } from '../../../types';
import * as styles from './styles.css';
import { format } from 'date-fns';
import { Button } from '../../../shared/components/Button';
import { Link } from 'react-router-dom';
import * as classnames from 'classnames';
import WorkfileService from '../../../services/workfiles';
import { WorkfileMenu } from '../WorkfileMenu';

export interface WorkfileItemProps {
  workfile: Workfile;
  updateWorkfiles: Function;
}

export class WorkfileItem extends React.Component<WorkfileItemProps, null> {
  render() {
    let { workfile } = this.props;

    return (
      <div className={styles.WorkfileItem}>
        <div className={styles.WorkfileMain}>
          <div className={styles.WorkfileItemName}>{workfile.name}</div>

          <div className={styles.WorkfileItemPreparedFor}>
            <div className={styles.WorkfileItemSectionHeader}>Prepared For:</div>

            <div className={styles.WorkfileItemSectionText}>{workfile.client_name}</div>
          </div>

          <div className={styles.WorkfileItemDateCreated}>
            <div className={styles.WorkfileItemSectionHeader}>Date Created:</div>
            <div className={styles.WorkfileItemSectionText}>
              {format(workfile.created_at, 'M / D / YY')}
            </div>
          </div>

          <div className={styles.WorkfileButtonDiv}>
            <Link to={`/workfiles/${workfile.id}/client`}>
              <Button type="secondary">Continue</Button>
            </Link>
          </div>
        </div>
        <WorkfileMenu workfileId={workfile.id} updateWorkfiles={this.props.updateWorkfiles} />
      </div>
    );
  }
}
