import mongoose from "mongoose";

// An interface that describes the properties
// that are required to create a new ticket

interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

// An interface that describes the properties
// that a ticket model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

// An interface that describes the properties
// that a ticket Document has
interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
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
    userId: {
        type: String,
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
/*
ticketSchema.pre('save', async function (done) {
    
    if (this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
    }
    done();
});
*/

ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };