import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import filesize from 'filesize';

import Header from '../../components/Header';
import FileList from '../../components/FileList';
import Upload from '../../components/Upload';

import { Container, Title, ImportFileContainer, Footer } from './styles';

import alert from '../../assets/alert.svg';
import api from '../../services/api';

interface FileProps {
  file: File;
  name: string;
  readableSize: string;
  inputError: boolean;
}

const Import: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<FileProps[]>([]);
  const history = useHistory();

  async function handleUpload(): Promise<void> {
    // Function to import one file
    const promise = async (file: FileProps) => {
      const data = new FormData();
      data.append('file', file.file);
      try {
        await api.post('/transactions/import', data);
        return true; // success
      } catch (err) {
        return false; // error
      }
    };

    // Run function for all files and return 'success' or 'error'
    const status = await Promise.all(
      uploadedFiles.map((file) => promise(file)),
    );

    // If all uploads were successful, go to list page, otherwise show errors.
    if (status.every((s) => s)) {
      history.push('/');
    } else {
      setUploadedFiles(
        uploadedFiles.map((u, i) => ({ ...u, inputError: !status[i] })),
      );
    }
  }

  function submitFile(files: File[]): void {
    const newFiles = files.map((file) => ({
      file,
      name: file.name,
      readableSize: filesize(file.size),
      inputError: false,
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  }

  return (
    <>
      <Header size="small" />
      <Container>
        <Title>Importar uma transação</Title>
        <ImportFileContainer>
          <Upload onUpload={submitFile} />
          {!!uploadedFiles.length && <FileList files={uploadedFiles} />}

          <Footer>
            <p>
              <img src={alert} alt="Alert" />
              Permitido apenas arquivos CSV
            </p>
            <button onClick={handleUpload} type="button">
              Enviar
            </button>
          </Footer>
        </ImportFileContainer>
      </Container>
    </>
  );
};

export default Import;
