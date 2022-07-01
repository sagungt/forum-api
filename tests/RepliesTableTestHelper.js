/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  addReply: async ({
    id = 'reply-123',
    commentId = 'comment-123',
    content = 'a reply',
    date = 'now',
    owner = 'user-123',
    isDeleted = false,
  }) => {
    const query = {
      text: 'INSERT INTO replies VALUES ($1, $2, $3, $4, $5, $6)',
      values: [id, commentId, content, date, owner, isDeleted],
    };

    await pool.query(query);
  },

  findReplyById: async (id) => {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  findRepliesByCommentId: async (id) => {
    const query = {
      text: 'SELECT * FROM replies WHERE comment_id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  cleanTable: async () => {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },
};

module.exports = RepliesTableTestHelper;
