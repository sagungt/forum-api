const UserUseCase = require('../../../../Applications/use_case/UserUseCase');

class UsersHandler {
  constructor(container) {
    this._container = container;

    this.postUserHandler = this.postUserHandler.bind(this);
  }

  async postUserHandler(request, h) {
    const userUseCase = this._container.getInstance(UserUseCase.name);
    const addedUser = await userUseCase.addUser(request.payload);

    const response = h.response({
      status: 'success',
      data: {
        addedUser,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
