# Uncle's Coffee

Customer-facing cafe website for Uncle's Coffee. Guests can start a dine-in order, browse and customize menu items, pay for an order, track orders, and reserve and manage tables.

## Features

- **Dine-in ordering:** Select an active table, enter guest details, browse the live menu, customize items, and submit an order.
- **Menu discovery:** Browse available items by category, search, and dietary filters; view item details and available options.
- **Cart and checkout:** Update quantities and special instructions, review charges, and pay online through Razorpay or select payment at the counter.
- **Table reservations:** Choose a date, time, party size, and available table. Table-specific booking fees are shown before checkout.
- **Reservation payments:** Pay a booking fee online through Razorpay, or submit a request to pay at the cafe counter. Online reservations are confirmed after the backend verifies the payment. Cash/counter reservation status is determined by the backend.
- **Order and reservation management:** View order progress and order history; look up, track, modify, or cancel reservations.
- **English and Hindi:** A language selector uses shared translation dictionaries.
- **Responsive interface:** React components and Tailwind CSS support desktop and mobile layouts.

## Technology

- React 18
- Vite 5
- React Router 6
- Tailwind CSS 3
- Razorpay Checkout.js (loaded when an online payment is initiated)
- REST API backend for menus, tables, orders, reservations, and payment operations

## Requirements

- Node.js 18 or later and npm
- The cafe API backend running and reachable from the browser
- A Razorpay-enabled backend for online payments

## Run locally

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create a local environment file named `.env.local` in the project root and set the API base URL:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:5000
   ```

   Use the base URL of your own backend. `VITE_API_BASE_URL` is a URL, not a credential. Do not put secret keys, passwords, tokens, or other credentials in frontend environment variables or commit them to the repository.

3. Start the frontend:

   ```sh
   npm run dev
   ```

   Vite serves the app at `http://localhost:5174` by default.

4. Build and preview a production bundle:

   ```sh
   npm run build
   npm run preview
   ```

The browser must be able to reach the configured API host. The backend must allow the frontend origin through its CORS configuration. The Vite development proxy in `vite.config.js` targets `http://localhost:5001`; the app's API service uses `VITE_API_BASE_URL` for API requests, so configure that variable to match the backend actually in use.

## Routes

| Path | Page | Purpose |
| --- | --- | --- |
| `/` | Welcome | Start a dine-in order by selecting a table and entering guest details |
| `/menu` | Menu | Browse and customize available food and drinks |
| `/cart` | Cart | Review a dine-in cart and complete order checkout |
| `/tracking` | Order Tracking | View the status of an order |
| `/myorders` | My Orders | Look up order history by mobile number |
| `/bookings` | Bookings | Start a table reservation or open a saved booking |
| `/bookings/tables` | Tables Availability | Search tables and check availability for a selected date and time |
| `/bookings/details` | Booking Details | Enter guest details, select payment, and submit a reservation |
| `/bookings/tracking` | Booking Tracking | Look up reservation status and history, or manage a reservation |

## Backend API

The frontend expects JSON API responses and uses the configured `VITE_API_BASE_URL` as the base URL. Most responses are expected to include a `success` boolean; error messages are read from `message` where available.

### Tables and menu

| Method | Endpoint | Use |
| --- | --- | --- |
| `GET` | `/api/tables/all` | Load the table catalog and active dine-in tables |
| `GET` | `/api/tables/availability?date=...&time=...&guests=...` | Check reservation availability |
| `GET` | `/api/tables` | Search/filter tables; the frontend may send `capacity`, `search` (or selected search field), and `location` |
| `GET` | `/api/menu?available=true` | Load available menu items; the menu page can also send `category` and `search` |
| `GET` | `/api/menu/file/:fileId` | Load a menu image by file ID |
| `GET` | `/api/tables/file/:fileId` | Load a table image by file ID |

### Dine-in orders

