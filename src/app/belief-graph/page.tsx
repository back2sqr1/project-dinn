'use client';
import { Typewriter } from 'nextjs-simple-typewriter'
import Link from "next/link";
import React, { useState, useEffect } from 'react';
import RobotDescriptions from '@/components/robot_descriptions';

export default function Home() {
  const [robotCount, setRobotCount] = useState<number>(0);

  // Load robot count from localStorage on component mount
  useEffect(() => {
    const savedCount = localStorage.getItem('robotCount');
    if (savedCount) {
      setRobotCount(parseInt(savedCount, 10));
    }
  }, []);

  // Save robot count to localStorage whenever it changes
  useEffect(() => {
    if (robotCount > 0) {
      localStorage.setItem('robotCount', robotCount.toString());
    }
  }, [robotCount]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parameter = formData.get("robot-count") as string; 
    
    const count = parseInt(parameter, 10);
    if (isNaN(count) || count <= 0) {
      alert("Please enter a valid number of agents.");
      return;
    }
    setRobotCount(count);
  }

  return (
    <div className= "retro-container relative">
    <section id="screen-1">
      <span className = "absolute left-1 bottom-0">
        <Link href="/">prev</Link>
      </span>
      <article>
          <header>
              <h1><Typewriter
                          words={['Parameters']}
                          loop={1}
                          cursor
                          cursorStyle=''
                          typeSpeed={30}
                          deleteSpeed={50}
                          delaySpeed={1000}
                        /></h1>
          </header>
          <hr />
          <form onSubmit={handleSubmit}>
            <Typewriter
              words={['Input the parameters for the belief graph.']}
              loop={1}
              cursor
              cursorStyle=''
              typeSpeed={50}
              deleteSpeed={50}
              delaySpeed={1000}
            />
            <br/>
            <label htmlFor="belief-graph-parameter">Number of Agents: </label>
            <input className="file-input" type="text" id="belief-graph-parameter" name="robot-count" placeholder="# of Agents" />
            <br/>
            <button type="submit">Submit</button>
          </form>
          
          {robotCount > 0 && (
            <RobotDescriptions
              robot_count={robotCount}
            />
          )}
      </article>
      <span className = "absolute right-1 bottom-0">
        <Link href="/sim">next</Link>
      </span>
    </section>
    </div>
  );
}
