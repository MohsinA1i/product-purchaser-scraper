import Shopify from './bot/shopify/shopify';

const options = {
    contact: {
        email: 'hevofis505@jah8.com',
        phone: '406-582-6088',
        firstName: 'Donald',
        lastName: 'Boyd',
        company: 'That Great Company',
        address1: '4379',
        address2: 'Masonic Drive',
        city: 'Bozeman',
        country: 'United States',
        state: 'Montana',
        zip: '59715',
    },
    card: {
        number: '5167070637095077',
        name: 'Donald Boyd',
        expiry: '12/21',
        cvv: '095'
    },
    account: {
        email: 'hevofis505@jah8.com',
        password: 'password'
    },
    product: {
        url: 'https://bringtheheatbots.com/',
        //size: '3',
        keywords: '*'
    },
    delay: 2000,
    //proxy: 'http://crep_a42:4NUPeFkY578nhr6@154.12.131.42:4042'
};

async function main() {
    const shopify = new Shopify(options);
    shopify.launch();
    shopify.onActionRequired = async (action, info) => {
        if (action == 'password') {
            shopify.setOptions({ password: 'Alpha' });
        }
    };
}
main();
