import React, { useEffect, useState } from 'react';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebaseConfig';  
import MainContent from '../components/MainContent';
import LiveActions from '../components/LiveActions';
import Loader from '../shared/UI/Loader';
import ShiftingCountdown from '../components/CountDown';

const Auction = () => {
    const [auctionRunning, setAuctionRunning] = useState(false);
    const [auctionStartDate, setAuctionStartDate] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [isCountdownOver, setIsCountdownOver] = useState(false);

    const fetchAuctionStatus = async () => {
        try {
            const auctionDoc = await getDoc(doc(db, "auctions", "auctionDetails"));
            if (auctionDoc.exists()) {
                const auctionData = auctionDoc.data();
                setAuctionRunning(auctionData.auctionRunning);
                setAuctionStartDate(auctionData.auctionTime.toDate()); 
            } else {
                console.error("Auction details not found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching auction status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctionStatus();
    }, []);

    const handleCountdownFinish = () => {
        setIsCountdownOver(true);
    };

    if (loading) {
        return <Loader />;
    }

    if (auctionRunning && !isCountdownOver) {
        return (
            <div style={{ height: '90vh', width: '100vw', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <ShiftingCountdown auctionStartDate={auctionStartDate} onCountdownFinish={handleCountdownFinish} />
                </div>
            </div>
        );
    }

    if (isCountdownOver && !auctionRunning || !auctionRunning) {
        return (
            <div style={{ height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h2 style={{ margin: 0, padding: 0 }}>No Auctions are running currently.</h2>
                    <p style={{ color: 'var(--sec-color)', margin: 0, padding: 0 }}>Please come back later.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
            <div style={{ width: '100%' }}>
                <MainContent />
            </div>
            <LiveActions />
        </div>
    );
};

export default Auction;
