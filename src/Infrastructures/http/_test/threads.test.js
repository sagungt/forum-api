const pool = require('../../database/postgres/pool');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const createServer = require('../createServer');
const container = require('../../container');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'a thread',
        body: 'thread content',
      };
      const server = await createServer(container);

      // Pre action
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login
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
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 401 when headers authentication token incorrect', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'a thread',
      };
      const server = await createServer(container);

      // Pre action
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login
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
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: 'thread content',
      };
      const server = await createServer(container);

      // Pre action
      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login
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
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 with correct value without comments', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login
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
      // add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'thread content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadResponseJson = JSON.parse(threadResponse.payload);
      const { id: threadId } = threadResponseJson.data.addedThread;

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.comments).not.toBeDefined();
    });

    it('should response 200 with correct value without replies', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login
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
      // add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'thread content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadResponseJson = JSON.parse(threadResponse.payload);
      const { id: threadId } = threadResponseJson.data.addedThread;
      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentResponseJson = JSON.parse(commentResponse.payload);
      const { id: commentId } = commentResponseJson.data.addedComment;

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread.comments[0].id).toEqual(commentId);
      expect(responseJson.data.thread.comments[0].replies).not.toBeDefined();
    });

    it('should response 200 with correct values with comments and replies in database', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login
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
      // add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'thread content',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const threadResponseJson = JSON.parse(threadResponse.payload);
      const { id: threadId } = threadResponseJson.data.addedThread;
      // add comment
      const commentResponse1 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment 1',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentResponse2 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment 2',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentResponse3 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment 3',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const commentResponseJson1 = JSON.parse(commentResponse1.payload);
      const commentResponseJson2 = JSON.parse(commentResponse2.payload);
      const commentResponseJson3 = JSON.parse(commentResponse3.payload);
      const { id: commentId1 } = commentResponseJson1.data.addedComment;
      const { id: commentId2 } = commentResponseJson2.data.addedComment;
      const { id: commentId3 } = commentResponseJson3.data.addedComment;
      const replyResponse1 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId1}/replies`,
        payload: {
          content: 'reply 1 to comment 1',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const replyResponse2 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId1}/replies`,
        payload: {
          content: 'reply 2 to comment 1',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const replyResponse3 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId2}/replies`,
        payload: {
          content: 'reply 1 to comment 2',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const replyResponseJson1 = JSON.parse(replyResponse1.payload);
      const replyResponseJson2 = JSON.parse(replyResponse2.payload);
      const replyResponseJson3 = JSON.parse(replyResponse3.payload);
      const { id: replyId1 } = replyResponseJson1.data.addedReply;
      const { id: replyId2 } = replyResponseJson2.data.addedReply;
      const { id: replyId3 } = replyResponseJson3.data.addedReply;

      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId1}/replies/${replyId1}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId3}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      // console.debug(responseJson);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      // comment 1
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(3);
      expect(responseJson.data.thread.comments[0].id)
        .toEqual(commentId1);
      // comment 1 replies
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies[0].id)
        .toEqual(replyId1);
      expect(responseJson.data.thread.comments[0].replies[1].id)
        .toEqual(replyId2);
      // comment 1 deleted replies
      expect(responseJson.data.thread.comments[0].replies[0].content)
        .toEqual('**balasan telah dihapus**');
      // comment 2
      expect(responseJson.data.thread.comments[1].id)
        .toEqual(commentId2);
      // comment 2 replies
      expect(responseJson.data.thread.comments[1].replies).toBeDefined();
      expect(responseJson.data.thread.comments[1].replies).toHaveLength(1);
      expect(responseJson.data.thread.comments[1].replies[0].id)
        .toEqual(replyId3);
      // deleted comment 3
      expect(responseJson.data.thread.comments[2].id)
        .toEqual(commentId3);
      expect(responseJson.data.thread.comments[2].content)
        .toEqual('**komentar telah dihapus**');
    });

    it('should response 200 with soft delete correct values in database', async () => {
      // Arrange
      const server = await createServer(container);

      // add user
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding1',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding2',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login
      const authenticationResponse1 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding1',
          password: 'secret',
        },
      });
      const authenticationResponse2 = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding1',
          password: 'secret',
        },
      });
      const authenticationResponseJson1 = JSON.parse(authenticationResponse1.payload);
      const { accessToken: accessToken1 } = authenticationResponseJson1.data;
      const authenticationResponseJson2 = JSON.parse(authenticationResponse2.payload);
      const { accessToken: accessToken2 } = authenticationResponseJson2.data;
      // add thread
      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'a thread',
          body: 'thread content',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      const threadResponseJson = JSON.parse(threadResponse.payload);
      const { id: threadId } = threadResponseJson.data.addedThread;
      // add comment
      const commentResponse1 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment 1',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      const commentResponse2 = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment 2',
        },
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        payload: {
          content: 'a comment 3',
        },
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });
      const commentResponse1Json = JSON.parse(commentResponse1.payload);
      const commentResponse2Json = JSON.parse(commentResponse2.payload);
      // delete comment
      await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentResponse1Json.data.addedComment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      // Arrange
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(3);
      expect(responseJson.data.thread.comments[0].content)
        .toEqual('**komentar telah dihapus**');
      expect(responseJson.data.thread.comments[1].id)
        .toEqual(commentResponse2Json.data.addedComment.id);
    });

    it('should respose 404 when thread id not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/nonthreadid',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });
  });
});
