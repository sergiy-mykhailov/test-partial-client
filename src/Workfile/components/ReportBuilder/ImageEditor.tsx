
import * as React from 'react';
import * as styles from './styles.css';
import * as ImgEditor from 'react-avatar-editor';
import { EditorClose, EditorInsert } from '../../../types/Report';
import { Input } from '../../../shared/components/Input';
import { Label } from '../../../shared/components/Label';
import { Button } from '../../../shared/components/Button';
import * as proxyConfig from '../../../../proxy.config';

export interface ImageEditorProps {
  image: string;
  onImageInsert: EditorInsert;
  onCancel: EditorClose;
}

export interface ImageEditorState {
  editableImg: string;
  imgHeight: number;
  imgWidth: number;
  scale: number;
}

export class ImageEditor extends React.Component<ImageEditorProps, ImageEditorState> {
  editor = null;
  state: ImageEditorState = {
    editableImg: null,
    imgHeight: 400,
    imgWidth: 600,
    scale: 1,
  };

  constructor(props: ImageEditorProps) {
    super(props);
    this.props = props;
  }

  handleLoadSuccess = (imgInfo) => {
    this.setState({ imgHeight: imgInfo.height, imgWidth: imgInfo.width });
  };

  handleScale = (e) => {
    const scale = parseFloat(e.target.value);
    this.setState({ scale })
  };

  handleInsert = () => {
    const canvas = this.editor.getImage();
    const img = canvas.toDataURL();

    this.props.onImageInsert(img);
  };

  proxyImage = (src) => {
    return `http://${proxyConfig.host}:${proxyConfig.port}/${src}`;
  };

  renderCropper = () => {
    const { imgWidth, imgHeight, scale } = this.state;
    const image = this.proxyImage(this.props.image);

    return (
      <div>
        <ImgEditor
          ref={(editor) => this.editor = editor}
          image={image}
          onLoadSuccess={this.handleLoadSuccess}
          width={imgWidth}
          height={imgHeight}
          scale={scale}
          crossOrigin="anonymous"
        />
        <div className={styles.imgControlWrapper}>
          <Label>Crop:</Label>
          <Input
            name="scale"
            type="range"
            onChange={this.handleScale}
            min="1"
            max="4"
            step="0.01"
            defaultValue="1"
          />
        </div>
      </div>
    );
  };

  render() {

    return (
      <div>
        {this.renderCropper()}

        <div className={styles.editorControlsWrapper}>
          <Button onClick={this.props.onCancel}>Cancel</Button>
          <Button onClick={this.handleInsert}>Insert</Button>
        </div>

      </div>
    );
  }
}
