import request from 'supertest';
import { app } from '../../app';

const createTicket = async () => {
    const title = 'concert';
    const price = 20;
    return request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title, price
        });
}



it('returns list of the tickets if signed in', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const ticketResponse = await request(app)
        .get('/api/tickets')
        .set('Cookie', global.signin())
        .send()
        .expect(200);

    expect(ticketResponse.body.length).toEqual(3);
});
