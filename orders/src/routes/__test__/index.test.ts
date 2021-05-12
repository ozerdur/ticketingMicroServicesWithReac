import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

const builtTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    });

    await ticket.save();
    return ticket;
}


it('fetches orders for particular user', async () => {
    //Create three tickets
    const ticketOne = await builtTicket();
    const ticketTwo = await builtTicket();
    const ticketThree = await builtTicket();

    const userOne = global.signin();
    const userTwo = global.signin();

    //Create one order as User #1
    const { body: orderOne } = await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    //Create two orders as User #2
    const { body: orderTwo } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);


    const { body: orderThree } = await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    //Make request to get orders for User #2

    const orderResponse = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .send()
        .expect(200);

    //Make sure we only got the orders for User #2
    expect(orderResponse.body.length).toEqual(2);
    expect(orderResponse.body[0].id).toEqual(orderTwo.id);
    expect(orderResponse.body[1].id).toEqual(orderThree.id);
    expect(orderResponse.body[0].ticket.id).toEqual(ticketTwo.id);
    expect(orderResponse.body[1].ticket.id).toEqual(ticketThree.id);
});
