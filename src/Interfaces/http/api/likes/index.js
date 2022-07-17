const LikeHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'likes',
  register: async (server, { container }) => {
    const likeHandler = new LikeHandler(container);
    server.route(routes(likeHandler));
  },
};
