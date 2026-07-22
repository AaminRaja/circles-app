// Centralizes the error-type checks every route ends up needing.
// Call this from inside any catch block — it inspects the error and
// sends the appropriate response, or returns false if it didn't recognize
// the error (so the caller can fall back to its own generic 500).
function handleRouteError(error, res, fallbackMessage) {
  if (error.name === "CastError") {
    res.status(400).json({ message: "Invalid ID format" });
    return true;
  }

  if (error.name === "ValidationError") {
    res
      .status(400)
      .json({ message: "Invalid data provided", error: error.message });
    return true;
  }

  if (error.code === 11000) {
    res
      .status(409)
      .json({ message: "A record with this value already exists" });
    return true;
  }

  res.status(500).json({ message: fallbackMessage, error: error.message });
  return true;
}

module.exports = handleRouteError;
