// src/CameraRequired.tsx
const CameraRequired = () => {
  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: '#fff0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        padding: '2rem',
      }}
    >
      <div>
        <h1>📷 Camera Permission Needed</h1>
        <p>
          This site requires access to your camera to proceed.
          <br />
          Please refresh the page and allow camera access when asked.
        </p>
      </div>
    </div>
  );
};

export default CameraRequired;
