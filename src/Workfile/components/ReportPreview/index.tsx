import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
var ContentEditable = require('react-contenteditable');
import * as styles from './styles.css';
import { Report } from '../../../types/Report';
import ReportService from '../../../services/reports';

export interface ReportBuilderState {
  reports: Report[];
  pages: number;
}

export interface ReportBuilderProps {
  tractId: string;
  workfileId: string;
}

export class ReportPreview extends React.Component<
  RouteComponentProps<ReportBuilderProps>,
  ReportBuilderState
> {
  constructor(props: RouteComponentProps<ReportBuilderProps>) {
    super(props);
    this.state = { reports: [], pages: 1 };
    this.getReports = this.getReports.bind(this);
  }

  componentWillMount() {
    this.getReports();
  }

  componentDidMount() {
    document.getElementById('sidebar').style.display = 'none';
  }

  FetchReports() {
    Promise.all([ReportService.getReports(this.props.match.params.workfileId)]).then(
      ([reports]) => {
        this.setState(() => ({
          reports: [{ report: JSON.parse(reports[0].report) }]
        }));
      }
    );
  }

  async getReports() {
    const reports = await ReportService.getReports(this.props.match.params.workfileId);
    this.setState({ reports: [{ report: JSON.parse(reports[0].report) }] });
  }

  render() {
    var report: any = '';
    if (this.state.reports.length && this.state.reports[0].report.pages) {
      report = this.state.reports[0].report;
      var pages = [];
      for (let i = 0; i < report.pages.length; i++) {
        pages.push(
          <div
            key={i}
            className={styles.page}
            id={'page' + i}
            dangerouslySetInnerHTML={{ __html: report.pages[i] }}
          />
        );
      }
    }

    return <div className={styles.ReportBuilder}>{pages}</div>;
  }
}
