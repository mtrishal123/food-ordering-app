# Food Ordering App - Project Documentation

## Live Deployment
🌐 **URL**: https://onlineorderfood.netlify.app/

## GitHub Repository
📦 **Repo**: https://github.com/mtrishal123/food-ordering-app

## Lighthouse Scores
- **Performance**: 75/100
- **Accessibility**: 94/100
- **Best Practices**: 100/100
- **SEO**: 100/100 



### API Integration (20 points) 
- **API Used**: TheMealDB API (https://www.themealdb.com/api.php)
- **Why chosen**: Free tier with unlimited requests, real food data with images
- **Alternative considered**: Spoonacular (limited free tier), Yelp (requires approval)
- **Endpoints used**:
  - `GET /search.php?s={query}` - Search meals by name
  - `GET /filter.php?a={cuisine}` - Filter meals by cuisine type
  - `GET /lookup.php?i={id}` - Get detailed meal information
  - `GET /categories.php` - List all meal categories

**Business Objects**:
1. **Restaurants** (26 different cuisines)
2. **Menu Items** (meals from API)
3. **Users** (authentication system)
4. **Orders** (order history)

**Use Cases**:
1. **Browse and order food**: Search restaurants, filter by cuisine/rating, view menus, add to cart, checkout
2. **User account management**: Signup, login, logout, view order history


**Technique 1: Custom React Hook - useLocalStorage**
- **Location**: `src/hooks/useLocalStorage.js`
- **Purpose**: Automatically synchronize React state with browser localStorage
- **Usage**: Cart persistence, user authentication
- **Benefits**: Data survives page refreshes, automatic sync, reusable across components

**Technique 2: Context API + Custom Hooks**
- **Locations**: 
  - `src/context/AuthContext.jsx` + `src/hooks/useAuth.js`
  - `src/context/CartContext.jsx` with `useCart()` hook
- **Purpose**: Global state management for authentication and shopping cart
- **Benefits**: Eliminates prop drilling, centralizes business logic, clean component code

Both techniques were not covered in class and demonstrate advanced React patterns.

## Technical Stack
- React 19.2.1
- React Router DOM 7.1.1
- React Helmet Async 2.0.5
- TheMealDB API
- CSS3 (custom styling)
- Netlify (deployment)

## Key Features
- 26+ restaurants across different cuisines
- Real-time search and filtering
- Persistent shopping cart (localStorage)
- User authentication system
- Complete checkout flow
- Order history tracking
- Responsive design (mobile/tablet/desktop)
- Protected routes for authenticated users


## Team Members
- Trishal Varma Mudunuri
- Hanlin Cheng
- Shuhao Hu

## Deployment
Deployed on Netlify with automatic builds from GitHub main branch.