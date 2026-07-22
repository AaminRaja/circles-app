// Parses and clamps page/limit query params into safe values,
// and calculates the corresponding `skip` value for Mongoose queries.
function getPagination(req, options = {}) {
  const maxLimit = options.maxLimit || 50;
  const defaultLimit = options.defaultLimit || 10;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || defaultLimit;

  const safePage = Math.max(page, 1);
  const safeLimit = Math.min(Math.max(limit, 1), maxLimit);
  const skip = (safePage - 1) * safeLimit;

  return { page: safePage, limit: safeLimit, skip };
}

module.exports = getPagination;
