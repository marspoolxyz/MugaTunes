import React, { useRef, useState } from "react";
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';


import {
  FileUploadContainer,
  FormField,
  DragDropText,
  UploadFileBtn,
  FilePreviewContainer,
  ImagePreview,
  PreviewContainer,
  PreviewList,
  FileMetaData,
  RemoveFileIcon,
  InputLabel
} from "./file-upload.styles";


const KILO_BYTES_PER_BYTE = 1000;
const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 500000;
let percentage = 0;


const convertNestedObjectToArray = (nestedObj) =>
  Object.keys(nestedObj).map((key) => nestedObj[key]);

const convertBytesToKB = (bytes) => Math.round(bytes / KILO_BYTES_PER_BYTE);

const FileUpload = ({
  label,
  updateFilesCb,
  maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  ...otherProps
}) => {
  const fileInputField = useRef(null);
  const [files, setFiles] = useState({});

  const [percent, setPercent] = useState({});


  const handleUploadBtnClick = () => {
    setPercent(0);
    fileInputField.current.click();
  };

  async function addNewFiles(newFiles) {
    for (let file of newFiles) {
      console.log("This is a test from waheed" + file.size );
      const videoBuffer = (await file?.arrayBuffer()) || new ArrayBuffer(0);
      let encodeArrayBuffer = Array.from(new Uint8Array(videoBuffer));
      const MAX_CHUNK_SIZE = 1024 * 500; // 500kb
      let chunk = 1;

      console.log(file.size + " Max " + MAX_CHUNK_SIZE);
      const chunkCount = Number(Math.ceil(file.size / MAX_CHUNK_SIZE));

      console.log("chunkCount = " + chunkCount);
      let chunkBuffers = (await file?.arrayBuffer()) || new ArrayBuffer(0);
      chunkBuffers = new ArrayBuffer(0);

      for (
        let byteStart = 0;
        byteStart < file.size;
        byteStart += MAX_CHUNK_SIZE, chunk++
      ) {
        
        percentage = Math.round((chunk/chunkCount)*100,0);

        setPercent(percentage);

        console.log(percentage);
        const videoSlice = videoBuffer.slice(
          byteStart,
          Math.min(file.size, byteStart + MAX_CHUNK_SIZE)
        );        
        encodeArrayBuffer = Array.from(new Uint8Array(videoSlice));

        const bytesAsBuffer = Buffer.from(new Uint8Array(videoSlice));
        //chunkBuffers.push(bytesAsBuffer);
        console.log(" Byte Start " + byteStart );
        console.log(encodeArrayBuffer);
        console.log(videoSlice);

 
        
      }      


      if (file.size <= maxFileSizeInBytes) {
        if (!otherProps.multiple) {
          return { file };
        }
        files[file.name] = file;
      }
    }
    return { ...files };
  };

  const callUpdateFilesCb = (files) => {
    const filesAsArray = convertNestedObjectToArray(files);
    updateFilesCb(filesAsArray);
  };

  const handleNewFileUpload = (e) => {
    const { files: newFiles } = e.target;
    if (newFiles.length) {
      let updatedFiles = addNewFiles(newFiles);
      setFiles(updatedFiles);
      callUpdateFilesCb(updatedFiles);
    }
  };

  const removeFile = (fileName) => {
    delete files[fileName];
    setFiles({ ...files });
    callUpdateFilesCb({ ...files });
  };

  return (
    <>
      <div width="50%"><ProgressBar now={percent} animated label={`${percentage}% completed`} /></div>
      

      <FileUploadContainer>
        <InputLabel>{label}</InputLabel>
        <DragDropText>Drag and drop your files anywhere or</DragDropText>
        <UploadFileBtn type="button" onClick={handleUploadBtnClick}>
          <i className="fas fa-file-upload" />
          <span> Upload {otherProps.multiple ? "files" : "a file"}</span>
        </UploadFileBtn>
        <FormField
          type="file"
          ref={fileInputField}
          onChange={handleNewFileUpload}
          title=""
          value=""
          {...otherProps}
        />
       </FileUploadContainer>
      <FilePreviewContainer>

        <PreviewList>
          {Object.keys(files).map((fileName, index) => {
            let file = files[fileName];
            let isImageFile = file.type.split("/")[0] === "image";
            return (
              <PreviewContainer key={fileName}>
                <div>
                  {isImageFile && (
                    <ImagePreview
                      src={URL.createObjectURL(file)}
                      alt={`file preview ${index}`}
                    />
                  )}
                  <FileMetaData isImageFile={isImageFile}>
                    <span>{file.name}</span>
                    <aside>
                      <span>{convertBytesToKB(file.size)} kb</span>
                      <RemoveFileIcon
                        className="fas fa-trash-alt"
                        onClick={() => removeFile(fileName)}
                      />
                    </aside>
                  </FileMetaData>
                </div>
              </PreviewContainer>
            );
          })}
        </PreviewList>
      </FilePreviewContainer>
    </>
  );
};

export default FileUpload;
