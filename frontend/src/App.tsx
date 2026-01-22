import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/login';
import Landing from "./pages/loading";
import Home from "./pages/home";
import Map from "./pages/map";
import Register from "./pages/register";
import Profile from "./pages/profile";



function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/loading" element={<Landing />} />
				<Route path="/" element={<Home />} />
				<Route path="/map" element={<Map />} />
				<Route path="/profile" element={<Profile />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App
