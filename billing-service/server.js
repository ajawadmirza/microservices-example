const express = require("express");
const morgan = require("morgan");
const amqp = require('amqplib');
// init express app
const app = express();

// use morgan middleware
app.use(morgan("combined"));
app.use(express.json());
let channel;
const sendQueue = 'data_queue';
const retryInterval = 5000;
async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://rabbitmq');
    channel = await connection.createChannel();
    await channel.assertQueue(sendQueue, { durable: true });

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    console.log("RabbitMQ connection established.");
  } catch (error) {
    console.error('Error setting up RabbitMQ:', error.message);
    console.log("Retrying to connect to RabbitMQ in", retryInterval / 1000, "seconds...");
    setTimeout(setupRabbitMQ, retryInterval);
  }
};
setupRabbitMQ();
app.post("/billing", (req, res) => {
  console.log(req.body);
  res.send(req.body);
  channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(req.body)), {
    persistent: true,
  });
});

app.listen(3000);
