// API Configuration
const config = {
    STOCKX_API_KEY: 'YOUR_STOCKX_API_KEY',
    STOCKX_API_SECRET: 'YOUR_STOCKX_API_SECRET',
    STRIPE_PUBLIC_KEY: 'YOUR_STRIPE_PUBLIC_KEY',
    STRIPE_SECRET_KEY: 'YOUR_STRIPE_SECRET_KEY',
    NIKE_CLIENT_ID: 'YOUR_NIKE_CLIENT_ID',
    NIKE_CLIENT_SECRET: 'YOUR_NIKE_CLIENT_SECRET',
    ADIDAS_API_KEY: 'YOUR_ADIDAS_API_KEY'
};

// API Endpoints
const endpoints = {
    stockX: {
        search: 'https://api.stockx.com/v2/catalog/products',
        product: 'https://api.stockx.com/v2/catalog/products/',
        market: 'https://api.stockx.com/v2/products/'
    },
    nike: {
        launches: 'https://api.nike.com/launch/entries/v2',
        products: 'https://api.nike.com/product_feed/threads/v2',
        inventory: 'https://api.nike.com/deliver/available_gtins'
    },
    adidas: {
        products: 'https://api.adidas.com/products',
        availability: 'https://api.adidas.com/inventory',
        releases: 'https://api.adidas.com/releases'
    }
};

export { config, endpoints }; 