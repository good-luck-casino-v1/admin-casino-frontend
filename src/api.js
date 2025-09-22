const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api`

export const agentService = {
  // Get all agents
  getAgents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/getdetail`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      return await response.json();
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error;
    }
  },

  // Add new agent
  addAgent: async (agentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add agent');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  }
};