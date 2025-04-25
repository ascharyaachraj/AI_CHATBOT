// Remove the API imports since they're not set up
// const { StockXAPI, NikeAPI, AdidasAPI, StripeService } = '../services/api.js';

const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const defaultImage = "https://via.placeholder.com/400"; // Placeholder image URL

let currentSearchPurpose = '';
let shoeList = [];

// Function to add a message to the chat log
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatLog.appendChild(messageDiv);
    chatLog.scrollTop = chatLog.scrollHeight; // Scroll to the bottom
}

// Function to display user message
function displayUserMessage(message) {
    addMessage(message, 'user');
}

// Function to display bot message
function displayBotMessage(message) {
    addMessage(message, 'bot');
}

// Function to show loading indicator
function showLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('loading-indicator');
    loadingDiv.innerHTML = `
        <div class="spinner"></div>
        <p>Searching for sneakers...</p>
    `;
    chatLog.appendChild(loadingDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Function to remove loading indicator
function hideLoading() {
    const loadingIndicator = chatLog.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Function to display sneaker with market data
async function displaySneaker(sneaker) {
    const sneakerDiv = document.createElement('div');
    sneakerDiv.classList.add('sneaker-item');
    const imageSrc = sneaker.image_url || defaultImage;

    // Get market data from StockX
    let marketData = null;
    if (sneaker.stockXId) {
        marketData = await StockXAPI.getProductMarketData(sneaker.stockXId);
    }

    sneakerDiv.innerHTML = `
        <img src="${imageSrc}" alt="${sneaker.model}" class="sneaker-image">
        <h3 class="text-lg font-semibold text-gray-800">${sneaker.model}</h3>
        <p class="text-gray-600">${sneaker.description}</p>
        ${sneaker.speciality ? `<div class="speciality-box"><strong>Speciality:</strong> ${sneaker.speciality}</div>` : ''}
        ${marketData ? `
            <div class="market-data">
                <p><strong>Market Price:</strong> $${marketData.market.lowestAsk}</p>
                <p><strong>Last Sale:</strong> $${marketData.market.lastSale}</p>
            </div>
        ` : ''}
        <div class="button-group">
            <a href="${sneaker.buyLink}" target="_blank" class="buy-now-btn">Buy Now</a>
            ${marketData ? `<button onclick="initiateCheckout('${sneaker.model}', ${marketData.market.lowestAsk})" class="checkout-btn">Quick Checkout</button>` : ''}
        </div>
    `;
    chatLog.appendChild(sneakerDiv);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Function to show new releases
async function showNewReleases() {
    displayBotMessage("🔥 Here are the hottest upcoming releases:");

    const upcomingReleases = [
        {
            name: "Air Jordan 1 High OG 'Metallic Gold'",
            imageUrl: "https://www.superkicks.in/cdn/shop/files/1_3c40b645-5e5c-413b-9d59-5596f4587140.jpg?v=1707209822",
            releaseDate: "May 15, 2025",
            price: 180,
            description: "Classic silhouette with premium metallic gold accents",
            launchLink: "https://www.superkicks.in/products/wmns-air-jordan-1-retro-high-og-white-metallic-gold-gum-light-brown?srsltid=AfmBOook2yjH5srwzPQaF5sy9upz7nueKjfEK3SaZM46ezPFaMXSnFI7"
        },
        {
            name: "Nike Dunk Low 'University Blue'",
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRH6NPbXNk5f3kycntoXzvgk6bhnDIIF6uJng&s",
            releaseDate: "May 20, 2025",
            price: 110,
            description: "Iconic colorway returns with premium materials",
            launchLink: "https://hypefly.co.in/products/nike-dunk-low-university-blue?srsltid=AfmBOor2tEduTTxDe9Bj-SwWXMqgmpczIzueUKK-sXrvK8xxQ7EmH0uW"
        },
        {
            name: "Adidas Yeezy Boost 350 V2 'Slate'",
            imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYTYOnd5FlfYayzxKrCGIzphLBJKYcLfYgAA&s",
            releaseDate: "June 1, 2025",
            price: 230,
            description: "New colorway featuring premium Primeknit upper",
            launchLink: "https://www.culture-circle.com/products/all/yeezy-boost-350-v2-slate?srsltid=AfmBOoo6mmoI1I24241iMhS_ZwyMNoSm1TcCRkIGXAT5MS3oxlAyd3g0hrY"
        }
    ];

    upcomingReleases.forEach(release => {
        const sneaker = {
            model: release.name,
            image_url: release.imageUrl,
            description: `Release Date: ${release.releaseDate}\nPrice: $${release.price}\n${release.description}`,
            speciality: "Upcoming Release 🔥",
            buyLink: release.launchLink
        };
        displaySneaker(sneaker);
    });
}

// Function to initiate checkout using Stripe
async function initiateCheckout(productName, amount) {
    try {
        const paymentIntent = await StripeService.createPaymentIntent(amount * 100); // Convert to cents
        if (paymentIntent && paymentIntent.clientSecret) {
            // Redirect to checkout page or open modal
            window.location.href = `/checkout.html?product=${encodeURIComponent(productName)}&secret=${paymentIntent.clientSecret}`;
        } else {
            displayBotMessage("Sorry, there was an error processing your payment. Please try again later.");
        }
    } catch (error) {
        console.error('Checkout Error:', error);
        displayBotMessage("Sorry, there was an error processing your payment. Please try again later.");
    }
}

// Function to search products using StockX API
async function searchProducts(query) {
    showLoading();
    try {
        const results = await StockXAPI.searchProducts(query);
        hideLoading();
        
        if (results && results.products && results.products.length > 0) {
            displayBotMessage(`Found ${results.products.length} results for "${query}":`);
            results.products.forEach(product => {
                const sneaker = {
                    model: product.name,
                    image_url: product.media.imageUrl,
                    description: product.description,
                    buyLink: product.url,
                    stockXId: product.styleId
                };
                displaySneaker(sneaker);
            });
        } else {
            displayBotMessage("No results found. Try a different search term.");
        }
    } catch (error) {
        console.error('Search Error:', error);
        hideLoading();
        displayBotMessage("Sorry, there was an error searching for products. Please try again later.");
    }
}

// Function to process the user's message
async function processMessage(message) {
    message = message.toLowerCase();

    if (message.includes('upcoming') || message.includes('release') || message.includes('new release') || message.includes('latest')) {
        await showNewReleases();
    } else if (message.includes('search')) {
        const query = message.replace('search', '').trim();
        await searchProducts(query);
    } else if (message.includes('price') || message.includes('market')) {
        const query = message.replace(/(price|market)/g, '').trim();
        await searchProducts(query);
    } else if (message.includes('hi') || message.includes('hello')) {
        displayBotMessage("Hey there! What sneaker information can I help you with today?");
    } else if (message.includes('all') || message.includes('show all') || message.includes('every')) {
        displayBotMessage("Here's our complete collection of shoes across all categories:");
        
        const allShoes = [
            // Casual/Everyday Shoes
            {
                model: "Nike Air Force 1 '07",
                image_url: "https://i.imgur.com/8OXQrpX.jpg",
                description: "Perfect for everyday wear with classic style and comfort.",
                speciality: "Durable construction with comfortable Air cushioning, suitable for all-day wear.",
                category: "Casual/Everyday"
            },
            {
                model: "Adidas Stan Smith",
                image_url: "https://i.imgur.com/JZXqDZc.jpg",
                description: "Timeless design that goes with everything.",
                speciality: "Clean, minimalist design with premium leather upper for all-day comfort.",
                category: "Casual/Everyday"
            },
            {
                model: "New Balance 574",
                image_url: "https://i.imgur.com/L5bHmJm.jpg",
                description: "Classic comfort with modern style.",
                speciality: "ENCAP midsole technology for superior comfort and support.",
                category: "Casual/Everyday"
            },
            // Gym/Training Shoes
            {
                model: "Nike Metcon 8",
                image_url: "https://i.imgur.com/qH9o2lF.jpg",
                description: "Designed for high-intensity training and weightlifting.",
                speciality: "Stable platform for lifting with flexible forefoot for dynamic movements.",
                category: "Gym/Training"
            },
            {
                model: "Reebok Nano X2",
                image_url: "https://i.imgur.com/YwK9lXx.jpg",
                description: "Versatile training shoe for all types of workouts.",
                speciality: "Excellent stability and support for cross-training and weightlifting.",
                category: "Gym/Training"
            },
            {
                model: "Under Armour Project Rock 5",
                image_url: "https://i.imgur.com/DcGtVxk.jpg",
                description: "Built for intense training sessions.",
                speciality: "HOVR cushioning with UA TriBase technology for stability.",
                category: "Gym/Training"
            },
            // Hiking Shoes
            {
                model: "Merrell Moab 3",
                image_url: "https://i.imgur.com/K8nVBh3.jpg",
                description: "Durable and comfortable for all types of trails.",
                speciality: "Waterproof construction with excellent grip and ankle support.",
                category: "Hiking"
            },
            {
                model: "Salomon X Ultra 4",
                image_url: "https://i.imgur.com/P9XqvzR.jpg",
                description: "Lightweight yet supportive for long hikes.",
                speciality: "Advanced grip technology with quick-lace system for easy adjustment.",
                category: "Hiking"
            },
            {
                model: "Columbia Redmond",
                image_url: "https://i.imgur.com/mW9fkc2.jpg",
                description: "Great all-around hiking shoe for various terrains.",
                speciality: "Techlite midsole for superior cushioning and energy return.",
                category: "Hiking"
            },
            // Running Shoes
            {
                model: "Nike React Infinity Run Flyknit 3",
                image_url: "https://i.imgur.com/NxHFPYs.jpg",
                description: "Premium running shoe with maximum cushioning.",
                speciality: "Designed to reduce injury with stable platform and responsive cushioning.",
                category: "Running"
            },
            {
                model: "Adidas Ultraboost 22",
                image_url: "https://i.imgur.com/ZcPPxqL.jpg",
                description: "Responsive running shoe with energy return.",
                speciality: "Boost technology for maximum energy return and Primeknit upper for comfort.",
                category: "Running"
            },
            {
                model: "Asics Gel-Kayano 29",
                image_url: "https://i.imgur.com/Q2YThG8.jpg",
                description: "Premium stability running shoe.",
                speciality: "GEL technology cushioning with Dynamic DuoMax support system.",
                category: "Running"
            }
        ];

        // Display category headers and shoes
        let currentCategory = "";
        allShoes.forEach(shoe => {
            if (currentCategory !== shoe.category) {
                currentCategory = shoe.category;
                displayBotMessage(`\n📍 ${currentCategory} Shoes:`);
            }
            displaySneaker(shoe);
        });
    } else if (message.includes('nike')) {
        displayBotMessage("Okay, here are some Nike sneakers:");
         shoeList = [
            {
                model: "Nike Air Max 90",
                image_url: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/d785176e-fe8a-4caa-86d3-568be52e1725/NIKE+AIR+MAX+90+NN+GS.png",
                description: "Iconic design with excellent cushioning.",
                speciality: "Features a retro design with visible Air cushioning."
            },
            {
                model: "Nike Air Force 1 '07",
                image_url: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/014735cf-8892-4577-b956-2555525f8953/air-force-1-07-mens-shoes-WDp7v6.png",
                description: "The legend lives on in the Nike Air Force 1 '07—a low-cut take on the iconic AF1 that blends classic court style with incredible comfort.",
                speciality: "Classic silhouette with durable construction and comfortable Air cushioning."
            },
            {
                model: "Nike React Infinity Run Flyknit 3",
                image_url: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/f3b2b555-8519-4598-9577-011805747765/react-infinity-run-flyknit-3-road-running-shoes-FbT9jF.png",
                description: "A premium shoe with our highest level of support and cushioning. Its smooth, stable ride carries you through long and short runs.",
                speciality: "Designed to reduce injury and keep you running with a stable platform and responsive cushioning."
            },
        ];
        shoeList.forEach(shoe => displaySneaker(shoe));
    } else if (message.includes('adidas')) {
        displayBotMessage("Okay, here are some Adidas sneakers:");
        shoeList = [
            {
                model: "Adidas Ultraboost 22",
                image_url: "https://cdn.pixabay.com/photo/2021/08/11/17/23/sneakers-6538735_1280.jpg",
                description: "Responsive running shoe with a comfortable fit.",
                speciality: "Known for its energy return with Boost technology and aPrimeknit upper for a sock-like fit."
            },
            {
                model: "Adidas Stan Smith",
                image_url: "https://cdn.pixabay.com/photo/2017/04/01/17/15/woman-2194356_640.jpg",
                description: "Classic, iconic style.",
                speciality: "Clean, minimalist design that has become a style staple."
            },
            {
                model: "Adidas NMD",
                image_url: "https://cdn.pixabay.com/photo/2018/03/30/11/17/woman-3275883_640.jpg",
                description: "Stylish and comfortable for everyday wear.",
                speciality: "Combines a stylish silhouette with a comfortable Boost midsole."
            },
        ];
        shoeList.forEach(shoe => displaySneaker(shoe));
    } else if (message.includes('day to day') || message.includes('daily life') || 
               message.includes('everyday') || message.includes('casual')) {
        currentSearchPurpose = 'day-to-day';
        displayBotMessage("Great! I can help you find the perfect everyday sneakers. What's your preferred price range? (e.g., Rs. 2000-10000)");
    } else if (message.includes('gym') || message.includes('workout') || 
               message.includes('training') || message.includes('exercise')) {
        currentSearchPurpose = 'gym';
        displayBotMessage("Great! I can help you find the perfect gym shoes. What's your preferred price range? (e.g., Rs. 2000-10000)");
    } else if (message.includes('hiking') || message.includes('trekking') || 
               message.includes('outdoor') || message.includes('trail')) {
        currentSearchPurpose = 'hiking';
        displayBotMessage("Great! I can help you find the perfect hiking shoes. What's your preferred price range? (e.g., Rs. 2000-10000)");
    } else if (message.includes('running') || message.includes('jogging') || 
               message.includes('marathon') || message.includes('sprint')) {
        currentSearchPurpose = 'running';
        displayBotMessage("Great! I can help you find the perfect running shoes. What's your preferred price range? (e.g., Rs. 2000-10000)");
    } else if (currentSearchPurpose && (message.includes('rs.') || message.includes('rupees') || 
               message.includes('price') || message.includes('budget') || !isNaN(message.trim()))) {
        // Extract price - either from numeric input or from text containing numbers
        let price;
        if (!isNaN(message.trim())) {
            price = parseInt(message.trim());
        } else {
            price = parseInt(message.replace(/[^0-9]/g, ''), 10);
        }
        
        if (isNaN(price)) {
            displayBotMessage("Sorry, I couldn't understand the price. Please provide a valid price range (e.g., Rs. 2000-10000 or just enter a number like 5000).");
            return;
        }
        
        if (price < 2000) {
            displayBotMessage("I apologize, but I don't have any shoes available below Rs. 2000. Please try a higher price range (e.g., Rs. 2000-10000).");
            return;
        }
        
        filterAndDisplayShoes(price);
        currentSearchPurpose = ''; // Reset
    } else {
        displayBotMessage("I can help you with:\n" +
                         "- New sneaker releases\n" +
                         "- Day to day / casual wear\n" +
                         "- Gym / workout shoes\n" +
                         "- Hiking / outdoor shoes\n" +
                         "- Running / jogging shoes\n" +
                         "Or ask about specific brands like Nike or Adidas!");
    }
}

function filterAndDisplayShoes(price) {
    let filteredShoes = [];
    let message = "";

    if (currentSearchPurpose === 'day-to-day') {
        message = `Here are the best everyday sneakers in your price range (Rs. ${price} and below):`;
        filteredShoes = [
            {
                model: "Nike Air Force 1 '07",
                image_url: "https://static.nike.com/a/images/t_default/20547d52-3e1b-4c3d-b917-f0d7e0eb8bdf/custom-nike-air-force-1-low-by-you-shoes.png",
                description: "Perfect for everyday wear with classic style and comfort.",
                speciality: "Durable construction with comfortable Air cushioning, suitable for all-day wear.",
                buyLink: "https://www.nike.com/in/t/air-force-1-07-shoes/CW2288-111"
            },
            {
                model: "Adidas Stan Smith",
                image_url: "https://assets.adidas.com/images/w_600,f_auto,q_auto/b47d77aff0224eada5b6af1401395d20_9366/Stan_Smith_Shoes_White_FX5502_01_standard.jpg",
                description: "Timeless design that goes with everything.",
                speciality: "Clean, minimalist design with premium leather upper for all-day comfort.",
                buyLink: "https://www.adidas.co.in/stan-smith-shoes/FX5502.html"
            },
            {
                model: "New Balance 574",
                image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdO9I802FrT0qrYHaxUtrVEQU-mwIc7d6cYw&s",
                description: "Classic comfort with modern style.",
                speciality: "ENCAP midsole technology for superior comfort and support.",
                buyLink: "https://www.newbalance.in/574-classic/ML574EVG.html"
            }
        ];
    } else if (currentSearchPurpose === 'gym') {
        message = `Here are the best gym shoes in your price range (Rs. ${price} and below):`;
        filteredShoes = [
            {
                model: "Nike Metcon 8",
                image_url: "https://m.media-amazon.com/images/I/71rQVEuYFfL._AC_UY1000_.jpg",
                description: "Designed for high-intensity training and weightlifting.",
                speciality: "Stable platform for lifting with flexible forefoot for dynamic movements.",
                buyLink: "https://www.nike.com/in/t/metcon-8-training-shoes/DO9388-010"
            },
            {
                model: "Reebok Nano X2",
                image_url: "https://imagescdn.reebok.in/img/app/product/7/767299-8814703.jpg?auto=format&w=390",
                description: "Versatile training shoe for all types of workouts.",
                speciality: "Excellent stability and support for cross-training and weightlifting.",
                buyLink: "https://shop4reebok.com/collections/training/products/reebok-nano-x2-shoes-GW8467"
            },
            {
                model: "Under Armour Project Rock 5",
                image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHJzzEvPKXSINOPIxS8Oolr0xOM_nw8DfClQ&s",
                description: "Built for intense training sessions.",
                speciality: "HOVR cushioning with UA TriBase technology for stability.",
                buyLink: "https://www.underarmour.com/en-us/p/training/project_rock_5_training_shoes/3025052.html"
            }
        ];
    } else if (currentSearchPurpose === 'hiking') {
        message = `Here are the best hiking shoes in your price range (Rs. ${price} and below):`;
        filteredShoes = [
            {
                model: "Merrell Moab 3",
                image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbk35rNTJ_xTSWEZbA--eZVsy2B7sHNyX4Hg&s",
                description: "Durable and comfortable for all types of trails.",
                speciality: "Waterproof construction with excellent grip and ankle support.",
                buyLink: "https://www.merrell.com/US/en/moab-3-waterproof/195018395825.html"
            },
            {
                model: "Salomon X Ultra 4",
                image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTin0KX5PuiNmnjtdtXWGkI5BLE0qFjoUJyog&s",
                description: "Lightweight yet supportive for long hikes.",
                speciality: "Advanced grip technology with quick-lace system for easy adjustment.",
                buyLink: "https://www.salomon.com/en-us/shop/product/x-ultra-4-gore-tex.html"
            },
            {
                model: "Columbia Redmond",
                image_url: "https://m.media-amazon.com/images/I/61zFODoJ0KS._AC_UY1000_.jpg",
                description: "Great all-around hiking shoe for various terrains.",
                speciality: "Techlite midsole for superior cushioning and energy return.",
                buyLink: "https://www.columbia.com/p/mens-redmond-iii-waterproof-hiking-shoe-1865091.html"
            }
        ];
    } else if (currentSearchPurpose === 'running') {
        message = `Here are the best running shoes in your price range (Rs. ${price} and below):`;
        filteredShoes = [
            {
                model: "Nike React Infinity Run Flyknit 3",
                image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ90peuT-lmD-9pfnNdHCa3sR2Rlx_NFa-GYQ&s",
                description: "Premium running shoe with maximum cushioning.",
                speciality: "Designed to reduce injury with stable platform and responsive cushioning.",
                buyLink: "https://www.nike.com/in/t/react-infinity-3-road-running-shoes/DR2665-001"
            },
            {
                model: "Adidas Ultraboost 22",
                image_url: "https://assets.ajio.com/medias/sys_master/root/20221228/S8IJ/63ac6eaeaeb269659c13c725/-473Wx593H-469329245-black-MODEL.jpg",
                description: "Responsive running shoe with energy return.",
                speciality: "Boost technology for maximum energy return and Primeknit upper for comfort.",
                buyLink: "https://www.adidas.co.in/ultraboost-22-shoes/GX5461.html"
            },
            {
                model: "Asics Gel-Kayano 29",
                image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEg-8zZ7e1QttIYoF3jPYjQhNDBB0OhSECvw&s",
                description: "Premium stability running shoe.",
                speciality: "GEL technology cushioning with Dynamic DuoMax support system.",
                buyLink: "https://www.asics.com/us/en-us/gel-kayano-29/p/1011B405-001.html"
            }
        ];
    }

    if (filteredShoes.length > 0) {
        displayBotMessage(message);
        filteredShoes.forEach(shoe => displaySneaker(shoe));
    } else {
        displayBotMessage("Sorry, I couldn't find any shoes matching your criteria. Try adjusting your price range or purpose.");
    }
}

// DOM Elements and Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const chatLog = document.getElementById('chat-log');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    if (!chatLog || !userInput || !sendButton) {
        console.error('Required elements not found!');
        return;
    }

    // Welcome message
    displayBotMessage("👋 Hi! I'm your sneaker assistant. How can I help you today?\nYou can ask about:\n- New releases\n- Specific brands like Nike or Adidas\n- Different types of shoes (running, gym, hiking, casual)\n- Or type 'show all' to see our complete collection!");

    // Handle sending messages
    function handleMessage() {
        const message = userInput.value.trim();
        if (message) {
            displayUserMessage(message);
            userInput.value = '';
            processMessage(message);
        }
    }

    // Add event listeners
    sendButton.addEventListener('click', handleMessage);
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleMessage();
        }
    });
});

// Add CSS styles
const style = document.createElement('style');
style.textContent = `
    .loading-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        gap: 10px;
    }
    .spinner {
        width: 30px;
        height: 30px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #ff4b4b;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .market-data {
        background: #f8f8f8;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
    }
    .button-group {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    .checkout-btn {
        background-color: #4CAF50;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        transition: background-color 0.3s;
    }
    .checkout-btn:hover {
        background-color: #45a049;
    }
`;
document.head.appendChild(style); 