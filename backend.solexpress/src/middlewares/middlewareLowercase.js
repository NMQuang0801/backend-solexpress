function lowercaseKeysMiddleware(req, res, next) {
  const originalJson = res.json;
  res.json = function (data) {
    const convert = (obj) => {
      if (Array.isArray(obj)) return obj.map(convert);
      if (obj instanceof Date) return obj; // ✅ giữ nguyên Date
      if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [
            k.charAt(0).toLowerCase() + k.slice(1),
            convert(v),
          ])
        );
      }
      return obj;
    };
    return originalJson.call(this, convert(data));
  };
  next();
}

module.exports = { lowercaseKeysMiddleware };
