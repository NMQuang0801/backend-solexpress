class ApiResponse {
  static success(data = null, message = 'Success', status = 200) {
    return {
      status,
      message,
      data,
      success: true
    };
  }

  static error(message = 'Error', status = 500, data = null) {
    return {
      status,
      message,
      data,
      success: false
    };
  }

  static created(data = null, message = 'Created successfully') {
    return this.success(data, message, 201);
  }

  static badRequest(message = 'Bad request', data = null) {
    return this.error(message, 400, data);
  }

  static unauthorized(message = 'Unauthorized', data = null) {
    return this.error(message, 401, data);
  }

  static forbidden(message = 'Forbidden', data = null) {
    return this.error(message, 403, data);
  }

  static notFound(message = 'Not found', data = null) {
    return this.error(message, 404, data);
  }

  static validationError(message = 'Validation error', data = null) {
    return this.error(message, 422, data);
  }
}

module.exports = ApiResponse; 