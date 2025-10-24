const WPP_API_URL = import.meta.env.VITE_WPP_API_URL;

export const wppAPI = {
  async sendMessage(sessionName, phone, message) {
    const response = await fetch(`${WPP_API_URL}/api/${sessionName}/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
        isGroup: false
      })
    });
    
    return await response.json();
  },

  async getSessionStatus(sessionName) {
    const response = await fetch(`${WPP_API_URL}/api/${sessionName}/check-connection-session`);
    return await response.json();
  }
};
