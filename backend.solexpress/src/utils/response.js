class ApiResponse {
  constructor(status, { messages = null, errorMessages = null, data = null } = {}) {
    this.status = status;
    this.messages = messages;
    this.errorMessages = ApiResponse.normalizeErrors(errorMessages);
    this.data = data;
  }

  static normalizeErrors(errorMessages) {
    if (!errorMessages) return null;
    if (Array.isArray(errorMessages)) return errorMessages;
    return [errorMessages];
  }

  static send(res, httpStatus, { messages = null, errorMessages = null, data = null } = {}) {
    return res.status(httpStatus).json(new ApiResponse(httpStatus, { messages, errorMessages, data }));
  }

  static success(res, data = null, messages = 'Success') {
    return this.send(res, 200, { messages, data });
  }

  static created(res, data = null, messages = 'Created successfully') {
    return this.send(res, 201, { messages, data });
  }

  static badRequest(res, errorMessages = 'Bad request', data = null) {
    return this.send(res, 400, { errorMessages, data });
  }

  static unauthorized(res, errorMessages = 'Unauthorized') {
    return this.send(res, 401, { errorMessages });
  }

  static forbidden(res, errorMessages = 'Forbidden') {
    return this.send(res, 403, { errorMessages });
  }

  static notFound(res, errorMessages = 'Not found') {
    return this.send(res, 404, { errorMessages });
  }

  static validationError(res, errorMessages = 'Validation error', data = null) {
    return this.send(res, 422, { errorMessages, data });
  }

  static serverError(res, errorMessages = 'Internal Server Error') {
    return this.send(res, 500, { errorMessages });
  }
}

module.exports = ApiResponse;
