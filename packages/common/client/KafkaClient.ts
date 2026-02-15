import { Kafka, type Producer } from "kafkajs";

export class KafkaClient {
  private kafka: Kafka;

  private constructor(private clientId: string) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: ["localhost:9092"],
    });
  }

  public static create(clientId: string): KafkaClient {
    return new KafkaClient(clientId);
  }

  public async produce(payload: Uint8Array, topic: string): Promise<void> {
    try {
      const producer: Producer = this.kafka.producer();
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
    }
  }
}
