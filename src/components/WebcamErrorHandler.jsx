import React from "react";

const WebcamErrorHandler = ({ error }) => {
  if (!error) return null;

  return (
    <div style={popupStyle}>
      <div style={messageBoxStyle}>
        <p>
          웹캠 접근에 실패했습니다. <br /> 다른 앱에서 사용 중이 아닌지
          확인해주세요.
        </p>
        <button style={buttonStyle} onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>
    </div>
  );
};

const popupStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const messageBoxStyle = {
  padding: "2rem",
  borderRadius: "10px",
  textAlign: "center",
};

const buttonStyle = {
  marginTop: "1rem",
  padding: "0.5rem 1rem",
  borderRadius: "5px",
  backgroundColor: "rgb(211, 0, 0)",
  color: "rgb(226, 226, 226)",
  border: "none",
  cursor: "pointer",
};

export default WebcamErrorHandler;
