import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [printerSerial, setPrinterSerial] = useState('');
  const [isValidSerial, setIsValidSerial] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [repositoryMessage, setRepositoryMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentVersion, setCurrentVersion] = useState([]);
  const [releaseNoteModalContent, setReleaseNoteModalContent] = useState('');
  const [showReleaseNoteModal, setShowReleaseNoteModal] = useState(false);
  const [showUpdateConfirmation, setShowUpdateConfirmation] = useState(false);

  const handleSerialInputChange = (event) => {
    const inputValue = event.target.value.trim().toUpperCase();
    setPrinterSerial(inputValue);
    const serialPattern = /^(00[MW]|03W|01[SPT]|030|039)[a-zA-Z0-9]{12}$/;
    setIsValidSerial(serialPattern.test(inputValue));
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BAMBULAB}/login`,
        { username, password }, { withCredentials: true });
      setLoginMessage(response.data.message);

      if (response.data.success && response.data.data) {
        await handleDeviceVersion(response.data.data);
      }
    } catch (error) {
      setLoginMessage(error.message);
    }
  };

  const handleDeviceVersion = async (accessToken) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BAMBULAB}/device-version`,
        { printerSerial, accessToken }, { withCredentials: true });

      if (response.data.success && response.data.data) {
        const { dev_id, version, ...result } = response.data.data;
        setCurrentVersion(result);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error fetching device version:', error);
    }
  };

  const handleRepoUpdate = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_GITHUB}/devurl-update`,
        { printerSerial, currentVersion }, { withCredentials: true });

      setRepositoryMessage(response.data.message);
    } catch (error) {
      console.error('Error updating device URL:', error);
    }
  };

  const handleRepoUpdateClick = () => {
    setShowUpdateConfirmation(true);
  };

  const handleUpdateConfirmation = async () => {
    await handleRepoUpdate();
    setShowUpdateConfirmation(false);
  };

  const handleUpdateCancellation = () => {
    setShowUpdateConfirmation(false);
  };

  const handleReleaseNoteClick = () => {
    setShowReleaseNoteModal(true);
    const releaseNoteContent = currentVersion.firmware[0].description.replace(/\\n/g, '\n');
    setReleaseNoteModalContent(releaseNoteContent);
  };

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <>
          <h1 className="main-title">Printer Firmware Provisioning</h1>
          <div className="input-container">
            <input
              type="text"
              value={printerSerial}
              onChange={handleSerialInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Printer Serial Number"
              className={`input-field ${isInputFocused && !isValidSerial ? 'invalid' : ''}`}
            />
            {isInputFocused && !isValidSerial && (
              <p className="msg invalid">Invalid serial number.</p>
            )}
          </div>
          <h2 className="sub-title">Bambu Lab Account</h2>

          <div className="input-container">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Email or Phone Number"
              className="input-field"
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input-field"
            />
          </div>
          <button onClick={handleLogin} className="login-button">Login</button>
          {loginMessage && <p className="login-msg">{loginMessage}</p>}
        </>
      ) : (
        <div className="info-container">
          <h2>Release Note & Repo Update</h2>
          <div className="release-note-container">
            <p className="description">
              {printerSerial}:
              <button
                className="release-note-button"
                onClick={handleReleaseNoteClick}
              >
                Release Note
              </button>
            </p>
            <p className="ams">
              AMS: <span className="ams-value">{JSON.stringify(currentVersion.ams[0]) || 'N/A'}</span>
            </p>
          </div>
          <button onClick={handleRepoUpdateClick} className="repo-update-button">Repo Update</button>
          {repositoryMessage && <p className="repo-msg">{repositoryMessage}</p>}
        </div>
      )}
      {showReleaseNoteModal && (
        <div className="modal-background" onClick={() => setShowReleaseNoteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <span className="close" onClick={() => setShowReleaseNoteModal(false)}>&times;</span>
            <p className="release-note">{releaseNoteModalContent}</p>
          </div>
        </div>
      )}
      {showUpdateConfirmation && (
        <div className="modal-background" onClick={handleUpdateCancellation}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>Do you want to proceed with the repository update?</p>
            <button onClick={handleUpdateConfirmation} className="confirmation-button">Yes</button>
            <button onClick={handleUpdateCancellation} className="confirmation-button">No</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
