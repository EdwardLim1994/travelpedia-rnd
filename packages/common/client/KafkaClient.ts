import { Kafka, logLevel, type Producer } from "kafkajs";
import type { KafkaGroupId, KafkaTopicName } from "../constant";

export class KafkaClient {
  private kafka: Kafka;

  private constructor(private clientId: string) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: ["localhost:29092"],
    });
  }

  public static create(clientId: string): KafkaClient {
    return new KafkaClient(clientId);
  }

  public async produce(payload: Uint8Array, topic: string): Promise<void> {
    const producer: Producer = this.kafka.producer();
    try {
      await producer.connect();
      await producer.send({
        topic,
        messages: [
          {
            value: Buffer.from(payload),
          },
        ],
      });
    } catch (error) {
      console.error("Error in Kafka producer:", error);
      await producer.disconnect();
    }
  }

  public async consume(
    groupId: KafkaGroupId,
    topic: KafkaTopicName,
    onMessage: (message: Uint8Array) => Promise<void>,
  ): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId: groupId,
    });
    try {
      await consumer.connect();

      await consumer.subscribe({ topic, fromBeginning: true });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(
            `Received message: ${message.value?.toString()} on topic ${topic} partition ${partition}`,
          );

          if (!message.value) {
            console.warn("Received message with empty value, skipping...");
            return;
          }

          await onMessage(message.value);
        },
      });
    } catch (error) {
      console.error("Error in Kafka consumer:", error);

      await consumer.disconnect();
    }
  }
}
