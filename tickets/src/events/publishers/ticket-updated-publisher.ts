import { Publisher, Subjects, TicketUpdatedEvent } from "@ozerdurtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
    readonly subject = Subjects.TicketUpdated;
}