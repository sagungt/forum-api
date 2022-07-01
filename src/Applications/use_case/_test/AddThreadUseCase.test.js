const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

jest.useFakeTimers();
describe('AddThreadUseCase', () => {
  it('it should orchestrating the add thread action correctly', async () => {
    // Arrange
    const date = new Date().toISOString();
    const useCasePayload = {
      title: 'a thread',
      body: 'thread description',
      owner: 'user-123',
    };
    const expectedAddedThread = new AddedThread({
      id: 'thread-123',
      title: 'a thread',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedThread));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedThread = await addThreadUseCase.execute(useCasePayload);

    // Assert
    expect(addedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread)
      .toBeCalledWith(new NewThread({ ...useCasePayload, date }));
  });
});
