class NewComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      content, threadId, date, owner,
    } = payload;

    this.content = content;
    this.threadId = threadId;
    this.date = date;
    this.owner = owner;
    this.isDeleted = false;
  }

  _verifyPayload(payload) {
    const {
      content, threadId, date, owner,
    } = payload;

    if (
      !content
      || !threadId
      || !date
      || !owner
    ) {
      throw new Error('NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string'
      || typeof threadId !== 'string'
      || typeof date !== 'string'
      || typeof owner !== 'string'
    ) {
      throw new Error('NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewComment;
