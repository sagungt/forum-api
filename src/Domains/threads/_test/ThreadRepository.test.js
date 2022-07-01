const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    // Arrange
    const threadRepository = new ThreadRepository();

    // Action & Assert
    await expect(threadRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.findThreadById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadRepository.checkAvailabilityThread('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
