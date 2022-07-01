const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadUseCase = require('../../../../Applications/use_case/GetThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute({
      ...request.payload,
      owner: request.auth.credentials.id,
    });

    const respose = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    respose.code(201);
    return respose;
  }

  async getThreadHandler(request, h) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);
    const getThread = await getThreadUseCase.execute(request.params);

    return {
      status: 'success',
      data: {
        thread: getThread,
      },
    };
  }
}

module.exports = ThreadHandler;
