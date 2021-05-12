import { Message } from 'node-nats-streaming';
import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from '@ozerdurtickets/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Find the order 
        const order = await Order.findByEvent(data);
        // If not ticket, throw error
        if (!order) {
            throw new Error('Order not found');

        }
        // Mark the ticket as being reserved by setting its orderId property
        order.set({ 'status': OrderStatus.Cancelled });

        // Save the order
        await order.save();

        // ack the message
        msg.ack();

    }
}