const amqp = require("amqplib");

const consumeQueue = "data_queue";
const sendQueue = "webhook_queue";
const retryInterval = 5000; // 5 seconds

async function connectToMQ() {
  try {
    const connection = await amqp.connect("amqp://rabbitmq");
    const channel = await connection.createChannel();

    process.once("SIGINT", async () => {
      await channel.close();
      await connection.close();
    });

    await channel.assertQueue(consumeQueue, { durable: true });
    await channel.assertQueue(sendQueue, { durable: true });

    await channel.consume(
      consumeQueue,
      (message) => {
        if (message) {
          const data = JSON.parse(message.content.toString());
          console.log(" [x] Received data-service:  '%s'", data);

          sendDataToWebhookQueue(channel, data);
        }
      },
      { noAck: true }
    );

    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  } catch (err) {
    console.warn("Error connecting to RabbitMQ:", err.message);
    console.log("Retrying in", retryInterval / 1000, "seconds...");
    setTimeout(connectToMQ, retryInterval); // Attempt to reconnect after the specified interval
  }
}

async function sendDataToWebhookQueue(channel, data) {
  try {
    channel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(data)), {
      persistent: true,
    });
  } catch (err) {
    console.warn("Error sending message to RabbitMQ:", err.message);
    // Optionally, you can handle the error here or retry sending the message
  }
}

connectToMQ();
