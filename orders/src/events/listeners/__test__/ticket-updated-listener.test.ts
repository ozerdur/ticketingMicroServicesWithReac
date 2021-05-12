import { Message } from 'node-nats-streaming';
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { TicketUpdatedEvent } from "@ozerdurtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    //create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // creates and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    })
    await ticket.save();

    // create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    // return all of this stuff
    return { listener, data, ticket, msg };
}


it('finds, updates and saves a ticket', async () => {
    const { listener, data, ticket, msg } = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was updated!
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called!
    expect(msg.ack).toHaveBeenCalled();

});


it('does not call ack if the event has a skipped version number', async () => {
    const { listener, data, msg } = await setup();
    data.version = 10;

    await expect(listener.onMessage(data, msg)).rejects.toThrowError();
    expect(msg.ack).not.toHaveBeenCalled();

});