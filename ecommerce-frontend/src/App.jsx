import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Cart from "./pages/Cart";
import Checkout from "./pages/checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";

import ProtectedRoute from "./routes/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";


function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<MainLayout />}>

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/products"
                        element={<Products />}
                    />

                    <Route
                        path="/products/:id"
                        element={<ProductDetail />}
                    />

                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/checkout"
                            element={<Checkout />}
                        />

                        <Route
                            path="/orders"
                            element={<MyOrders />}
                        />
                           
                         <Route
        path="/orders/:id"
        element={<OrderDetails />}
    />  
                    </Route> 

                </Route>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

            </Routes>
        </BrowserRouter>
    );
}


export default App;