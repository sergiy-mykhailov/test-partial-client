import * as React from 'react';
import { Input } from '../Input';
import { Label } from '../Label';
import { Button } from '../Button';
import { RouteComponentProps, Redirect } from 'react-router-dom';
import UploadService from '../../../services/upload';
import { File as IFile, FileInfo as IFileInfo } from '../../../types';

export interface UploadProps {
  onUpload: (url: string) => any;
}

export class FileUpload extends React.Component<UploadProps> {
  fileInput: any = null;

  async handleSubmit(e: any) {
    console.log('handleSubmit', e.currentTarget.files[0]);
    let file = e.currentTarget.files[0];
    let name = file.name;
    let type = file.type;

    let fileInfo: IFileInfo = await UploadService.uploadFile(name, type);
    let s3Response = await fetch(fileInfo.signedRequest, { body: file, method: 'PUT' });
    if (s3Response.status == 200) console.log('success');

    this.props.onUpload(fileInfo.url);
  }

  render() {
    return (
      <div>
        <input
          type="file"
          accept=".jpg, .jpeg, .png, .pdf"
          style={{ display: 'none' }}
          ref={f => {
            this.fileInput = f;
          }}
          onChange={e => {
            e.preventDefault();
            this.handleSubmit(e);
          }}
        />
        <Button
          buttonType="default"
          onClick={e => {
            this.fileInput.click();
          }}
        >
          Choose File
        </Button>
      </div>
    );
  }
}
