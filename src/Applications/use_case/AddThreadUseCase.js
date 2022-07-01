const NewThread = require('../../Domains/threads/entities/NewThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const date = new Date().toISOString();
    const newThread = new NewThread({ ...useCasePayload, date });
    return this._threadRepository.addThread(newThread);
  }
}

module.exports = AddThreadUseCase;
