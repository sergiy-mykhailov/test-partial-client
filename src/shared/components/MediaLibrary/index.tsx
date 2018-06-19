import * as React from 'react';
import * as styles from './styles.css';
import { CloseFunction } from '../../../types/Report';
import { File as IFile } from '../../../types';
import TractService from '../../../services/tracts';
import SaleService from '../../../services/sales';
import WorkfileService from '../../../services/workfiles';
import { Button } from '../../../shared/components/Button';
import { ImageList } from '../FileList';
import { ComponentTab } from '../ComponentTab';

export interface ImageLibraryProps {
  closeModal: CloseFunction;
  workfileId: string;
}

export interface ImageLibraryState {
  tracts: IFile[][];
  sales: IFile[][];
  selectedFile: IFile;
  selectedTract: number;
}

export class ImageLibrary extends React.Component<ImageLibraryProps, ImageLibraryState> {
  state: ImageLibraryState = {
    tracts: [[]],
    sales: [[]],
    selectedFile: null,
    selectedTract: null
  };
  constructor(props: ImageLibraryProps) {
    super(undefined);
    this.props = props;
    this.insertImage = this.insertImage.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.getTracts();
    this.getSales();
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return (
      nextState.tracts !== this.state.tracts ||
      nextState.sales !== this.state.sales ||
      nextState.selectedFile !== this.state.selectedFile
    );
  }

  async getTractImages(workfileId: string, tractId: number) {
    var tractFiles = await TractService.getFiles(workfileId, tractId);
    var prevTracts = [];
    for (let i = 0; i < this.state.tracts.length; i++) {
      prevTracts[i] = this.state.tracts[i];
    }
    prevTracts[tractId] = tractFiles;
    this.setState({ tracts: prevTracts });
  }

  async getSaleImages(workfileId: string, saleId: number) {
    var saleFiles = await SaleService.getFiles(saleId);
    var prevSales = [];
    for (let i = 0; i < this.state.sales.length; i++) {
      prevSales[i] = this.state.sales[i];
    }
    prevSales[saleId] = saleFiles;
    this.setState({ sales: prevSales });
  }

  async getTracts() {
    var tracts = await TractService.getTracts(this.props.workfileId);
    for (let i = 0; i < tracts.length; i++) {
      this.getTractImages(this.props.workfileId, tracts[i].id);
    }
  }

  async getSales() {
    var sales = await WorkfileService.getWorkfileSales(this.props.workfileId);
    for (let i = 0; i < sales.length; i++) {
      this.getSaleImages(this.props.workfileId, sales[i]);
    }
  }

  selectHandler(file: IFile) {
    this.setState({ selectedFile: file });
  }

  insertImage() {
    if (this.state.selectedFile !== null) {
      document.execCommand(
        'insertHTML',
        false,
        "<figure width='100%'><img src='" + this.state.selectedFile.file_url + "'/></figure>"
      );
      this.setState({ selectedFile: null });
      this.props.closeModal();
    }
  }

  render() {
    var components = [];
    for (var i = 0; i < this.state.tracts.length; i++) {
      if (this.state.tracts[i]) {
        if (this.state.tracts[i].length) {
          components.push({
            label: 'tract ' + (i + 1),
            component: (
              <ImageList
                files={this.state.tracts[i]}
                onSelect={this.selectHandler}
                useButtons={true}
              />
            )
          });
        }
      }
    }
    for (var i = 0; i < this.state.sales.length; i++) {
      if (this.state.sales[i]) {
        if (this.state.sales[i].length) {
          components.push({
            label: 'sale ' + (i + 1),
            component: (
              <ImageList
                files={this.state.sales[i]}
                onSelect={this.selectHandler}
                useButtons={true}
              />
            )
          });
        }
      }
    }
    return (
      <div>
        <div className={styles.mediaLibrary}>
          <ComponentTab components={components} />
        </div>
        <Button onClick={this.insertImage}>Insert Media</Button>
      </div>
    );
  }
}
