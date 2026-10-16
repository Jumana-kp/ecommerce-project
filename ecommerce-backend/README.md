\# E-commerce Backend API\
\
A full-stack e-commerce application backend built with Django REST Framework and PostgreSQL. It provides APIs for user authentication, product browsing, shopping cart management, and order processing.\
\
\## Features\
\
\- User registration and login with JWT authentication\
\- Custom user model and role-based access\
\- Product listing and product details\
\- Product categories, types, variants, sizes, colors, and images\
\- Shopping cart management\
\- Order checkout and order management\
\- Product reviews and ratings\
\- Django admin interface\
\- PostgreSQL database integration\
\
\## Technologies Used\
\
\- Python\
\- Django\
\- Django REST Framework\
\- PostgreSQL\
\- JWT Authentication\
\- Git and GitHub\
\
\## Project Structure\
\
\`\`\`text\
ecommerce-backend/\
├── cart/\
├── config/\
├── media/\
│   └── products/\
├── orders/\
├── products/\
├── users/\
├── manage.py\
├── requirements.txt\
└── README.md\
\`\`\`\
\
\## Getting Started\
\
\### 1. Clone the repository\
\
\`\`\`bash\
git clone https\://github.com/Jumana-kp/ecommerce-backend.git\
cd ecommerce-backend\
\`\`\`\
\
\### 2. Create and activate a virtual environment\
\
\*\*Windows:\*\*\
\
\`\`\`bash\
python -m venv venv\
venv\Scripts\activate\
\`\`\`\
\
\### 3. Install dependencies\
\
\`\`\`bash\
pip install -r requirements.txt\
\`\`\`\
\
\### 4. Configure environment variables\
\
Create a \`.env\` file in the project root directory. Add your own local configuration:\
\
\`\`\`env\
DJANGO_SECRET_KEY=your-secret-key\
DB_NAME=your_database_name\
DB_USER=your_database_user\
DB_PASSWORD=your_database_password\
DB_HOST=localhost\
DB_PORT=5432\
\`\`\`\
\
Make sure these variable names match those used in \`config/settings.py\`. Create the PostgreSQL database before running migrations. Never commit your \`.env\` file or share real credentials.\
\
\### 5. Apply migrations\
\
\`\`\`bash\
python manage.py migrate\
\`\`\`\
\
\### 6. Create a superuser (optional)\
\
\`\`\`bash\
python manage.py createsuperuser\
\`\`\`\
\
\### 7. Start the development server\
\
\`\`\`bash\
python manage.py runserver\
\`\`\`\
\
The API server will be available at:\
\
\`http\://127.0.0.1:8000/\`\
\
## Main API Endpoints

All API endpoints are prefixed with `/api/`.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register/` | Register a new user |
| POST | `/api/auth/login/` | Authenticate a user |
| POST | `/api/auth/logout/` | Log out a user |
| POST | `/api/auth/token/refresh/` | Refresh an access token |

### Products

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/products/` | List products |
| GET | `/api/products/<id>/` | Retrieve product details |
| GET | `/api/products/genders/` | List genders |
| GET | `/api/products/brands/` | List brands |
| GET | `/api/products/categories/` | List categories |
| GET | `/api/products/categories/<id>/` | Retrieve category details |
| GET | `/api/products/product-types/` | List product types |

### Shopping Cart

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/cart/` | Retrieve the shopping cart |
| POST | `/api/cart/` | Add an item to the cart |
| POST | `/api/cart/merge/` | Merge guest cart items after login |
| PATCH | `/api/cart/items/<id>/` | Update a cart item |
| DELETE | `/api/cart/items/<id>/delete/` | Remove a cart item |

### Orders and Checkout

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/orders/checkout/` | Create an order through checkout |
| GET | `/api/orders/` | Retrieve orders |
| GET | `/api/orders/<id>/` | Retrieve order details |

### Product Reviews

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/orders/products/<product_id>/review-status/` | Check product review status |
| POST | `/api/orders/products/<product_id>/review/` | Submit a product review |
| GET | `/api/orders/products/<product_id>/reviews/` | Retrieve product reviews |

Authentication and access permissions depend on the endpoint. Protected endpoints require valid authentication. Public access and supported HTTP methods are determined by each view's configuration.