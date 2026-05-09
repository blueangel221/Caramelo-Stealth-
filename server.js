const express = require('express');

const http = require('http');

const socketIo = require('socket.io');

const cors = require('cors');

const app = express();

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: '*'
  }
});

app.use(cors());

function generateSignal() {

  const type =
    Math.random() > 0.5
      ? 'BUY'
      : 'SELL';

  return {

    pair: 'BTC/USD',

    signal: type,

    price:
      (79000 + Math.random() * 1000)
      .toFixed(2),

    confidence: 95,

    strategy:
      'Smart Money + Wyckoff',

    smartmoney:
      'Liquidity Sweep',

    wyckoff:
      'Distribution',

    entryTime:
      new Date().toLocaleString(
        'pt-BR',
        {
          timeZone:
            'America/Sao_Paulo'
        }
      ),

    expiration:
      '1 minuto'
  };
}

io.on('connection', socket => {

  console.log('Usuário conectado');

  setInterval(() => {

    const signal =
      generateSignal();

    socket.emit(
      'signal',
      signal
    );

  }, 10000);

});

server.listen(3000, () => {
  console.log('Servidor online');
});
