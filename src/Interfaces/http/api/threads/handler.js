const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: owner } = request.auth.credentials;
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const addedThread = await threadUseCase.addThread({
      ...request.payload,
      owner,
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
    const { threadId } = request.params;
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const getThread = await threadUseCase.getThreadDetail(threadId);

    return {
      status: 'success',
      data: {
        thread: getThread,
      },
    };
  }
}

module.exports = ThreadHandler;
