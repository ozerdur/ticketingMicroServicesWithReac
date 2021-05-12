import mongoose, { MongooseDocument } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';
import { stripe } from '../../stripe';


it('has a route handler listening to /api/payments for post requests', async () => {
    const response = await request(app)
        .post('/api/payments')
        .send({});

    expect(response.status).not.toEqual(404);
});

it('can only be access if the user is signed', async () => {
    await request(app)
        .post('/api/payments')
        .send({})
        .expect(401);
});


it('returns a response other than 401 if the user is signed', async () => {
    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({});

    expect(response.status).not.toEqual(401);
});


it('returns an error if invalid token is provided', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: '',
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(400);

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            orderId: mongoose.Types.ObjectId().toHexString()
        })
        .expect(400);
});

it('returns an error if invalid orderId is provided', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'token',
            orderId: ''
        })
        .expect(400);

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'token'
        })
        .expect(400);
});

it('returns 401 with different ', async () => {
    const user = global.signin();
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        version: 0,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', user)
        .send({
            token: 'token',
            orderId: order.id
        })
        .expect(401);
});

it('gets 400 if order is cancelled ', async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        price: 10,
        version: 0,
        status: OrderStatus.Cancelled
    });

    await order.save();

    const user = global.signin(order.userId);

    await request(app)
        .post('/api/payments')
        .set('Cookie', user)
        .send({
            token: 'token',
            orderId: order.id
        })
        .expect(400);
});

it('charges with valid inputs ', async () => {
    const price = Math.floor(Math.random() * 100000);
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        userId: mongoose.Types.ObjectId().toHexString(),
        price,
        version: 0,
        status: OrderStatus.Created
    });

    await order.save();

    const user = global.signin(order.userId);

    const response = await request(app)
        .post('/api/payments')
        .set('Cookie', user)
        .send({
            token: 'tok_visa',
            orderId: order.id
        })
        .expect(201);
    expect(stripe.charges.create).toHaveBeenCalled();
    const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
    expect(chargeOptions.source).toEqual('tok_visa');
    expect(chargeOptions.amount).toEqual(price * 100);
    expect(chargeOptions.currency).toEqual('usd');
    /*
        //if real api is used
        // Get list of 50 most recent charges from stripe api
        const stripeCharges = await stripe.charges.list({ limit: 50 });
        // with randomly generated amount above
        // check if it exists in the list
        const stripeCharge = stripeCharges.find(charge => {
            return charge.amount === price * 100;
        });
        expect(stripeCharge).toBeDefined();
        expect(stripeCharge!.currenct).toEqual('usd);
        */

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: "1" //stripeCharge!.id
    });

    expect(payment).not.toBeNull();

});


