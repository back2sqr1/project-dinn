"use client";
import React, { useState, useEffect } from 'react';
import car_gif from '@/assets/Spinning Car Gif.gif'
import Image from 'next/image';
import '@/styles/car_design.css';

interface Robot {
    id: string;
    name: string;
    model: string;
    location: [number, number];
    velocity: [number];
}

interface RobotDescriptionsProps {
    robot_count: number;
}

const RobotDescriptions: React.FC<RobotDescriptionsProps> = ({ robot_count }) => {
    const [robots, setRobots] = useState<Robot[]>([]);

    // Initialize or update robots when count changes
    useEffect(() => {
        // Try to load robots from localStorage
        const savedRobots = localStorage.getItem('robots');
        let parsedRobots: Robot[] = [];
        
        if (savedRobots) {
            parsedRobots = JSON.parse(savedRobots);
        }
        
        // If we need more robots than we have saved, create new ones
        setRobots(parsedRobots.slice(0, robot_count));
    }, [robot_count]);

    // Save robots to localStorage whenever they change
    useEffect(() => {
        if (robots.length > 0) {
            localStorage.setItem('robots', JSON.stringify(robots));
        }
    }, [robots]);

    // Handle changes to robot properties
    const handleRobotChange = (index: number, field: keyof Robot, value: any) => {
        const updatedRobots = [...robots];
        
        if (field === 'location') {
            // Handle location as a special case since it's an array
            const [axis, val] = value;
            updatedRobots[index][field][axis] = parseFloat(val);
        } else if (field === 'velocity') {
            // Handle velocity as a special case since it's an array
            updatedRobots[index][field][0] = parseFloat(value);
        } else {
            // Handle string fields
            updatedRobots[index][field] = value;
        }
        
        setRobots(updatedRobots);
    };

    return (
        <div className="robot-descriptions flex">
            <div className="flex-1">
            {
                Array.from({ length: robot_count }, (_, index) => (
                <div key={index} className="">
                    <h2 className="text-xl font-bold mb-2">Robot {index + 1}</h2>
                    
                    <label className="font-bold">ID: </label>
                    <input
                        type="text"
                        value={`robot-${index + 1}`}
                        onChange={(e) => handleRobotChange(index, 'id', e.target.value)}
                        className="p-1 rounded"
                    />
                    <br/>

                    <label className="font-bold">Name: </label>
                    <input
                        type="text"
                        value={robots[index]?.name || ''}
                        onChange={(e) => handleRobotChange(index, 'name', e.target.value)}
                        className="p-1 rounded"
                    />
                    
                    <br/>

                    <label className="font-bold">Model: </label>
                    <input
                        type="text"
                        value={robots[index]?.model || ''}
                        onChange={(e) => handleRobotChange(index, 'model', e.target.value)}
                        className="p-1 rounded"
                    />
                    <br/>
                        
                    <div className="flex">
                        <label className="font-bold w-17">Location: </label>
                        <input
                            type="number"
                            step="0.01"
                            value={robots[index]?.location[0] || 0}
                            onChange={(e) => handleRobotChange(index, 'location', [0, e.target.value])}
                            className="p-1 rounded w-8"
                        />
                        <input
                            type="number"
                            step="0.01"
                            value={robots[index]?.location[1] || 0}
                            onChange={(e) => handleRobotChange(index, 'location', [1, e.target.value])}
                            className="p-1 rounded w-8"
                        />
                    </div>
                    
                    <label className="font-bold">Velocity: </label>
                    <input
                        type="number"
                        step="0.01"
                        value={robots[index]?.velocity[0] || 0}
                        onChange={(e) => handleRobotChange(index, 'velocity', e.target.value)}
                        className="p-1 rounded"
                    />
                </div>
                ))
            }
            </div>
            <div className="flex-1 car_gif">
                <Image
                    src={car_gif}
                    alt="Spinning Car"
                    width={500}
                    height={500}
                />
            </div>
        </div>
    );
};

export default RobotDescriptions;