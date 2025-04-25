import { config, endpoints } from '../config.js';

// StockX API Service
class StockXAPI {
    static async searchProducts(query) {
        try {
            const response = await fetch(endpoints.stockX.search + `?query=${query}`, {
                headers: {
                    'x-api-key': config.STOCKX_API_KEY,
                    'Authorization': `Bearer ${config.STOCKX_API_SECRET}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('StockX API Error:', error);
            return null;
        }
    }

    static async getProductMarketData(productId) {
        try {
            const response = await fetch(endpoints.stockX.market + productId, {
                headers: {
                    'x-api-key': config.STOCKX_API_KEY,
                    'Authorization': `Bearer ${config.STOCKX_API_SECRET}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('StockX Market Data Error:', error);
            return null;
        }
    }
}

// Nike API Service
class NikeAPI {
    static async getUpcomingReleases() {
        try {
            const response = await fetch(endpoints.nike.launches, {
                headers: {
                    'client_id': config.NIKE_CLIENT_ID,
                    'client_secret': config.NIKE_CLIENT_SECRET
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Nike API Error:', error);
            return null;
        }
    }

    static async getProductDetails(productId) {
        try {
            const response = await fetch(`${endpoints.nike.products}/${productId}`, {
                headers: {
                    'client_id': config.NIKE_CLIENT_ID,
                    'client_secret': config.NIKE_CLIENT_SECRET
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Nike Product API Error:', error);
            return null;
        }
    }
}

// Adidas API Service
class AdidasAPI {
    static async getProducts(query) {
        try {
            const response = await fetch(`${endpoints.adidas.products}?query=${query}`, {
                headers: {
                    'Authorization': `Bearer ${config.ADIDAS_API_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Adidas API Error:', error);
            return null;
        }
    }

    static async getUpcomingReleases() {
        try {
            const response = await fetch(endpoints.adidas.releases, {
                headers: {
                    'Authorization': `Bearer ${config.ADIDAS_API_KEY}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Adidas Releases API Error:', error);
            return null;
        }
    }
}

// Stripe Payment Service
class StripeService {
    static async createPaymentIntent(amount, currency = 'usd') {
        try {
            const response = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount,
                    currency
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Stripe Payment Error:', error);
            return null;
        }
    }
}

export { StockXAPI, NikeAPI, AdidasAPI, StripeService }; 