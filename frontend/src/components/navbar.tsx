import React from 'react';
import {motion, useScroll, useTransform} from "framer-motion";

interface NavBarProps {
    page?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    cardClassName?: string;
    titleClassName?: string;
    contentClassName?: string;
}

const Navbar: React.FC<NavBarProps> = ({ page, children, className = ""}) => {
    const { scrollY } = useScroll();
	const width = useTransform(scrollY, [0, 100], ["100%", "98%"]);
	const borderRadius = useTransform(scrollY, [0, 100], ["0px", "40px"]);
	const marginTop = useTransform(scrollY, [0, 100], ["0px", "12px"]);
	const bgColor = useTransform(scrollY, [0, 100], ["rgba(23, 23, 23, 1)", "rgba(30, 30, 30, 0.7)"]);

    return (
        <div className="fixed z-50 min-w-screen pointer-events-none flex justify-center">
            <motion.div style={{ width, borderRadius, marginTop, backgroundColor: bgColor }} className="px-8 flex items-center justify-between shadow-neutral-700 backdrop-blur-md pointer-events-auto shadow-md">
                <nav className="py-5 px-5 w-full flex justify-between items-center">
                    <span className={`${className ? className : "bg-linear-to-l from-cyan-700 via-cyan-500 to-purple-400 bg-clip-text text-transparent"} font-bold tracking-widest text-sm md:text-lg`}>
                        {page}
                    </span>
                    <div className="flex space-x-2">
                        {children}
                    </div>
                </nav>
            </motion.div>
        </div>
    );
}

export default Navbar;
