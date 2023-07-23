const amqp = require("amqplib");

const consumeQueue = "webhook_queue";
const retryInterval = 5000;

async function connectToMQ() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(consumeQueue, { durable: true });
    await channel.consume(
      consumeQueue,
      (message) => {
        if (message) {
          const data = JSON.parse(message.content.toString());
          console.log(" [x] Received webhook-service '%s'", data);
          channel.ack(message);
        }
      },
      { noAck: false }
    );

    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  } catch (err) {
    console.warn("Error connecting to RabbitMQ:", err.message);
    console.log("Retrying in", retryInterval / 1000, "seconds...");
    setTimeout(connectToMQ, retryInterval);
  }
}

connectToMQ();
