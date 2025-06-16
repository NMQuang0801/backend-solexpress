class ApiResponse {
  static success(data = null, message = 'Success') {
    return {
      status: 200,
      message,
      data,
      success: true,
    };
  }

  static error(message = 'Error', errorCode = 'SERVER_ERROR', data = null) {
    return {
      status: 200,
      message,
      data,
      success: false,
      errorCode,
    };
  }

  static created(data = null, message = 'Created successfully') {
    return this.success(data, message);
  }

  static badRequest(message = 'Bad request', data = null) {
    return this.error(message, 'BAD_REQUEST', data);
  }

  static unauthorized(message = 'Unauthorized', data = null) {
    return this.error(message, 'UNAUTHORIZED', data);
  }

  static forbidden(message = 'Forbidden', data = null) {
    return this.error(message, 'FORBIDDEN', data);
  }

  static notFound(message = 'Not found', data = null) {
    return this.error(message, 'NOT_FOUND', data);
  }

  static validationError(message = 'Validation error', data = null) {
    return this.error(message, 'VALIDATION_ERROR', data);
  }
}

module.exports = ApiResponse; 