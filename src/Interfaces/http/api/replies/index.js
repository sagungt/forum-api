const ReplyHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'replies',
  register: async (server, { container }) => {
    const replyHandler = new ReplyHandler(container);
    server.route(routes(replyHandler));
  },
};
