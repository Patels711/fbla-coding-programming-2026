import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/login';
import Landing from "./pages/landing";
import Home from "./pages/home";
import Map from "./pages/mapwip";
import Register from "./pages/register";
import Mapwip from "./pages/map";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/" element={<Landing />} />
				<Route path="/home" element={<Home />} />
				<Route path="/app" element={<Map />} />
				<Route path="/appwip" element={<Mapwip />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App
