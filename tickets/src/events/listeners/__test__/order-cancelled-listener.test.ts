import { OrderCancelledEvent, OrderStatus } from '@ozerdurtickets/common';
import mongoose from 'mongoose';
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {


    // Create a listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 10,
        userId: mongoose.Types.ObjectId().toHexString(),

    });
    const orderId = mongoose.Types.ObjectId().toHexString();
    ticket.set({ orderId });

    await ticket.save();

    // Create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    // return all of this stuff

    return { listener, ticket, msg, data };
}

it('clears the orderId of the ticket', async () => {
    const { listener, ticket, msg, data } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(undefined);

});

it('acks the message', async () => {
    const { listener, ticket, msg, data } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});


it('publishes a ticket updated event', async () => {
    const { listener, msg, data } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.ticket.id).toEqual(ticketUpdatedData.id);
    expect(ticketUpdatedData.orderId).toEqual(undefined);

});