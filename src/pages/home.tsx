import { Link } from 'react-router-dom';
import {motion} from 'framer-motion';
  
const Home=()=>{
    return(
        <div className="min-h-screen w-full bg-neutral-900 flex items-center justify-center overflow-hidden">
            <motion.div initial={{opacity: 0.4, y:0}} animate={{opacity:1, y:0}} transition={{duration: 2.0}} className="fixed lg:w-[1200px] h-[500px] w-[600px] -z-0 rounded-full">
                <div className="absolute bottom-[-500px] w-full h-full bg-gradient-to-t from-cyan-700/70 via-cyan-500/70 to-purple-400/70 blur-[160px] rounded-full" />
            </motion.div>
            <motion.div initial={{opacity: 0.3, y:0}} animate={{opacity:1, y:0}} transition={{duration: 2.0}} className="fixed lg:w-[900px] h-[500px] w-[500px] -z-0 rounded-full">
                <div className="absolute lg:top-[-520px] top-[-420px] w-full h-full bg-gradient-to-b from-cyan-700/40 via-cyan-500/40 to-purple-400/40 blur-[120px] rounded-full" />
            </motion.div>
            <div className="flex gap-6">
            <Link 
                to="/Login" 
                className="px-6 py-3 lg:scale-[1.0] scale-[0.7] rounded-lg bg-blue-400 text-orange-50 font-semibold shadow-lg shadow-blue-800 hover:bg-sky-400 hover:shadow-blue-500/85 transition-all duration-200 
                    hover:shadow-2xl hover:scale-[0.77] lg:hover:scale-[1.1]"
                >
                Go to Sign In
            </Link>
            <Link 
                to="/" 
                className="px-6 py-3 lg:scale-[1.0] scale-[0.7] rounded-lg bg-blue-400 text-orange-50 font-semibold shadow-lg shadow-blue-800 hover:bg-sky-400 hover:shadow-blue-500/85 transition-all duration-200 
                    hover:shadow-2xl hover:scale-[0.77] lg:hover:scale-[1.1]"
                >
                    back
            </Link>
            </div>
        </div>
    );
};

export default Home