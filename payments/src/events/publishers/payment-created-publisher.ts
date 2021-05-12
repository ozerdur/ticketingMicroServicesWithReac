import { PaymentCreatedEvent, Publisher, Subjects } from "@ozerdurtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    readonly subject = Subjects.PaymentCreated;
}