import { Link } from 'react-router-dom';
import {motion} from 'framer-motion';
  
const Home=()=>{
    return(
        <div className="min-h-screen relative bg-neutral-900 w-full overflow-x-hidden">

            <div className="fixed inset-0 pointer-events-none w-full z-0 flex items-center justify-center">
                <motion.div initial={{opacity: 0.4, y:0}} animate={{opacity:1, y:0}} transition={{duration: 2.0}} className="fixed lg:w-[1200px] h-[500px] w-[600px] rounded-full">
                    <div className="absolute bottom-[-500px] w-full h-full bg-gradient-to-t from-cyan-700/70 via-cyan-500/70 to-purple-400/70 blur-[160px] rounded-full" />
                </motion.div>
                <motion.div initial={{opacity: 0.3, y:0}} animate={{opacity:1, y:0}} transition={{duration: 2.0}} className="fixed lg:w-[900px] h-[500px] w-[500px] rounded-full">
                    <div className="absolute lg:top-[-600px] top-[-550px] w-full h-full bg-gradient-to-b from-cyan-700/40 via-cyan-500/40 to-purple-400/40 blur-[120px] rounded-full" />
                </motion.div>
            </div>

            <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[98%] pointer-events-none">
                <div className="from-neutral-900 via-neutral-800 to-neutral-900 rounded-full bg-gradient-to-l shadow-lg shadow-black/50 py-2 px-3 border border-white/10 backdrop-blur-md">
                    <nav className="pt-4 pb-3 px-4 w-full flex justify-between items-center">
                        <Link 
                            to="/" 
                            className="pointer-events-auto px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white hover:bg-white/20 transition-all text-sm"
                        >
                            ← Back
                        </Link>
                        <span className="bg-gradient-to-l from-cyan-700 via-cyan-500 to-purple-400 bg-clip-text text-transparent font-bold tracking-widest text-xs md:text-base">
                            FBLA Project 25-26
                        </span>
                        <Link to="/Login" className="pointer-events-auto px-3 py-1 rounded-full bg-blue-400 text-orange-50 font-semibold shadow-lg hover:bg-sky-400 transition-all duration-200 lg:hover:scale-[1.1] text-sm">
                            Help?
                        </Link>
                    </nav>
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 pt-32 pb-20">
                <div className="bg-neutral-700/50 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
                    <h1 className="text-neutral-500 text-4xl">Content 01</h1>
                </div>
                <div className="bg-neutral-700/50 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
                    <h1 className="text-neutral-500 text-4xl">Content 02</h1>
                </div>
                <div className="bg-neutral-700/50 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
                    <h1 className="text-neutral-500 text-4xl">Content 03</h1>
                </div>
                <div className="bg-neutral-700/50 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
                    <h1 className="text-neutral-500 text-4xl">Content 04</h1>
                </div>
                <div className="bg-neutral-700/50 p-16 rounded-3xl w-full max-w-2xl border border-white/5 backdrop-blur-sm">
                    <h1 className="text-neutral-500 text-4xl">Content 05</h1>
                </div>
            </div>
        </div>
    );
};

export default Home