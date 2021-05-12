import { Publisher, Subjects, OrderCancelledEvent } from "@ozerdurtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{
    readonly subject = Subjects.OrderCancelled;
}