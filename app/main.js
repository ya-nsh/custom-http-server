const net = require('net');

const createResponse = ({ status, headers, body }) => {
  return [
    `HTTP/1.1 ${status}`,
    ...Object.entries(headers ?? {}).map(([key, value]) => `${key}: ${value}`),
    '',
    body ?? '',
  ].join('\r\n');
};

const server = net.createServer(socket => {
  socket.on('data', data => {
    let response = '';
    try {
      const [target, ..._headersAndBody] = data.toString().split('\r\n');
      const [_method, path, _version] = target.split(' ');

      if (path === '/') {
        response = createResponse({ status: '200 OK' });
      } else if (path.startsWith('/echo')) {
        const echoedText = path.split('echo/').at(-1);
        response = createResponse({
          status: '200 OK',
          body: echoedText,
          headers: {
            'Content-Type': 'text/plain',
            'Content-Length': echoedText.length,
          },
        });
      } else {
        response = createResponse({
          status: '404 Not Found',
        });
      }
    } catch (error) {
      response = createResponse({
        status: '404 Not Found',
      });
    }

    socket.write(response);
    socket.end();
  });
  socket.on('close', () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, 'localhost');
