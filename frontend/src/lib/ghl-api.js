const GHL_API_KEY = import.meta.env.VITE_GHL_API_KEY;
const GHL_LOCATION_ID = import.meta.env.VITE_GHL_LOCATION_ID;

export const ghlAPI = {
  async getAvailableSlots(calendarId, startDate, endDate) {
    const response = await fetch(
      `https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Version': '2021-07-28'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch slots');
    }
    
    return await response.json();
  },

  async createAppointment(calendarId, data) {
    const response = await fetch(
      'https://services.leadconnectorhq.com/calendars/events/appointments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          calendarId,
          locationId: GHL_LOCATION_ID,
          ...data
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }
    
    return await response.json();
  }
};
