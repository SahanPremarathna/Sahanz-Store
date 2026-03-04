function formatApiResponse(data, message = "OK") {
  return {
    message,
    data
  };
}

module.exports = {
  formatApiResponse
};
