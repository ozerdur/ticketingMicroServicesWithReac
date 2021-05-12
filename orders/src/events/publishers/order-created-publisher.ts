import { Publisher, Subjects, OrderCreatedEvent } from "@ozerdurtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    readonly subject = Subjects.OrderCreated;
}