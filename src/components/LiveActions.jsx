import React, { useEffect, useState } from 'react';
import { TbLayoutSidebarRightExpand, TbLayoutSidebarRightCollapse } from "react-icons/tb";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Loader from '../shared/UI/Loader';

const LiveActions = () => {
    const [LiveActionsExpanded, setLiveActionsExpanded] = useState(true);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth <= 890);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "auctions", "logs"), (snapshot) => {
            if (snapshot.exists()) {
                const logsData = snapshot.data().logs;
                setLogs(logsData);
            } else {
                console.error("No logs data found.");
                setLogs([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching logs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <div style={{ width: LiveActionsExpanded ? isSmallScreen ? '350px' : '450px' : '72px', borderLeft: '1px solid var(--border-color)', height: '100vh', backgroundColor: 'var(--sec-bg-color)', transition: 'ease-in-out 0.5s all', position: isSmallScreen && 'fixed', right: LiveActionsExpanded ? 0 : isSmallScreen ? '-80px' : '0', zIndex: isSmallScreen && '100000' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottom: isSmallScreen ? 'none' : '1px solid var(--border-color)', padding: '0px 20px', transition: 'ease-in-out 0.5s all', height: '75px' }}>
                    <button
                        style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--border-radius)', outline: 'none', border: 'none', cursor: 'pointer', backgroundColor: 'var(--thr-bg-color)', color: 'var(--main-color)', fontWeight: '900', marginLeft: LiveActionsExpanded ? 0 : isSmallScreen ? '-80px' : '0' }}
                        onClick={() => setLiveActionsExpanded(!LiveActionsExpanded)}
                    >
                        {LiveActionsExpanded ? <TbLayoutSidebarRightCollapse size={21} /> : <TbLayoutSidebarRightExpand size={21} />}
                    </button>
                    <h2 style={{ transition: 'ease-in-out 0.5s all', opacity: LiveActionsExpanded ? 1 : 0, marginRight: LiveActionsExpanded ? '' : '-400px' }}>Live Actions</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', textAlign: 'left', justifyContent: 'space-between', height: 'calc(100% - 90px)', transition: 'ease-in-out 0.5s all', opacity: LiveActionsExpanded ? 1 : 0, marginRight: LiveActionsExpanded ? '' : '-400px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                            <Loader />
                        </div>
                    ) : (
                        <div style={{ width: '100%', padding: '10px', display: 'flex', flexDirection: 'column-reverse', overflowY: 'auto', height: 'calc(100% - 10px)', overflowY: 'scroll', marginTop: '10px' }}>
                            {logs?.length > 0 ? (
                                <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
                                    {logs.map((log, idx) => (
                                        <p key={idx} style={{ padding: '0px', margin: 0, marginTop: '10px' }}>
                                            <span style={{ fontSize: '14px', color: 'var(--sec-color)' }}>
                                                [
                                                {new Date(log.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                })}
                                                ]
                                            </span> {log.channel} bought {log.amount} {log.amount > 1 ? 'trucks' : 'truck'} for {log.month}
                                        </p>
                                    ))}
                                </ul>
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--sec-color)' }}>No logs yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div style={{height: '100vh', width: '100vw', position: 'fixed', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10000, transition: 'ease-in-out 0.3s all', opacity: isSmallScreen && LiveActionsExpanded ? 1 : 0, pointerEvents: 'none'}}/>
        </>
    );
};

export default LiveActions;
