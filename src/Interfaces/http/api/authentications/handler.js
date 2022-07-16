const AuthenticationUseCase = require('../../../../Applications/use_case/AuthenticationUseCase');
const UserUseCase = require('../../../../Applications/use_case/UserUseCase');

class AuthenticationsHandler {
  constructor(container) {
    this._container = container;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    const userUseCase = this._container.getInstance(UserUseCase.name);
    const { accessToken, refreshToken } = await userUseCase.loginUser(request.payload);
    const response = h.response({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
      },
    });
    response.code(201);
    return response;
  }

  async putAuthenticationHandler(request) {
    const authenticationUseCase = this._container
      .getInstance(AuthenticationUseCase.name);
    const accessToken = await authenticationUseCase.refreshAuthentication(request.payload);

    return {
      status: 'success',
      data: {
        accessToken,
      },
    };
  }

  async deleteAuthenticationHandler(request) {
    const userUseCase = this._container.getInstance(UserUseCase.name);
    await userUseCase.logoutUser(request.payload);
    return {
      status: 'success',
    };
  }
}

module.exports = AuthenticationsHandler;
