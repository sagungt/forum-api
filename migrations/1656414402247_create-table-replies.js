/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('replies', {
    id: {
      type: 'VARCHAR(50)',
      primary: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    content: {
      type: 'TEXT',
      notNull: true,
    },
    date: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    is_deleted: {
      type: 'BOOLEAN',
      notNull: true,
    },
  });

  pgm.addConstraint('comments', 'fk_replies.comment_id_comments.id', 'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');
  pgm.addConstraint('comments', 'fk_replies.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('replies');
};
