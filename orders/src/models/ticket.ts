import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order, OrderStatus } from "./order";

// An interface that describes the properties
// that are required to create a new ticket

interface TicketAttrs {
    id: string;
    title: string;
    price: number;
}

// An interface that describes the properties
// that a ticket Document has
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    isReserved(): Promise<boolean>;
}


// An interface that describes the properties
// that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
    findByEvent(event: { id: string, version: number }): Promise<TicketDoc> | null;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String, // since we are referring to built in String we are using capital S
        required: true
    },

    price: {
        type: Number,// since we are referring to built in Number we are using capital N
        required: true
    },
},
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    });

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

/*
//  versioning without update-if-current
ticketSchema.pre('save', function (done) {
    // @ts-ignore
    this.$where = {
        version: this.get('version') - 100 // assume version is incremented by 100 in master service
    };
    done();
});
*/

ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price
    });
};


// Run query to look at all orders. Find an order wher the ticket
// is the ticket we just found *and* the orders status is  *not* cancelled.
// if we find an order from that means the ticket  *is* reserverd

ticketSchema.methods.isReserved = async function () {
    //this === the ticket document that we just called 'isReserved' on
    const existingOrder = await Order.findOne({
        ticket: this.id,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete,
            ]
        }
    });

    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };