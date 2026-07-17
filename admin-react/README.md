# Admin Management Panel

Complete admin management dashboard for SportShop built with React and Vite.

## Features

### ✅ Authentication
- Admin login with email and password
- Session management with localStorage
- Auto-logout support

### ✅ Dashboard
- Overview statistics (Products, Categories, Brands, Orders)
- Quick access to all management sections

### ✅ Product Management
- View all products
- Create new products
- Edit existing products
- Delete products
- Product attributes: name, slug, price, category, status

### ✅ Category Management
- View all categories
- Create new categories
- Edit categories
- Delete categories

### ✅ Brand Management
- View all brands
- Create new brands
- Edit brands
- Delete brands

### ✅ Order Management
- View all orders
- Update order status
- Track orders
- Delete orders

## Setup & Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Backend Setup
The backend is already configured with:
- Spring Boot 3.5.6
- Java 21
- PostgreSQL/MySQL database
- CORS enabled for localhost:3000

Run backend on `http://localhost:8080`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd admin-react
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```
   Access at `http://localhost:5173`

3. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
admin-react/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Dashboard.jsx      # Dashboard with stats
│   │   ├── Products.jsx       # Products management
│   │   ├── Categories.jsx     # Categories management
│   │   ├── Brands.jsx         # Brands management
│   │   └── Orders.jsx         # Orders management
│   ├── components/
│   │   └── Sidebar.jsx        # Navigation sidebar
│   ├── services/
│   │   └── api.js             # API calls & axios config
│   ├── App.jsx                # Main app with routing
│   ├── styles.css             # Global styles
│   └── main.jsx               # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login

### Products
- `GET /api/admin/products` - Get all products
- `GET /api/admin/products/:id` - Get product by ID
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Categories
- `GET /api/admin/categories` - Get all categories
- `GET /api/admin/categories/:id` - Get category by ID
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Brands
- `GET /api/admin/brands` - Get all brands
- `GET /api/admin/brands/:id` - Get brand by ID
- `POST /api/admin/brands` - Create brand
- `PUT /api/admin/brands/:id` - Update brand
- `DELETE /api/admin/brands/:id` - Delete brand

### Orders
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order by ID
- `PUT /api/admin/orders/:id/status` - Update order status
- `DELETE /api/admin/orders/:id` - Delete order

## Features Included

### Product Management
- Add products with full details (name, price, description, etc.)
- Associate products with categories
- Set discount prices
- Mark as featured or new arrival
- Track sold count and view count

### Category Management
- Create/edit/delete categories
- Add category descriptions and images
- Activate/deactivate categories

### Brand Management
- Manage brands with logos
- Add brand descriptions
- Control brand visibility

### Order Management
- View all orders with details
- Update order status (pending, confirmed, shipping, delivered, cancelled)
- Delete orders
- View receiver information

### UI/UX Features
- Responsive design (mobile, tablet, desktop)
- Modern gradient sidebar
- Clean data tables
- Form validation
- Success/error notifications
- Loading states
- Confirmation dialogs for deletions

## Technologies Used

- **Frontend:** React 18, React Router 6
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Styling:** Custom CSS with CSS variables
- **Backend:** Spring Boot 3.5.6, Java 21

## Styling

The application uses a modern design system with:
- Blue gradient sidebar (#667eea to #764ba2)
- Professional color scheme
- Responsive grid layouts
- Smooth animations and transitions
- Mobile-first responsive design

## Security Notes

- Store admin token in localStorage
- Implement proper authentication on backend
- Add JWT token validation
- Use HTTPS in production
- Validate all inputs on server side

## Future Enhancements

- User management
- Inventory management
- Analytics dashboard
- Bulk operations
- Advanced filtering and search
- Export to CSV/Excel
- Dark mode toggle

## Troubleshooting

### CORS Error
Make sure backend has CORS enabled for http://localhost:3000

### API Connection Failed
Check if backend is running on http://localhost:8080

### Login Not Working
Verify admin credentials in database and backend validation

## License

Property of SportShop
