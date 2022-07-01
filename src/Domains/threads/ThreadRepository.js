class ThreadRepository {
  async addThread(newThread) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async findThreadById(id) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async checkAvailabilityThread(id) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadRepository;
