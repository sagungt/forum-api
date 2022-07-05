const createServer = require('../createServer');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'a comment',
      };
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;
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
      const { id: threadId } = threadResponseJson.data.addedThread;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 401 when headers authentication token incorrect', async () => {
      // Arrange
      const requestPayload = {
        content: 'a comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread id is not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'a comment',
      };
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/wrongid/comments',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 400 when payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;
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
      const { id: threadId } = threadResponseJson.data.addedThread;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 123,
      };
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;
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
      const { id: threadId } = threadResponseJson.data.addedThread;

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commetntId}', () => {
    it('should response 200 when thread id and comment id valid', async () => {
      // Arrange
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;
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
      const { id: threadId } = threadResponseJson.data.addedThread;

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
      const { id: commentId } = newCommentJson.data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
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
      // Arrange
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/nonthreadid/comments/noncommentid',
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
      // Arrange
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      const authenticationResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      const authenticationResponseJson = JSON.parse(authenticationResponse.payload);
      const { accessToken } = authenticationResponseJson.data;
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
      const { id: threadId } = threadResponseJson.data.addedThread;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/noncommentid`,
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

    it('should response 403 when deleting comment with wrong ownership', async () => {
      // Arrange
      const server = await createServer(container);

      // Pre action
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding1',
          password: 'secret',
          fullname: 'Dicoding Indonesia 1',
        },
      });
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding2',
          password: 'secret',
          fullname: 'Dicoding Indonesia 2',
        },
      });
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding1',
          password: 'secret',
        },
      });
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding2',
          password: 'secret',
        },
      });
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
        payload: {
          title: 'a thread',
          body: 'thread content',
        },
      });
      const threadResponseJson = JSON.parse(threadResponse.payload);
      const { id: threadId } = threadResponseJson.data.addedThread;

      const newComment = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
        payload: {
          content: 'a comment',
        },
      });
      const newCommentJson = JSON.parse(newComment.payload);
      const { id: commentId } = newCommentJson.data.addedComment;

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}`,
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('anda tidak memiliki hak akses untuk komentar ini');
    });
  });
});
