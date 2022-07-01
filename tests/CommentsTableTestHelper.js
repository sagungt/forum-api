/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  addComment: async ({
    id = 'comment-123', threadId = 'thread-123', content = 'a comment', date = 'now', owner = 'user-123', isDeleted = false,
  }) => {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, content, date, owner, isDeleted],
    };

    await pool.query(query);
  },

  findCommentByThreadId: async (threadId) => {
    const query = {
      text: 'SELECT * FROM comments WHERE thread_id = $1',
      values: [threadId],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  findCommentById: async (id) => {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  cleanTable: async () => {
    await pool.query('DELETE FROM authentications WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
