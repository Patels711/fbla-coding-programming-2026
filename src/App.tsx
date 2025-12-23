import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from './pages/login';
import Landing  from "./pages/landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={<Landing />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App