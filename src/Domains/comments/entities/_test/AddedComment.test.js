const AddedComment = require('../AddedComment');

describe('AddedComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'a comment',
    };

    // Action & Arrange
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: ['a comment'],
      owner: 'user-123',
    };

    // Action & Arrange
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment entity correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'a comment',
      owner: 'user-123',
    };

    // Action
    const addedComment = new AddedComment(payload);

    // Arrange
    expect(addedComment).toBeInstanceOf(AddedComment);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
