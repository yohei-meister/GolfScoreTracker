const API_BASE = "";

class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new ApiError(
      errorData.message || "API request failed",
      response.status,
      errorData.errors
    );
  }

  return response.json();
}

export const api = {
  async getCurrentGame() {
    try {
      return await fetchApi("/api/game");
    } catch (error) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async createGame(gameData) {
    return fetchApi("/api/game", {
      method: "POST",
      body: JSON.stringify(gameData),
    });
  },

  async updateGame(id, gameData) {
    return fetchApi(`/api/game/${id}`, {
      method: "PUT",
      body: JSON.stringify(gameData),
    });
  },

  async updateScores(id, holeNumber, scores) {
    return fetchApi(`/api/game/${id}/scores`, {
      method: "PATCH",
      body: JSON.stringify({ holeNumber, scores }),
    });
  },

  async completeGame(id) {
    return fetchApi(`/api/game/${id}/complete`, {
      method: "PATCH",
    });
  },
};
