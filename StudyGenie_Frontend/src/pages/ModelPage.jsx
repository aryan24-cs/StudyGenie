import React, { useState, useEffect } from 'react';
import '../style/ModelPage.style.css';
import useUploadPDF from '../Hooks/useUploadPDF';
import useAskQuestion from '../Hooks/useAskQuestion';
import { useFetchId } from '../Hooks/useFetchId';
import useUserPDFs from '../Hooks/useUserPDFs';
import axios from 'axios';
import ReactMarkdown from "react-markdown";

function ModelPage() {
  const [message, setMessage] = useState([]);
  const [file, setFile] = useState(null);
  const [input, setInput] = useState("");
  const userId = useFetchId();
  const { uploadPDF } = useUploadPDF(userId);
  const { AskQuestion, answer } = useAskQuestion(userId);
  const { files, fetchUserFiles } = useUserPDFs(userId);

  const HandleShoot = async () => {
    if (input && userId) {
      setMessage(prev => [...prev, input]);
      await AskQuestion(input);
      setInput("");
    }
    if (file && userId) {
      setMessage(prev => [...prev, `📄 File uploaded: ${file.name}`]);
      await uploadPDF(file);
      setFile(null);
    }
  };

  useEffect(() => {
    if (answer) setMessage(prev => [...prev, `🤖: ${answer}`]);
  }, [answer]);

  const loadVectorStoreForFile = async (fileName) => {
    try {
      await axios.post("http://localhost:5000/loaddocs", { user_id: userId, file_name: fileName });
      setMessage(prev => [...prev, ` Loading: ${fileName}`]);
    } catch (err) {
      setMessage(prev => [...prev, " Failed to load vector store."]);
    }
  };

  return (
    <div className='model-page-main'>
      <div className='model-page-inner'>
        <div className='message-displa-answer'>
          {message.map((msg, i) => <div key={i} className='messgage-section'><ReactMarkdown>{msg}</ReactMarkdown></div>)}
        </div>

        <div className='pdf-history-section'>
          <button onClick={fetchUserFiles} className='history-button'>📚 Show History</button>
          <ul className='file-list'>
            {files.map((fileName, i) => <li key={i} onClick={() => loadVectorStoreForFile(fileName)} className='file-item'>📄 {fileName}</li>)}
          </ul>
        </div>

        <div className='input-message'>
          <div className='input-message-holder'>
            <input type='file' onChange={(e) => setFile(e.target.files[0])} />
            <input className='input-questions' placeholder='Ask or Upload...' value={input} onChange={(e) => setInput(e.target.value)} />
            <button className='submit-button' onClick={HandleShoot}>Shoot</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelPage;
