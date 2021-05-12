import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ExpirationCompleteEvent, BadRequestError, OrderStatus } from "@ozerdurtickets/common";
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

export class ExpirationCompleteistener extends Listener<ExpirationCompleteEvent>{
    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const { orderId } = data;

        const order = await Order.findById(orderId).populate('ticket');

        if (!order) {
            throw new BadRequestError('Order not found');
        }

        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
        });

        await order.save();

        // Publish an event saying that an order was cancelled
        await new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        msg.ack();
    }
}