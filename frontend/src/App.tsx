import { HomePage } from './Pages/homepage';
import { CheckoutPage } from './Pages/checkoutPage';
import { DeliveryPage } from './Pages/DeliveryPage';
import { StripePage } from './Pages/StripePage';
import { Routes, Route } from 'react-router';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/stripe" element={<StripePage />} />
      <Route path="/delivery" element={<DeliveryPage />} />
    </Routes>
  );
}

export default App;
