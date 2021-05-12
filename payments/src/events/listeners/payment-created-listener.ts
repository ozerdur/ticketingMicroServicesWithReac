import { Message } from 'node-nats-streaming';
import { Listener, PaymentCreatedEvent, OrderStatus, Subjects } from '@ozerdurtickets/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        // Find the order 
        const order = await Order.findById(data.orderId);

        // If not ticket, throw error
        if (!order) {
            throw new Error('Order not found');

        }
        // Mark the ticket as being reserved by setting its orderId property
        order.set({ 'status': OrderStatus.Complete });

        // Save the order
        await order.save();

        // ack the message
        msg.ack();

    }
}