const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ReplyRepositoryPostgres', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('addReply function', () => {
    it('should add new reply and return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'a reply',
        commentId: 'comment-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'dicoding indo',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
      });
      await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });
  });

  describe('checkAvailabilityReply function', () => {
    it('should find id and return reply correctly', async () => {
      // Arrange
      const replyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'dicoding indo',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
        date: 'now',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'a reply',
        owner: 'user-123',
        date: 'now',
      });
      const reply = await replyRepositoryPostgres.checkAvailabilityReply(replyId);

      // Assert
      expect(reply.id).toEqual('reply-123');
      expect(reply.owner).toEqual('user-123');
    });

    it('should throw NotFoundError when reply id not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('softDeleteReplyById function', () => {
    it('should soft delete reply from database', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'dicoding indo',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
        date: 'now',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
        date: 'now',
      });

      // Action & Assert
      await expect(replyRepositoryPostgres.softDeleteReplyById('reply-123'))
        .resolves.not.toThrowError();
      const comment = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].is_deleted).toEqual(true);
    });
  });

  describe('findRepliesByCommentIds function', () => {
    it('should return replies matching comment ids', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'dicoding indo',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'a thread',
        body: 'thread content',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1234',
        threadId: 'thread-123',
        content: 'a comment',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-1234',
        commentId: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-12345',
        commentId: 'comment-1234',
        content: 'a comment',
        owner: 'user-123',
      });

      // Action
      const replies1 = await replyRepositoryPostgres
        .findRepliesByCommentIds(['comment-123', 'comment-1234']);
      const replies2 = await replyRepositoryPostgres
        .findRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies1).toHaveLength(3);
      expect(replies2).toHaveLength(2);
      expect(replies1).toStrictEqual([
        {
          id: 'reply-123',
          content: 'a comment',
          date: replies1[0].date, // date invoked in database
          username: 'dicoding',
          commentId: 'comment-123',
          isDeleted: false,
        },
        {
          id: 'reply-1234',
          content: 'a comment',
          date: replies1[1].date, // date invoked in database
          username: 'dicoding',
          commentId: 'comment-123',
          isDeleted: false,
        },
        {
          id: 'reply-12345',
          content: 'a comment',
          date: replies1[2].date, // date invoked in database
          username: 'dicoding',
          commentId: 'comment-1234',
          isDeleted: false,
        },
      ]);
      expect(replies2).toStrictEqual([
        {
          id: 'reply-123',
          content: 'a comment',
          date: replies2[0].date, // date invoked in database
          username: 'dicoding',
          commentId: 'comment-123',
          isDeleted: false,
        },
        {
          id: 'reply-1234',
          content: 'a comment',
          date: replies2[1].date, // date invoked in database
          username: 'dicoding',
          commentId: 'comment-123',
          isDeleted: false,
        },
      ]);
    });
  });
});
