import * as React from 'react';
import { Button } from '../../shared/components/Button';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { ProgressIndicator } from '../../shared/components/ProgressIndicator';
import { InnerWrapper } from '../../shared/layouts/InnerWrapper';
import BaseService from '../../services/baseService';
import SaleService from '../../services/sales';
import * as styles from './styles.css';
import * as classnames from 'classnames';

interface State {
  message: JSX.Element;
  isLoading: boolean;
  totalFiles: number;
  importedFiles: number;
}

export class SaleImportForm extends React.Component<null, State> {
  fileInput: any = null;
  dirInput: any = null;
  state = {
    message: null,
    isLoading: false,
    totalFiles: 0,
    importedFiles: 0
  };

  async handleSubmit(e: any) {
    let files = e.currentTarget.files;
    console.log('totalFiles', files.length);
    this.setState({ isLoading: true, totalFiles: files.length, importedFiles: 0, message: null });
    let importedFiles = 0;
    let someFiles = [];
    for (let i = 0; i < files.length; i++) {
      someFiles.push(files.item(i));
      if (someFiles.length == 10 || i == files.length - 1) await this.uploadFiles(someFiles);
    }
    this.setState({ isLoading: false });
  }

  async uploadFiles(files) {
    let { importedFiles } = this.state;
    let message: JSX.Element[] = [];
    await Promise.all(
      Array.from(files).map(async (file: File) => {
        let name = file.name;
        let type = file.type;
        let formData = new FormData();
        formData.append('file', file);
        let importResp: any = await SaleService.importSale(formData);
        if (importResp.status == 200) {
          let respJSON = await importResp.json();
          message.push(
            <div>
              <div className={classnames('fa fa-check', styles.SuccessIcon)} />
              {respJSON.message} - <a href={`/sales/${respJSON.sale_id}/update`}>Edit sale</a>
              <br />
            </div>
          );
        } else {
          message.push(
            <div>
              <div className={classnames('fa fa-times-circle', styles.ErrorIcon)} />Error: failed to
              import {name}
              <br />
            </div>
          );
        }
        await this.setState({ message: <div>{message}</div>, importedFiles: ++importedFiles });
      })
    );
  }

  render() {
    let { isLoading, totalFiles, importedFiles } = this.state;
    let dirAttr = { webkitdirectory: 'true', directory: 'true' };
    return (
      <InnerWrapper>
        <h1>Import Sales</h1>
        <input
          type="file"
          accept=".uaar-sale"
          style={{ display: 'none' }}
          ref={f => (this.dirInput = f)}
          name="dir"
          onChange={e => {
            e.preventDefault();
            this.handleSubmit(e);
          }}
          {...dirAttr}
          multiple
        />
        <input
          type="file"
          accept=".uaar-sale"
          style={{ display: 'none' }}
          ref={f => (this.fileInput = f)}
          name="file"
          onChange={e => {
            e.preventDefault();
            this.handleSubmit(e);
          }}
          multiple
        />
        <div className={styles.SaleImportButton}>
          <Button buttonType="default" onClick={e => this.dirInput.click()} disabled={isLoading}>
            Choose Directory
          </Button>
        </div>
        <div className={styles.SaleImportButton}>
          <Button buttonType="default" onClick={e => this.fileInput.click()} disabled={isLoading}>
            Choose Files
          </Button>
        </div>
        <div className={styles.ImportMessage}>
          <div className={styles.SaleImportLoadingIndicator}>
            {isLoading && <LoadingIndicator />}
          </div>
          {totalFiles > 0 && (
            <ProgressIndicator totalProgress={totalFiles} currentProgress={importedFiles} />
          )}
          {this.state.message}
        </div>
      </InnerWrapper>
    );
  }
}
