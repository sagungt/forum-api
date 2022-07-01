class NewThread {
  constructor(payload) {
    this._verifyPayload(payload);
    const {
      title,
      body,
      date,
      owner,
    } = payload;

    this.title = title;
    this.body = body;
    this.date = date;
    this.owner = owner;
  }

  _verifyPayload(payload) {
    const {
      title,
      body,
      date,
      owner,
    } = payload;

    if (!title || !body) {
      throw new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof title !== 'string'
      || typeof body !== 'string'
      || typeof owner !== 'string'
      || typeof date !== 'string'
    ) {
      throw new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = NewThread;
