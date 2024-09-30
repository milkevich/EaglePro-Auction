import React, { useEffect, useState } from 'react';
import logo from '../assets/eaglepro files 2.png';
import { IoIosArrowDown } from "react-icons/io";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Loader from '../shared/UI/Loader';

const MainContent = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedChannel, setSelectedChannel] = useState({});
    const [selectedType, setSelectedType] = useState({});
    const [selectedQuantity, setSelectedQuantity] = useState({});
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [completeFormShown, setCompleteFormShown] = useState(false);
    const [boughtTrucks, setBoughtTrucks] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 590);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const fetchAuctionData = async () => {
        try {
            const monthsDoc = await getDoc(doc(db, "auctions", "auction"));
            const channelsDoc = await getDoc(doc(db, "auctions", "channels"));

            if (monthsDoc.exists() && channelsDoc.exists()) {
                const monthsData = monthsDoc.data();
                const channelsData = channelsDoc.data();

                const transformedData = Object.keys(monthsData).map((month) => ({
                    month,
                    left: monthsData[month],
                    channels: Object.keys(channelsData).sort(),
                    types: ["CDL", "nonCDL"],
                }));

                const sortedData = transformedData.sort((a, b) => {
                    if (a.left === b.left) {
                        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
                    }
                    return a.left === 0 ? 1 : b.left === 0 ? -1 : a.left - b.left;
                });

                setData(sortedData);
            } else {
                console.error("No auction data found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching auction data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getESTorEDTDate = () => {
        const date = new Date();
        const options = {
            timeZone: 'America/New_York',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    useEffect(() => {
        fetchAuctionData();
        const storedTrucks = JSON.parse(localStorage.getItem('boughtTrucks')) || [];
        setBoughtTrucks(storedTrucks);
    }, []);

    const handleBuyTruck = async (channel, amount, type, month, left) => {
        if (!channel || !type) {
            alert('Please select a channel and type.');
            return;
        }

        if (amount > left || amount <= 0) {
            alert(`Please enter a valid quantity between 1 and ${left}.`);
            return;
        }

        try {
            const newLeft = left - amount;

            const log = {
                channel,
                amount,
                type,
                month,
                timestamp: getESTorEDTDate(),
            };

            const logsDocRef = doc(db, "auctions", "logs");
            const logsDoc = await getDoc(logsDocRef);

            if (logsDoc.exists()) {
                await updateDoc(logsDocRef, {
                    logs: arrayUnion(log)
                });
            } else {
                await setDoc(logsDocRef, {
                    logs: [log]
                });
            }

            const auctionDocRef = doc(db, "auctions", "auction");
            await updateDoc(auctionDocRef, {
                [month]: newLeft
            });

            setData((prevData) =>
                prevData.map((item) =>
                    item.month === month ? { ...item, left: newLeft } : item
                )
            );

            const boughtTruck = { channel, amount, type, month };
            const updatedBoughtTrucks = [...boughtTrucks, boughtTruck];

            localStorage.setItem('boughtTrucks', JSON.stringify(updatedBoughtTrucks));

            setBoughtTrucks(updatedBoughtTrucks);
            setSelectedChannel((prevState) => ({ ...prevState, [month]: '' }));
            setSelectedType((prevState) => ({ ...prevState, [month]: '' }));
            setSelectedQuantity((prevState) => ({ ...prevState, [month]: '' }));

            alert(`${channel} bought ${amount} trucks for ${month} (${type})`);
        } catch (error) {
            console.error("Error processing transaction:", error);
        }
    };

    return (
        <>
            {completeFormShown &&
                <div style={{position: 'fixed', top: 0, left: 0, height: '100vh', width: '100vw', backgroundColor: 'var(--main-bg-color)', zIndex: 1000000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{width: '300px', backgroundColor: 'var(--sec-bg-color)', borderRadius: '20px', border: '1px solid var(--border-color)', overflowY: 'scroll' }}>
                        <div style={{borderBottom: '1px solid var(--border-color)', padding: '0px 20px'}}>
                            <p>Bought trucks</p>
                        </div>
                        {boughtTrucks.length > 0 ? (
                            <ul style={{padding: '0px 20px'}}>
                                {boughtTrucks.map((truck, index) => (
                                    <div style={{borderBottom: boughtTrucks.length - 1 == index ? 'none' : '1px solid var(--border-color)'}} key={index}>
                                        <p>{truck.month} <span style={{color :'var(--sec-color)'}}>({truck.type})</span></p>
                                        <p>{truck.channel} Channel</p>
                                        <p>{truck.amount} Trucks</p>
                                    </div>
                                ))}
                            </ul>
                        ) : (
                            <p style={{padding: '0px 20px'}}>No trucks bought.</p>
                        )}
                    </div>  
                </div>
            }
            <div style={{ maxHeight: '100vh', overflow: 'scroll', overflowX: 'hidden' }}>
                <div style={{ padding: '0px 20px', width: '100%', borderBottom: '1px solid var(--border-color)', height: '75px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--sec-bg-color)', position: 'sticky', top: 0, zIndex: 1000 }}>
                    <h2 style={{ margin: 0, fontSize: '21px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img style={{ width: '40px' }} src={logo} alt="EaglePro Logo" /> EaglePro Auction
                    </h2>
                </div>
                {loading ?
                    <Loader />
                    :
                    <div style={{ display: isSmallScreen ? 'flex' : 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', gap: '20px', padding: '20px 0px 20px 20px', width: 'calc(100% - 40px)', flexDirection: isSmallScreen && 'column' }}>
                        {data?.map((item, index) => (
                            <div key={index} style={{ maxWidth: '100%', backgroundColor: 'var(--sec-bg-color)', height: isSmallScreen ? '420px' : '235px', borderRadius: '20px', border: '1px solid var(--border-color)', opacity: item.left === 0 ? 0.5 : 1 }}>
                                <div style={{ borderBottom: '1px solid var(--border-color)', padding: '0px 20px', display: 'flex', justifyContent: 'space-between' }}>
                                    <p>{item.month}</p>
                                    <p className='leftLabel' style={{ color: '#b51b1b', fontWeight: '700' }}>{item.left} left</p>
                                </div>
                                <div style={{ padding: '20px', display: isSmallScreen ? 'block' : 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '-10px', width: 'calc(100% - 65px)' }}>
                                    <div style={{ width: isSmallScreen ? 'calc(100% + 20px)' : '100%', position: 'relative' }}>
                                        <p style={{ margin: 0, marginBottom: '10px' }}>Your Slack Channel</p>
                                        <IoIosArrowDown color='var(--sec-color)' style={{ backgroundColor: 'var(--sec-bg-color)', paddingRight: '7px', position: 'absolute', marginTop: '6.5px', marginRight: '-18px', pointerEvents: 'none', paddingTop: 5, paddingBottom: 5, zIndex: 100, right: 20 }} />
                                        <select value={selectedChannel[item.month] || ''} onChange={(e) => setSelectedChannel((prevState) => ({ ...prevState, [item.month]: e.target.value }))} style={{ outline: 'none', border: '1px solid var(--border-color)', padding: '10px', width: '100%', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--sec-bg-color)', color: 'var(--main-color)' }} name="Channel">
                                            <option value="">Select Channel</option>
                                            {item.channels.map((channel, idx) => (
                                                <option key={idx} value={channel}>{channel}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ width: isSmallScreen ? 'calc(100% + 20px)' : '100%', position: 'relative', marginTop: isSmallScreen && '20px' }}>
                                        <p style={{ margin: 0, marginBottom: '10px' }}>Type</p>
                                        <IoIosArrowDown color='var(--sec-color)' style={{ backgroundColor: 'var(--sec-bg-color)', paddingRight: '7px', position: 'absolute', marginTop: '6.5px', marginRight: '-18px', pointerEvents: 'none', paddingTop: 5, paddingBottom: 5, zIndex: 100, right: 20 }} />
                                        <select value={selectedType[item.month] || ''} onChange={(e) => setSelectedType((prevState) => ({ ...prevState, [item.month]: e.target.value }))} style={{ outline: 'none', border: '1px solid var(--border-color)', padding: '10px', width: '100%', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--sec-bg-color)', color: 'var(--main-color)' }} name="Type">
                                            <option value="">Select Type</option>
                                            {item.types.map((type, idx) => (
                                                <option key={idx} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{ width: '100%', marginTop: isSmallScreen && '20px' }}>
                                        <p style={{ margin: 0, marginBottom: '10px' }}>Quantity</p>
                                        <input value={selectedQuantity[item.month] || ''} onChange={(e) => setSelectedQuantity((prevState) => ({ ...prevState, [item.month]: e.target.value }))} max={item.left} min={0} style={{ outline: 'none', border: '1px solid var(--border-color)', padding: '10px', width: '100%', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--sec-bg-color)', color: 'var(--main-color)' }} type="number" placeholder={`Up to ${item.left} trucks`} />
                                    </div>
                                </div>
                                <div style={{ width: 'calc(100% - 40px)', padding: '20px' }}>
                                    <button
                                        disabled={item.left === 0}
                                        onClick={() => handleBuyTruck(selectedChannel[item.month], Number(selectedQuantity[item.month]), selectedType[item.month], item.month, item.left)}
                                        style={{ width: '100%', padding: '10px', border: 'none', backgroundColor: 'var(--thr-bg-color)', outline: 'none', borderRadius: 'var(--border-radius)', color: 'var(--main-color)', cursor: item.left === 0 ? 'not-allowed' : 'pointer' }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                }
                <div style={{ width: 'calc(100% - 40px)', backgroundColor: 'var(--sec-bg-color)', padding: '20px', position: 'sticky', bottom: 0, zIndex: 100000, borderTop: '1px solid var(--border-color)' }}>
                    <button onClick={() => {
                        setCompleteFormShown(true);
                    }} style={{ width: '100%', padding: '10px', backgroundColor: 'var(--thr-bg-color)', outline: 'none', border: 'none', borderRadius: '10px', color: 'var(--main-color)', cursor: 'pointer' }}>Submit</button>
                </div>
            </div>
        </>
    );
};

export default MainContent;
