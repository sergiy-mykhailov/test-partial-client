import * as React from 'react';
import * as styles from './styles.css';
import { File as IFile } from '../../../types';

export interface ImageListProps {
  files: Array<IFile>;
  onSelect?: any;
  useButtons?: boolean;
}
export interface ImageListState {
  selectedFile: number;
}

export class ImageList extends React.Component<ImageListProps, ImageListState> {
  state: ImageListState = {
    selectedFile: null
  };

  constructor(props: ImageListProps) {
    super(props);
    this.selectFile = this.selectFile.bind(this);
  }

  selectFile(evt: any) {
    var file = parseInt(evt.target.dataset.file);
    this.setState({ selectedFile: file });
    if (this.props.onSelect !== undefined) {
      this.props.onSelect(this.props.files[evt.target.dataset.file]);
    }
  }

  render() {
    var images = [];
    if (this.props.files) {
      for (let b = 0; b < this.props.files.length; b++) {
        var selected = this.state.selectedFile === b ? styles.selected : '';
        switch (this.props.files[b].group) {
          case 'image':
            let img = (
              <img
                key={'file' + b}
                src={this.props.files[b].file_url}
                alt={this.props.files[b].description}
                className={styles.image}
              />
            );
            if (this.props.useButtons)
              images.push(
                <button
                  key={'button' + b}
                  onClick={this.selectFile}
                  data-file={b}
                  className={selected}
                >
                  {img}
                </button>
              );
            else images.push(<div className={styles.imageContainer}>{img}</div>);
            break;
          case 'document':
            images.push(
              <button
                key={'button' + b}
                onClick={this.selectFile}
                data-file={b}
                className={selected}
              >
                <object key={'file' + b} data={this.props.files[b].file_url} />
              </button>
            );
            break;
        }
      }
    }
    return (
      <div>
        <div className={styles.imageList}>{images}</div>
      </div>
    );
  }
}
