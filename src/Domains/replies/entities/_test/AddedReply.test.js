const AddedReply = require('../AddedReply');

describe('AddedReply entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a reply',
    };

    // Action & Arrange
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: ['a reply'],
      owner: 'user-123',
    };

    // Action & Arrange
    expect(() => new AddedReply(payload)).toThrowError('ADDED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedReply entity correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'a reply',
      owner: 'user-123',
    };

    // Action
    const addedReply = new AddedReply(payload);

    // Arrange
    expect(addedReply).toBeInstanceOf(AddedReply);
    expect(addedReply.id).toEqual(payload.id);
    expect(addedReply.content).toEqual(payload.content);
    expect(addedReply.owner).toEqual(payload.owner);
  });
});
