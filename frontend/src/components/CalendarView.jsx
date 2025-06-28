import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function CalendarView({ refreshFlag }) {
  const [events, setEvents] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/bookings`);
      const evs = res.data.map((b) => ({
        id: b.id,
        title: `${b.venue} ${b.title ?? ''}`,
        start: b.start,
        end: b.end,
      }));
      setEvents(evs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refreshFlag]);

  return (
    <div style={{ background: '#fff', padding: '1rem', marginTop: '1rem' }}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locales={[]}
        events={events}
        height="auto"
      />
    </div>
  );
}

export default CalendarView; 