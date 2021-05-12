import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@ozerdurtickets/common';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';



it('returns a 404 if the order is not found', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
        .delete(`/api/orders/${id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(404);
});


it('returns an error if invalid orderId is provided', async () => {
    await request(app)
        .delete('/api/orders/asdas')
        .set('Cookie', global.signin())
        .send()
        .expect(400);
});

it('marks the order as cancelled if the order is found', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
        .post('/api/orders/')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('returns 401 if another users order is requested', async () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
        .post('/api/orders/')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);

});


//it.todo('emits an order deleted event');



it('publishes an event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const user = global.signin();

    const { body: order } = await request(app)
        .post('/api/orders/')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(204);


    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
