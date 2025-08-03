// Test backend connectivity
export const testBackendConnection = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/test/test", {
      method: "GET",
      credentials: "include",
    });

    const data = await response.json();
    console.log("Backend test response:", data);
    return data;
  } catch (error) {
    console.error("Backend test failed:", error);
    return { success: false, error: error.message };
  }
};

// Test upload endpoint accessibility
export const testUploadEndpoint = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/test/test-upload", {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    console.log("Upload endpoint test response:", data);
    return data;
  } catch (error) {
    console.error("Upload endpoint test failed:", error);
    return { success: false, error: error.message };
  }
};
