const GetReply = require('../GetReply');

describe('GetReply entities', () => {
  it('should throw error when payload not contain neede property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      date: 'now',
      content: 'a comment',
    };

    // Action & Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: 'now',
      content: 123,
      isDeleted: true,
    };

    // Action & Assert
    expect(() => new GetReply(payload)).toThrowError('GET_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetReply entity correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2022-07-14',
      content: 'a comment',
      isDeleted: false,
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply).toBeInstanceOf(GetReply);
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.username).toEqual(payload.username);
    expect(getReply.date).toEqual(new Date(payload.date).toISOString());
    expect(getReply.content).toEqual(payload.content);
  });

  it('should create GetReply entity with deleted reply correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: '2022-07-14',
      content: 'a comment',
      isDeleted: true,
    };

    // Action
    const getReply = new GetReply(payload);

    // Assert
    expect(getReply).toBeInstanceOf(GetReply);
    expect(getReply.id).toEqual(payload.id);
    expect(getReply.username).toEqual(payload.username);
    expect(getReply.date).toEqual(new Date(payload.date).toISOString());
    expect(getReply.content).toEqual('**balasan telah dihapus**');
  });
});
