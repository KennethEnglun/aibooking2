import React, { useState } from 'react';
import Chat from './components/Chat.jsx';
import CalendarView from './components/CalendarView.jsx';

function App() {
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleBookingCreated = () => {
    setRefreshFlag((f) => f + 1);
  };

  return (
    <div className="app-container">
      <h1>AI 場地預訂系統</h1>
      <Chat onBookingCreated={handleBookingCreated} />
      <CalendarView refreshFlag={refreshFlag} />
    </div>
  );
}

export default App; 