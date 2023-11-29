const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

/* const storeItems = new Map([
  [1, { priceInCents: 10000, name: "Learn React Today" }],
  [2, { priceInCents: 20000, name: "Learn CSS Today" }],
]); */

const storeItems = new Map([
  [
    0,
    {
      name: "stúdio com personal",
      priceInCents: "35000",
      isChecked: false,
      quantity: 1,
    },
  ],
  [
    1,
    {
      name: "stúdio sem personal",
      priceInCents: "25000",
      isChecked: false,
      quantity: 1,
    },
  ],

  [
    2,
    {
      name: "academia 3 vezes/semana",
      priceInCents: "15000",
      isChecked: false,
      quantity: 1,
    },
  ],
  [
    3,
    {
      name: "academia ilimitado",
      priceInCents: "20000",
      isChecked: false,
      quantity: 1,
    },
  ],
]);

module.exports.checkout = async function (req, res) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: req.body.bodyParams.userEmail,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: req.body.bodyParams.items.map((item) => {
        const storeItem = storeItems.get(item.id);
        return {
          price_data: {
            currency: "brl",
            product_data: {
              name: storeItem.name,
            },
            unit_amount: storeItem.priceInCents,
          },
          quantity: storeItem.quantity,
        };
      }),
      success_url: `${process.env.SERVER_URL}/success/`,
      cancel_url: `${process.env.SERVER_URL}/cancel/`,
    });
    res.json({ url: session.url, status: session.payment_status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
