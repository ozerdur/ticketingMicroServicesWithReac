import { Publisher, ExpirationCompleteEvent, Subjects } from "@ozerdurtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}
