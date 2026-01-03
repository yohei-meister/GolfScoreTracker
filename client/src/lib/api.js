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

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        // If response is not JSON, create a meaningful error message
        const statusText = response.statusText || "Unknown error";
        errorData = {
          message: `API request failed: ${response.status} ${statusText}. Please make sure the API server is running.`
        };
      }
      throw new ApiError(
        errorData.message || "API request failed",
        response.status,
        errorData.errors
      );
    }

    return response.json();
  } catch (error) {
    // Handle network errors (e.g., API server not running)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Cannot connect to API server. Please make sure the API server is running (npm run dev:api or npm run dev:full).",
        0,
        null
      );
    }
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle other errors
    throw new ApiError(
      error.message || "An unexpected error occurred",
      0,
      null
    );
  }
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
      body: JSON.stringify(gameData)
    });
  },

  async updateGame(id, gameData) {
    return fetchApi(`/api/game/${id}`, {
      method: "PUT",
      body: JSON.stringify(gameData)
    });
  },

  async updateScores(id, holeNumber, scores) {
    return fetchApi(`/api/game/${id}/scores`, {
      method: "PATCH",
      body: JSON.stringify({ holeNumber, scores })
    });
  },

  async completeGame(id) {
    return fetchApi(`/api/game/${id}/complete`, {
      method: "PATCH"
    });
  }
};
