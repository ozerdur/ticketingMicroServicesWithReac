import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

import { Ticket } from '../../models/ticket';


it('returns a 404 if the order is not found', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
        .get(`/api/orders/${id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(404);
});


it('returns an error if invalid orderId is provided', async () => {
    await request(app)
        .get('/api/orders/orderId')
        .set('Cookie', global.signin())
        .send()
        .expect(400);
});


it('returns the order if the order is found', async () => {
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

    const { body } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(body.id).toEqual(order.id);
});

it('returns 401 if another users order is requested', async () => {
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
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);

});
