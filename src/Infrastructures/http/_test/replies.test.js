const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  let server;
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  beforeAll(async () => {
    server = await createServer(container);
  });

  const addUserAndLogin = async ({
    username = 'dicoding',
    password = 'secret',
    fullname = 'Dicoding Indonesia',
  } = {}) => {
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password,
        fullname,
      },
    });
    const authenticationResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username,
        password,
      },
    });
    const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
    const { accessToken } = authenticationResponseJson.data;
    return accessToken;
  };

  const addThread = async (accessToken) => {
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'a thread',
        body: 'thread content',
      },
    });
    const threadResponseJson = JSON.parse(threadResponse.payload);
    const { id } = threadResponseJson.data.addedThread;
    return id;
  };

  const addComment = async (accessToken, threadId) => {
    const newComment = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'a comment',
      },
    });
    const newCommentJson = JSON.parse(newComment.payload);
    const { id } = newCommentJson.data.addedComment;
    return id;
  };

  const addReply = async (accessToken, threadId, commentId) => {
    const replyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: {
        content: 'a reply',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const replyResponseJson = JSON.parse(replyResponse.payload);
    const { id } = replyResponseJson.data.addedReply;
    return id;
  };

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should resonse 401 when header authentication token incorrect', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread id is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const accessToken = await addUserAndLogin();

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment id is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'a reply',
      };

      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-123/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 400 when payload not contain needed property', async () => {
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };

      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 when thread, comment and reply id valid', async () => {
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);
      const replyId = await addReply(accessToken, threadId, commentId);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when thread not found', async () => {
      const accessToken = await addUserAndLogin();

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/nonthreadid/comments/noncommentid/replies/nonreplyid',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/noncommentid/replies/nonreplyid`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('komentar tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
      const accessToken = await addUserAndLogin();
      const threadId = await addThread(accessToken);
      const commentId = await addComment(accessToken, threadId);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/nonreplyid`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan');
    });

    it('should response 403 when deleting reply with wrong ownership', async () => {
      const accessToken1 = await addUserAndLogin();
      const accessToken2 = await addUserAndLogin({
        username: 'dicoding2',
      });
      const threadId = await addThread(accessToken1);
      const commentId = await addComment(accessToken1, threadId);
      const replyId = await addReply(accessToken1, threadId, commentId);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak memiliki hak akses untuk balasan ini');
    });
  });
});
