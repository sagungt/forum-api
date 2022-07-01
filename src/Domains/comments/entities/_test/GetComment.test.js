const GetComment = require('../GetComment');

describe('GetComment entities', () => {
  it('should throw error when payload not contain neede property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      date: 'now',
      content: 'a comment',
    };

    // Action & Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: 'now',
      content: 123,
    };

    // Action & Assert
    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetComment entity correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'dicoding',
      date: 'now',
      content: 'a comment',
    };

    // Action
    const getComment = new GetComment(payload);

    // Assert
    expect(getComment).toBeInstanceOf(GetComment);
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.username).toEqual(payload.username);
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.content).toEqual(payload.content);
  });
});
