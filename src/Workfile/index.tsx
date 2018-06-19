import * as React from 'react';
import * as styles from './styles.css';
import { Workfile as IWorkfile, WorkfileStatus } from '../types';
import { RouteComponentProps, Route, Switch } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Report } from './components/Report';
import { ReportBuilder } from './components/ReportBuilder';
import { ReportPreview } from './components/ReportPreview';
import { OuterWrapper } from '../shared/layouts/OuterWrapper';
import { MainContent } from '../shared/layouts/MainContent';

interface Params {
  workfileId: string;
}

export const Workfile = ({ match }: RouteComponentProps<Params>) => {
  return (
    <OuterWrapper>
      <Route path="/workfiles/:workfileId" component={Sidebar} />

      <MainContent>
        <Switch>

          <Route path="/workfiles/:workfileId/report-builder" component={ReportBuilder} />

          <Route path="/workfiles/:workfileId/report-preview" component={ReportPreview} />
        </Switch>
      </MainContent>
    </OuterWrapper>
  );
};
