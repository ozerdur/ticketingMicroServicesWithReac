import { Message } from 'node-nats-streaming';
import { ExpirationCompleteistener } from "../expiration-complete-listener";
import { ExpirationCompleteEvent, OrderStatus } from "@ozerdurtickets/common";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
    //create an instance of the listener
    const listener = new ExpirationCompleteistener(natsWrapper.client);

    // creates and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10
    })
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        expiresAt: new Date(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        ticket: ticket
    });

    await order.save();

    // create a fake data event
    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id,
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    // return all of this stuff
    return { listener, data, order, msg };
}


it('finds, updates and saves an order', async () => {
    const { listener, data, order, msg } = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure a ticket was updated!
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {

    const { listener, data, order, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(eventData.id).toEqual(order.id);
});

it('does not update completed orders', async () => {
    const { listener, data, order, msg } = await setup();
    order.set({
        status: OrderStatus.Complete
    });

    await order.save();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    // write assertions to make sure a ticket was not updated!
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});


it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // write assertions to make sure ack function is called!
    expect(msg.ack).toHaveBeenCalled();

});
