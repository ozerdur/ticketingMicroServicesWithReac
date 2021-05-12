import { OrderCancelledEvent, OrderStatus } from '@ozerdurtickets/common';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
    // Create a listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // Create an order
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 10,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0
    });

    await order.save();

    // Create the fake data event
    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString()
        }
    }

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    // return all of this stuff

    return { listener, order, msg, data };
}

it('cancels the order', async () => {
    const { listener, order, msg, data } = await setup();

    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);

});


it('rejects the order if version is not appropriate', async () => {
    const { listener, order, msg, data } = await setup();
    data.version = 10;
    // call the onMessage function with the data object + message object
    await expect(listener.onMessage(data, msg)).rejects.toThrowError();

});

it('acks the message', async () => {
    const { listener, msg, data } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
