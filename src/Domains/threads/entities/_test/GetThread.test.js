const GetThread = require('../GetThread');

describe('GetThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread',
    };

    // Action & Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'a thread',
      body: 'thread content',
      date: 'now',
      username: 'dicoding',
    };

    // Action & Assert
    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'a thread',
      body: 'thread content',
      date: '2022-07-14 21:10:56.950863',
      username: 'dicoding',
    };

    // Action
    const getThread = new GetThread(payload);

    // Action & Assert
    expect(getThread).toBeInstanceOf(GetThread);
    expect(getThread.id).toEqual(payload.id);
    expect(getThread.title).toEqual(payload.title);
    expect(getThread.body).toEqual(payload.body);
    expect(getThread.date).toEqual(new Date(payload.date).toISOString());
    expect(getThread.username).toEqual(payload.username);
  });
});
