// client/src/App.tsx
import { useEffect, useState } from 'react';

interface HealthResponse {
  status: string;
  timestamp: string;
}

function App() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5001/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data: HealthResponse) => setData(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Secure Voting App Skeleton</h1>
      <hr />
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {data ? (
        <div>
          <p style={{ color: 'green', fontWeight: 'bold' }}>{data.status}</p>
          <small>Server Time: {new Date(data.timestamp).toLocaleTimeString()}</small>
        </div>
      ) : (
        !error ? <p>Connecting to backend...</p> : null
      )}
    </div>
  );
}

export default App;