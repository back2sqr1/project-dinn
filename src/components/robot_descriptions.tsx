"use client";
import React, { useState, useEffect } from 'react';
import car_gif from '@/assets/Spinning Car Gif.gif'
import Image from 'next/image';
import '@/styles/car_design.css';

import { Robot, RobotDescriptionsProps } from '@/utils/robot_interface';

const RobotDescriptions: React.FC<RobotDescriptionsProps> = ({ robot_count }) => {
    const [robots, setRobots] = useState<Robot[]>([]);

    useEffect(() => {
        const savedRobots = localStorage.getItem('robots');
        let parsedRobots: Robot[] = [];

        if (savedRobots) {
            parsedRobots = JSON.parse(savedRobots);
        }
        else {
            parsedRobots = Array.from({ length: robot_count }, (_, index) => ({
                id: String.fromCharCode(65 + index),
                position: [0, 0],
                velocity: 1,
            }));
        }

        setRobots(parsedRobots.slice(0, robot_count));
    }, [robot_count]);

    useEffect(() => {
        if (robots.length > 0) {
            localStorage.setItem('robots', JSON.stringify(robots));
        }
    }, [robots]);

    const handleRobotChange = (index: number, field: keyof Robot, value: any) => {
        const updatedRobots = [...robots];

        if (field === 'position') {
            const [axis, val] = value;
            updatedRobots[index][field][axis] = parseFloat(val);
        } else if (field === 'velocity') {
            updatedRobots[index][field] = parseFloat(value);
        } else {
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
                                value={robots[index]?.id || String.fromCharCode(65 + index) + (index + 1)}
                                onChange={(e) => handleRobotChange(index, 'id', e.target.value)}
                                className="p-1 rounded"
                            />
                            <br />

                            <div className="flex">
                                <label className="font-bold w-17">Position: </label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        step="1"
                                        value={robots[index]?.position[0] || 0}
                                        onChange={(e) => handleRobotChange(index, 'position', [0, e.target.value])}
                                        className="p-1 rounded w-10"
                                    />
                                    <input
                                        type="number"
                                        step="1"
                                        value={robots[index]?.position[1] || 0}
                                        onChange={(e) => handleRobotChange(index, 'position', [1, e.target.value])}
                                        className="p-1 rounded w-10"
                                    />
                                </div>
                            </div>

                            <label className="font-bold">Velocity: </label>
                            <input
                                type="number"
                                step="1"
                                value={robots[index]?.velocity || 1}
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