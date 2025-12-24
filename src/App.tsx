import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from './pages/login';
import Landing  from "./pages/landing";
import Home from "./pages/home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />}/>
        <Route path="/" element={<Landing />}/>
        <Route path="/Home" element={<Home />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App