const NewReply = require('../NewReply');

describe('NewReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'a reply',
      commentId: 'comment-123',
      date: 'now',
    };

    // Action & Arrange
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'a reply',
      commentId: 'comment-123',
      date: 'now',
      owner: 123,
    };

    // Action & Arrange
    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewReply entity correctly', () => {
    // Arrange
    const payload = {
      content: 'a reply',
      commentId: 'comment-123',
      date: 'now',
      owner: 'user-123',
    };

    // Action
    const newReply = new NewReply(payload);

    // Arrange
    expect(newReply).toBeInstanceOf(NewReply);
    expect(newReply.content).toEqual(payload.content);
    expect(newReply.commentId).toEqual(payload.commentId);
    expect(newReply.date).toEqual(payload.date);
    expect(newReply.owner).toEqual(payload.owner);
    expect(newReply.isDeleted).toEqual(false);
  });
});
