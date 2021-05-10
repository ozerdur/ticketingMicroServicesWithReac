import { Publisher, Subjects, TicketCreatedEvent } from "@ozerdurtickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    readonly subject = Subjects.TicketCreated;
}