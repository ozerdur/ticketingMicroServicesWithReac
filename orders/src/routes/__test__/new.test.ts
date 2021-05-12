import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/orders for post requests', async () => {
    const response = await request(app)
        .post('/api/orders')
        .send();

    expect(response.status).not.toEqual(404);
});

it('can only be access if the user is signed', async () => {
    await request(app)
        .post('/api/orders')
        .send({})
        .expect(401);
});


it('returns a response other than 401 if the user is signed', async () => {
    const response = await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});


it('returns an error if invalid ticketId is provided', async () => {
    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: '',
        })
        .expect(400);

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
        })
        .expect(400);

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: 'ticketId'
        })
        .expect(400);
});

it('returns an error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticketId
        })
        .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    const ticket = Ticket.build({
        id,
        title: 'concert',
        price: 20
    });

    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'asdasdasdad',
        status: OrderStatus.Created,
        expiresAt: new Date()
    });

    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id
        })
        .expect(400);

});

it('reserves a ticket with valid inputs', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    const orders = await Order.find({});
    expect(orders.length).toEqual(1);
});

//it.todo('emits an order creted event');


it('publishes an event', async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signin())
        .send({
            ticketId: ticket.id
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
