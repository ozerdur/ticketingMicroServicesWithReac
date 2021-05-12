import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// An interface that describes the properties
// that are required to create a new payment

interface PaymentAttrs {
    orderId: string;
    stripeId: string;
}

// An interface that describes the properties
// that a payment Document has
interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
    version: number;
}

// An interface that describes the properties
// that a payment model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,// since we are referring to built in String we are using capital S
        required: true
    },

    stripeId: {
        type: String,// since we are referring to built in String we are using capital S
        required: true
    }
},
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    });

paymentSchema.set('versionKey', 'version');
paymentSchema.plugin(updateIfCurrentPlugin);


paymentSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Payment.findOne({
        _id: event.id,
        version: event.version - 1
    });
};


paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };
