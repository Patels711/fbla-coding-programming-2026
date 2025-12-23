import {motion} from 'framer-motion';
import { Link } from 'react-router-dom';

const Landing =()=>{
    return(
        <div className="min-h-screen w-full bg-neutral-900 flex items-center justify-center overflow-hidden">
            <div className="fixed w-[1200px] h-[500px] -z-0 rounded-full">
                <div className="absolute bottom-[-450px] w-full h-full bg-gradient-to-t from-cyan-700/40 via-cyan-500/40 to-purple-400/40 blur-[120px] rounded-full" />
            </div>
            <motion.div 
                initial={{ opacity: 0.1, y: 80 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.9 }} 
                className="flex-col">  
            <div className="p-16 bg-transparent flex flex-col items-center gap-3 md:gap-8">
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-l from-cyan-700/70 via-cyan-500/80 to-purple-400/70 bg-clip-text text-transparent">
                    Welcome
                </h1>
                <Link 
                to="/Login" 
                className="px-6 py-3 md:scale-[1.0] scale-[0.7] rounded-lg bg-blue-400 text-orange-50 font-semibold shadow-lg shadow-blue-800 hover:bg-sky-400 hover:shadow-blue-500/85 transition-all duration-200 
                    hover:shadow-2xl hover:scale-[0.77] md:hover:scale-[1.1]"
                >
                Go to Sign In
                </Link>
            </div>
            </motion.div>
        </div>
        
    );
};

export default Landing