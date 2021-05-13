import { Router } from "next/router";
import { useEffect } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);
    return () => {
      // will be called if we navigate away or the page is rerendered
      clearInterval(timerId);
    };
  }, []);
  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51IqcSCHl01mLPrfdZtPyFTIh2ZWd2tBc7Ul056A6jzl5PIjJYmTrKD1pKJLTFw6Xk31UEMtlN63yOnDcaJGjerlC00JgK0ISbM"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

TicketShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};
export default OrderShow;
