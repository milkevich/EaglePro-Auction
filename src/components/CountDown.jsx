import { useEffect, useState, useRef } from "react";
import { useAnimate } from "framer-motion";
import logo from '../assets/eaglepro files 2.png';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const ShiftingCountdown = ({ auctionStartDate, onCountdownFinish }) => {
  const getFormattedESTDate = (isoString) => {
    const date = new Date(isoString);
    const options = {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZoneName: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const auctionStartTime = getFormattedESTDate(auctionStartDate);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0px', alignItems: 'center', flexDirection: 'column', height: '90vh' }}>
      <div style={{ textAlign: 'center' }}>
        <img style={{ minWidth: '100px', maxWidth: '100px' }} src={logo} alt="EaglePro Logo" />
        <h2 style={{ margin: 0 }}>EaglePro - Schedule 1st half 2025</h2>
        <p style={{ margin: 0, color: 'var(--sec-color)' }}>Starting at {auctionStartTime}</p>
      </div>
      <br />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0px', alignItems: 'center' }}>
        <div style={{ border: '1px solid var(--border-color)', padding: '10px', borderRadius: '20px 0px 0px 20px' }}>
          <CountdownItem unit="Day" endDate={auctionStartDate} label="Days" onCountdownFinish={onCountdownFinish} />
        </div>
        <div style={{ border: '1px solid var(--border-color)', padding: '10px', borderLeft: 'none', borderRight: 'none' }}>
          <CountdownItem unit="Hour" endDate={auctionStartDate} label="Hours" />
        </div>
        <div style={{ border: '1px solid var(--border-color)', padding: '10px', borderRight: 'none' }}>
          <CountdownItem unit="Minute" endDate={auctionStartDate} label="Minutes" />
        </div>
        <div style={{ border: '1px solid var(--border-color)', padding: '10px', borderRadius: '0px 20px 20px 0px' }}>
          <CountdownItem unit="Second" endDate={auctionStartDate} label="Seconds" />
        </div>
      </div>
    </div>
  );
};

const CountdownItem = ({ unit, label, endDate, onCountdownFinish }) => {
  const { ref, time } = useTimer(unit, endDate, onCountdownFinish);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', height: '50px', width: '80px', overflow: 'hidden' }}>
        <span ref={ref} style={{ fontSize: '2rem', display: 'block', width: '100%' }}>
          {time}
        </span>
      </div>
      <span style={{ marginTop: '5px', fontSize: '14px', color: 'var(--sec-color)' }}>{label}</span>
    </div>
  );
};

const useTimer = (unit, endDate, onCountdownFinish) => {
  const [ref, animate] = useAnimate();
  const timeRef = useRef(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleCountdown(unit);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [endDate]);

  const handleCountdown = async (unit) => {
    const end = new Date(endDate);
    const now = new Date();
    const distance = +end - +now;
    let newTime = 0;

    if (unit === "Day") {
      newTime = Math.floor(distance / DAY);
    } else if (unit === "Hour") {
      newTime = Math.floor((distance % DAY) / HOUR);
    } else if (unit === "Minute") {
      newTime = Math.floor((distance % HOUR) / MINUTE);
    } else {
      newTime = Math.floor((distance % MINUTE) / SECOND);
    }

    if (distance <= 0 && onCountdownFinish) {
      onCountdownFinish(); // Trigger countdown finish
    }

    if (newTime !== timeRef.current) {
      await animate(ref.current, { y: ["0%", "-100%"], opacity: [1, 0] }, { duration: 0.35 });

      timeRef.current = newTime;
      setTime(newTime);

      await animate(ref.current, { y: ["100%", "0%"], opacity: [0, 1] }, { duration: 0.35 });
    }
  };

  return { ref, time };
};

export default ShiftingCountdown;
