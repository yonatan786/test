import React, { useState, useEffect } from 'react';

const HebrewCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Fetching events...');
      
      const response = await fetch(`${API_BASE_URL}/events`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received events:', data);
      setEvents(data);
      setError(null);
      
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(`שגיאה בטעינת אירועים: ${err.message}`);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async () => {
    const title = prompt('הכנס כותרת לאירוע:');
    if (title) {
      const startTime = prompt('הכנס שעת התחלה (HH:MM):', '09:00');
      const endTime = prompt('הכנס שעת סיום (HH:MM):', '10:00');
      
      if (startTime && endTime) {
        const newEvent = {
          title,
          start: `${selectedDate.toISOString().split('T')[0]}T${startTime}:00`,
          end: `${selectedDate.toISOString().split('T')[0]}T${endTime}:00`
        };

        try {
          console.log('Adding new event:', newEvent);
          const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(newEvent),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const addedEvent = await response.json();
          console.log('Event added successfully:', addedEvent);
          setEvents(prevEvents => [...prevEvents, addedEvent]);
          setError(null);
        } catch (err) {
          console.error('Error adding event:', err);
          setError('שגיאה בהוספת אירוע');
        }
      }
    }
  };

  const deleteEvent = async (eventId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק אירוע זה?')) {
      try {
        console.log('Deleting event:', eventId);
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
        setError(null);
        console.log('Event deleted successfully');
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('שגיאה במחיקת אירוע');
      }
    }
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatTime = (date) => {
    try {
      return new Date(date).toLocaleTimeString('he-IL', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (err) {
      console.error('Error formatting time:', err);
      return '00:00';
    }
  };

  const getWeekDates = (date) => {
    const week = [];
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  if (loading) {
    return <div className="text-center p-4">טוען...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 rtl" dir="rtl">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          {error}
          <button 
            className="absolute top-0 right-0 p-2"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 7);
              setSelectedDate(newDate);
            }}
          >
            שבוע הבא
          </button>
          <h2 className="text-xl font-bold">
            {selectedDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </h2>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 7);
              setSelectedDate(newDate);
            }}
          >
            שבוע קודם
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 p-4 text-center border-b">
          {hebrewDays.map((day, index) => (
            <div key={index} className="font-semibold">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 p-4">
          {getWeekDates(selectedDate).map((date, index) => (
            <div 
              key={index} 
              className="min-h-32 border rounded p-2 hover:bg-gray-50"
              onClick={() => setSelectedDate(date)}
            >
              <div className="text-right mb-2">
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {getEventsForDate(date).map((event) => (
                  <div 
                    key={event.id}
                    className="bg-blue-100 p-1 rounded text-sm group relative"
                  >
                    <div className="font-semibold">{event.title}</div>
                    <div className="text-xs">
                      {formatTime(event.start)} - {formatTime(event.end)}
                    </div>
                    <button
                      className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <button 
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={addEvent}
          >
            הוסף אירוע
          </button>
        </div>
      </div>
    </div>
  );
};

export default HebrewCalendar;
