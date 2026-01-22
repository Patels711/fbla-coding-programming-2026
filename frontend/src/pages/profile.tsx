import React, { useEffect, useRef, useState } from 'react';
import {dimensionValueTypes, motion} from "framer-motion";
import Card from "../components/card";
import { useNavigate } from 'react-router-dom';

const Profile=()=>{
    const [user, setUser] = useState<{uid: number, username: string} | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:5174/auth/profile', {
                    credentials: 'include'
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                navigate('/login');
            }
        };
        fetchProfile();
    }, [navigate]);

    if (!user) return <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">Loading...</div>;

    return(
        <div className="min-h-screen bg-neutral-900 relative w-full overscroll-none">
            <div className=" min-h-screen w-full fixed bg-neutral-900 backdrop-blur-[400px] flex items-center justify-center overflow-hidden">
                <motion.div initial={{ opacity: 0.4, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.0 }} className="fixed lg:w-[1200px] h-[500px] w-[600px] -z-0 rounded-full">
                    <div className="absolute bottom-[-500px] w-full h-full bg-linear-to-t from-cyan-700/70 via-cyan-500/70 to-purple-400/70 blur-[160px] rounded-full" />
                </motion.div>
                <motion.div initial={{ opacity: 0.3, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 2.0 }} className="fixed lg:w-[900px] h-[500px] w-[500px] -z-0 rounded-full">
                    <div className="absolute lg:top-[-520px] top-[-420px] w-full h-full bg-linear-to-b from-cyan-700/40 via-cyan-500/40 to-purple-400/40 blur-[120px] rounded-full" />
                </motion.div>
            </div>
            <div className="w-full relative grid gap-8 pt-10">
                <Card title="Profile" titleClassName=' text-cyan-500'>
                    <h1 className="text-xl">Welcome {user.username}!</h1>
                    <p className="text-xl">Your account infomation is below.</p>
                    <p className="text-gray-400 mt-4">User ID: {user.uid}</p>
                </Card>
            </div>
        </div>
    )
};

export default Profile
