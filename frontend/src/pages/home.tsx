import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Links from '../components/links';
import Navbar from '../components/navbar';
import Card from '../components/card';


const Home = () => {
	return (
		<div className="min-h-screen bg-neutral-900 relative w-full overscroll-none">

			<div className="fixed backdrop-blur-[1000px] inset-0 bg-neutral-900 pointer-events-none w-full z-0 flex items-center justify-center overscroll-none">
				<motion.div initial={{ opacity: 0.4, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.0 }} className="fixed lg:w-[1200px] h-[500px] w-[600px] -z-0 rounded-full">
					<div className="absolute bottom-[-500px] w-full h-full bg-linear-to-t from-cyan-700/70 via-cyan-500/70 to-purple-400/70 blur-[160px] rounded-full" />
				</motion.div>
				<motion.div initial={{ opacity: 0.3, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.0 }} className="fixed lg:w-[900px] h-[500px] w-[500px] -z-0 rounded-full">
					<div className="absolute lg:top-[-520px] top-[-420px] w-full h-full bg-linear-to-b from-cyan-700/40 via-cyan-500/40 to-purple-400/40 blur-[120px] rounded-full" />
				</motion.div>
			</div>

			<Navbar page="FBLA Project 25-26">
				<Links link="/login">
					Login →
				</Links>
				<Links link="/register">
					Register →
				</Links>
			</Navbar>

			<div className="relative z-10 flex flex-col items-center gap-8 pt-32 pb-20">
				<Card contentClassName="text-4xl text-neutral-500" className="max-w-3xl">
					Content 01
				</Card>
				<div className="bg-neutral-800/60 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
					<h1 className="text-neutral-500 text-4xl">Content 02</h1>
				</div>
			</div>
			<div className="relative z-10 flex gap-14 justify-center items-center">
				<div className="bg-neutral-800/60 p-16 rounded-3xl w-xl max-w-lg border border-white/5 backdrop-blur-lg">
					<h1 className="text-neutral-500 text-4xl">Content 03</h1>
				</div>{/*sidebyside*/}
				<div className="bg-neutral-800/60 p-16 rounded-3xl w-xl max-w-lg border border-white/5 backdrop-blur-sm">
					<h1 className="text-neutral-500 text-4xl">Content 04</h1>
				</div>{/*sidebyside*/}
			</div>
			<div className="relative z-10 flex flex-col items-center gap-8 pt-20 pb-15">
				<div className="bg-neutral-800/60 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
					<h1 className="text-purple-400/60 text-4xl">Content 05</h1>
				</div>
			</div>
			<div className="relative z-10 flex flex-col border-neutral-800 border-y-2 items-center gap-8 my-9 py-15 bg-neutral-900 min-w-full">
				<div className="bg-neutral-800 p-16 rounded-3xl min-w-7xl border border-white/5 backdrop-blur-sm">
					<h1 className="text-neutral-500 text-4xl">Content 06</h1>
				</div> {/*hoveringbar*/}
				<div className="relative z-10 flex flex-col items-center gap-8">
			</div>
			</div>
			<div className="relative z-10 flex flex-col items-center gap-8 pt-15 pb-20">
				<div className="bg-neutral-800/60 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
					<h1 className="text-neutral-500 text-4xl">Content 08</h1>
				</div>
			</div>
		</div>
	);
};

export default Home
