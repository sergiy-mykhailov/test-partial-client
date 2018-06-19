import * as React from 'react';
import * as styles from './styles.css';
import * as classnames from 'classnames';
import { Input } from '../shared/components/Input';
import { Label } from '../shared/components/Label';
import { Button } from '../shared/components/Button';
import { ImageList } from '../shared/components/FileList';
import { Modal } from '../shared/components/Modal';
import { FileUpload } from '../shared/components/FileUpload';
import DataSheet from '../shared/components/DataSheet';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import SaleService from '../services/sales';
import {
  Sale as ISale,
  NewSale as INewSale,
  File as IFile,
  Improvement as IImprovement,
  CommonAttributes as ICommonAttributes
} from '../types';
import { labels } from '../shared/components/labels';
import { Improvements } from '../shared/components/Improvements';

export interface SaleFormProps {
  sale: ISale | INewSale;
  onUpdate: (key: keyof ISale, value: string) => void;
  isSaving: boolean;
  onSave: () => Promise<void>;
  buttonText: string;
  onDelete?: () => void;
}

export interface SaleFormSate {
  showFileModal: boolean;
  showMapModal: boolean;
  showAnalysisModal: boolean;
  files: IFile[];
  commonAttributes: ICommonAttributes;
}

export class SaleForm extends React.Component<SaleFormProps, SaleFormSate> {
  state = {
    showFileModal: false,
    showMapModal: false,
    showAnalysisModal: false,
    files: [],
    commonAttributes: {
      highest_best_use: [],
      land_use_type: [],
      property_type: [],
      category_type: [],
      commodity_type: [],
      source: []
    }
  };

  async componentDidMount() {
    this.fetchSalesAttributes();
  }

  updateSale(key: keyof ISale, value: string): void {
    this.props.onUpdate(key, value);
  }

  async handleSubmit(): Promise<void> {
    await this.props.onSave();
  }

  isButtonActive() {
    const { sale, isSaving } = this.props;

    return Boolean(sale.description) && Boolean(sale.parcel_id) && !isSaving;
  }

  async fetchSalesAttributes() {
    let attributes = await SaleService.getCommonAttributes();
    this.setState({ commonAttributes: attributes });
  }

  async fetchFiles() {
    let sale = this.props.sale as ISale;
    if (sale.id) {
      let files = await SaleService.getFiles(sale.id);
      this.setState({ files: files });
    }
  }

  async onFileUpload(fileUrl: string) {
    let sale = this.props.sale as ISale;
    if (sale.id) {
      let newFile = await SaleService.createFile(sale.id, {
        file_url: fileUrl,
        group: 'image'
      });
      let files = this.state.files;
      files.push(newFile);
      this.setState({ files: files });
    }
  }

  openFilesModal() {
    this.setState({ showFileModal: true });
    this.fetchFiles();
  }

  closeModal(modal: string) {
    if (modal == 'file') this.setState({ showFileModal: false });
    else if (modal == 'map') this.setState({ showMapModal: false });
    else if (modal == 'analysis') this.setState({ showAnalysisModal: false });
  }

  openMapModal() {
    this.setState({ showMapModal: true });
  }

  openAnalysisModal() {
    this.setState({ showAnalysisModal: true });
  }

  render() {
    const { sale, isSaving, buttonText } = this.props;
    const { commonAttributes } = this.state;

    let appSheets = [];
    let userSheets = [];

    appSheets['Soil'] = [[{ value: 'Hello World', error: null, formula: null }]];
    userSheets['sheet2'] = [[{ value: 'Hello World', error: null, formula: null }]];

    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          this.handleSubmit();
        }}
      >
        <div className={styles.SaleForm}>
          <div className={styles.SaleFormSection}>
            {labels.map((attr: any) => {
              let saleobj: any = sale;
              if (commonAttributes[attr.key] && commonAttributes[attr.key].length) {
                let attributes = commonAttributes[attr.key];
                let options = attributes
                  .map((attr: string, i: number) => {
                    return (
                      <option key={attr + i} value={attr}>
                        {attr}
                      </option>
                    );
                  })
                  .concat(<option key={-1} value="" />);
                return (
                  <div className={styles.SaleFormInputContainer} key={attr.key}>
                    <Label htmlFor={attr.key}>{attr.label}</Label>
                    <select
                      onChange={e => this.updateSale(attr.key, e.target.value)}
                      value={saleobj[attr.key] || ''}
                    >
                      {options}
                    </select>
                    <Input
                      placeholder={attr.key}
                      id={attr.key}
                      name={attr.key}
                      value={saleobj[attr.key]}
                      onChange={e => this.updateSale(attr.key, e.target.value)}
                    />
                  </div>
                );
              } else {
                let input: JSX.Element;
                if (attr.key == 'improvements' && saleobj[attr.key] != null)
                  input = (
                    <Improvements
                      fetchImprovements={SaleService.getSaleImprovements.bind(
                        SaleService,
                        saleobj['id']
                      )}
                      createImprovement={SaleService.createSaleImprovement.bind(
                        SaleService,
                        saleobj['id']
                      )}
                      updateImprovement={SaleService.updateSaleImprovement.bind(
                        SaleService,
                        saleobj['id']
                      )}
                      deleteImprovement={SaleService.deleteSaleImprovement.bind(
                        SaleService,
                        saleobj['id']
                      )}
                    />
                  );
                else
                  input = (
                    <Input
                      placeholder={attr.label}
                      id={attr.key}
                      name={attr.key}
                      value={saleobj[attr.key] || ''}
                      onChange={e => this.updateSale(attr.key, e.target.value)}
                    />
                  );
                return (
                  <div className={styles.SaleFormInputContainer} key={attr.key}>
                    <Label htmlFor={attr.key}>{attr.label}</Label>
                    {input}
                  </div>
                );
              }
            })}
          </div>

          <Button
            onClick={this.openFilesModal.bind(this)}
            disabled={(sale as ISale).id == undefined}
          >
            <div className={classnames(styles.paperclip, 'fa fa-paperclip')} /> Files
          </Button>
          <Button onClick={this.openMapModal.bind(this)} disabled={(sale as ISale).id == undefined}>
            Map
          </Button>
          <Button
            onClick={this.openAnalysisModal.bind(this)}
            disabled={(sale as ISale).id == undefined}
          >
            Data Sheets
          </Button>

          <Modal
            show={this.state.showFileModal}
            showOk={true}
            okText="Close"
            onOk={this.closeModal.bind(this, 'file')}
          >
            <ImageList files={this.state.files} />
            <FileUpload onUpload={this.onFileUpload.bind(this)} />
          </Modal>
          <Modal
            show={this.state.showMapModal}
            showOk={true}
            okText="Close"
            onOk={this.closeModal.bind(this, 'map')}
            className={styles.MapModal}
          >
          </Modal>

          <Modal
            show={this.state.showAnalysisModal}
            showOk={true}
            okText="Close"
            onOk={this.closeModal.bind(this, 'analysis')}
            className={styles.MapModal}
          >
            <div className={styles.AnalysisContainer}>
              <DataSheet appSheets={appSheets} userSheets={userSheets} onUpdate={() => {}} />
            </div>
          </Modal>

          <div className={styles.SaleFormSubmitSection}>
            <div>{isSaving && <span className={styles.SaleFormSubmitStatus}>Saving ...</span>}</div>

            <div>
              {this.props.onDelete && (
                <Button type="secondary" onClick={this.props.onDelete}>
                  Delete Sale
                </Button>
              )}
              <Button buttonType="submit" disabled={!this.isButtonActive()}>
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      </form>
    );
  }
}
