const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should add new comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'a comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'a comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'a comment',
        owner: 'user-123',
      }));
    });
  });

  describe('checkAvailabilityFunction', () => {
    it('should find id and return comment correctly', async () => {
      // Arrange
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

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
      const comment = await commentRepositoryPostgres.checkAvailabilityComment(commentId);

      // Assert
      expect(comment.id).toEqual('comment-123');
      expect(comment.owner).toEqual('user-123');
    });

    it('should throw NotFoundError when comment id not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123'))
        .rejects.toThrowError(NotFoundError);
    });
  });

  describe('softDeleteCommentById function', () => {
    it('should soft delete comment from database', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

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

      // Action & Assert
      await expect(commentRepositoryPostgres.softDeleteCommentById('comment-123'))
        .resolves.not.toThrowError();
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
      expect(comment[0].is_deleted).toEqual(true);
    });
  });

  describe('findCommentsByThreadId function', () => {
    it('should return comments matching with threadId sort by ascending', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: 'dicoding',
        password: 'secret',
        fullname: 'dicoding indo',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-1',
        title: 'a thread',
        body: 'thread content',
        owner: 'user-123',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-2',
        title: 'a thread',
        body: 'thread content',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-1',
        content: 'comment 1',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        threadId: 'thread-1',
        content: 'comment 2',
        owner: 'user-123',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-3',
        threadId: 'thread-2',
        content: 'comment 3',
        owner: 'user-123',
      });

      // Action
      const comments1 = await commentRepositoryPostgres.findCommentsByThreadId('thread-1');
      const comments2 = await commentRepositoryPostgres.findCommentsByThreadId('thread-2');

      // Assert
      expect(comments1).toHaveLength(2);
      expect(comments2).toHaveLength(1);
      expect(comments1).toStrictEqual([
        {
          id: 'comment-1',
          username: 'dicoding',
          date: comments1[0].date, // date invoked in database
          content: 'comment 1',
          isDeleted: false,
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: comments1[1].date, // date invoked in database
          content: 'comment 2',
          isDeleted: false,
        },
      ]);
      expect(comments2).toStrictEqual([
        {
          id: 'comment-3',
          username: 'dicoding',
          date: comments2[0].date,
          content: 'comment 3',
          isDeleted: false,
        },
      ]);
    });
  });
});
