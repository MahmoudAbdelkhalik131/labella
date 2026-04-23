import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { ShopProvider } from "./contexts/ShopContext";
import { Layout } from "./components/storefront/Layout";
import Home from "./pages/store/Home";
import Shop from "./pages/store/Shop";
import Categories from "./pages/store/Categories";
import ProductDetail from "./pages/store/ProductDetail";
import Cart from "./pages/store/Cart";
import Checkout from "./pages/store/Checkout";
import Wishlist from "./pages/store/Wishlist";
import Profile from "./pages/store/Profile";
import Auth from "./pages/store/Auth";
import SearchPage from "./pages/store/Search";
import About from "./pages/store/About";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ShopProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/auth/:mode" element={<Auth />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ShopProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