| Method | Endpoint | Use |
| --- | --- | --- |
| `POST` | `/api/orders/cart/init` | Start a cart with table, customer, guest count, and kitchen note |
| `GET` | `/api/orders/cart/:cartId` | Load an existing cart/order draft |
| `POST` | `/api/orders/cart/:cartId/items` | Add an item |
| `PATCH` | `/api/orders/cart/:cartId/items/:menuItemId` | Update item quantity/options/note |
| `DELETE` | `/api/orders/cart/:cartId/items/:menuItemId` | Remove an item |
| `POST` | `/api/orders/cart/:cartId/checkout` | Submit the cart for checkout |
| `POST` | `/api/payments/counter` | Record a dine-in order's counter-payment selection |
| `POST` | `/api/payments/create-order` | Create an online payment order |
| `POST` | `/api/payments/verify` | Verify an online order payment |
| `GET` | `/api/orders/:orderId` | Load an order for tracking |
| `GET` | `/api/orders/history?mobile=...` | Load order history for a mobile number |

### Reservations and booking payments

| Method | Endpoint | Use |
| --- | --- | --- |
| `POST` | `/api/reservations` | Create a reservation |
| `POST` | `/api/reservations/:bookingId/create-payment` | Create a Razorpay order for a reservation fee |
| `POST` | `/api/reservations/:bookingId/verify-payment` | Verify payment and confirm the reservation |
| `POST` | `/api/reservations/:bookingId/counter-payment` | Record a request to pay the reservation fee at the counter |
| `GET` | `/api/reservations/history?mobile=...` | Load reservation history |
| `PATCH` | `/api/reservations/:bookingId/cancel` | Cancel a reservation |
| `GET` | `/api/reservations/file/:fileId` | Load a reservation image by file ID |

Reservation creation sends customer details and reservation date, time, guest count, and table ID, plus the booking fee and a `requirePayment` flag. The booking fee is sent in rupees. For online payments, the API returns the Razorpay order details; the browser opens Razorpay Checkout and posts its response to the reservation verification endpoint. Payment verification and reservation state changes must be performed by the backend, not trusted to the browser.

For a fee-free reservation, the frontend does not open a payment flow. For a paid reservation, the response from the backend determines whether the reservation is confirmed or remains pending. A counter-payment selection calls the counter endpoint; it should not be represented as an online payment.

### API and payment security

- Keep Razorpay secret keys, signing secrets, database credentials, and API tokens on the backend only.
- Do not add credentials to `VITE_*` variables: Vite embeds those variables into client-side assets.
- The frontend expects public Razorpay checkout order information from the API, including a public key ID, amount, currency, and order ID. The backend must create orders and verify signatures securely.
- Use HTTPS for deployed frontend and API traffic. Configure allowed origins on the backend rather than disabling CORS.

## Application structure

```text
src/
  App.jsx                    Routes and language provider
  main.jsx                   React application entry point
  index.css                  Global styles and Tailwind directives
  components/
    FoodDetailModal.jsx      Menu-item customization/details
    LanguageSelector.jsx     Language selection UI
    Navbar.jsx               Navigation and dine-in context
  context/
    LanguageContext.jsx      English/Hindi language state
  locales/
    en.js                    English interface strings
    hi.js                    Hindi interface strings
  pages/
    Welcome.jsx              Dine-in setup
    Menu.jsx                 Menu browse and item selection
    Cart.jsx                 Order cart and checkout
    OrderTracking.jsx        Live order view
    MyOrders.jsx             Order history
    Bookings.jsx             Reservation start/existing booking
    TablesAvailability.jsx   Reservation table selection
    BookingDetails.jsx       Reservation submission and payment
    BookingTracking.jsx      Reservation tracking and management
  services/
    orderApi.js              Shared order API and browser-storage helpers
```

Static site assets are under `public/`. Vercel is configured with a single-page application rewrite so client-side routes resolve to the React app.

## Browser storage

The site uses `localStorage` to retain the selected language and make an in-progress dine-in order or reservation available across pages. Keys currently include:

- `cafe-language`
- `uncleCoffeeDineIn`
- `uncleCoffeeCart`
- `uncleCoffeeCartOrderId`
- `uncleCoffeeCurrentOrder`
- `uncleCoffeeOrderId`
- `uncleCoffeeBusinessOrderId`
- `uncleCoffeeOrderMobile`
- `uncleCoffeeBooking`

Avoid using personal data on shared devices. Clearing the browser's site data removes these locally saved details; backend order and reservation records are managed separately.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Serve the production build locally |

