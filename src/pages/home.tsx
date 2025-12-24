import { Link } from 'react-router-dom';
import {motion} from 'framer-motion';
  
const Home=()=>{
    return(
        <div className="min-h-screen w-full absolute bg-neutral-900 flex items-center justify-center overflow-hidden">
            <motion.div initial={{opacity: 0.4, y:0}} animate={{opacity:1, y:0}} transition={{duration: 2.0}} className="fixed lg:w-[1200px] h-[500px] w-[600px] -z-0 rounded-full">
                <div className="absolute bottom-[-500px] w-full h-full bg-gradient-to-t from-cyan-700/70 via-cyan-500/70 to-purple-400/70 blur-[160px] rounded-full" />
            </motion.div>
            <motion.div initial={{opacity: 0.3, y:0}} animate={{opacity:1, y:0}} transition={{duration: 2.0}} className="fixed lg:w-[900px] h-[500px] w-[500px] -z-0 rounded-full">
                <div className="absolute lg:top-[-520px] top-[-420px] w-full h-full bg-gradient-to-b from-cyan-700/40 via-cyan-500/40 to-purple-400/40 blur-[120px] rounded-full" />
            </motion.div>
            <div className="from-neutral-900 via-neutral-800 to-neutral-900 rounded-full bg-gradient-to-l w-[98%] shadow-lg shadow-stone-600 fixed top-3 left-1/2 -translate-x-1/2 z-50 py-2 px-3 flex pointer-events-none">
                <nav className="pt-4 pb-3 px-4 w-full flex justify-between items-center pointer-events-none">
                    <Link 
                        to="/" 
                        className="pointer-events-auto px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all"
                    >
                        ← Back
                    </Link>
                    <span className="bg-gradient-to-l from-cyan-700 via-cyan-500 to-purple-400 bg-clip-text text-transparent font-bold tracking-widest">FBLA Project 25-26</span>
                    <Link to="/Login" className="pointer-events-auto px-3 py-1 rounded-full bg-blue-400 text-orange-50 font-semibold shadow-lg hover:bg-sky-400 transition-all duration-200 
                    hover:shadow-2xl hover:scale-[0.77] lg:hover:scale-[1.1]">
                        Help?
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default Home