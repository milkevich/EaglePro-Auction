import React, { useEffect, useState } from 'react';
import { FaRegCalendar } from "react-icons/fa6";
import { doc, getDoc, setDoc, updateDoc, deleteField, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { CgCloseO } from "react-icons/cg";
import { AiOutlineDelete } from "react-icons/ai";
import { IoIosArrowDown } from 'react-icons/io';

const AdminDashboard = () => {
  const [estDateTime, setEstDateTime] = useState('');
  const [monthsData, setMonthsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [openNewAuction, setOpenNewAuction] = useState(false);
  const [newAuctionDateTime, setNewAuctionDateTime] = useState('');
  const [newMonths, setNewMonths] = useState([]);
  const [newMonth, setNewMonth] = useState('January');
  const [newQuantity, setNewQuantity] = useState(0);
  const [auctionDetails, setAuctionDetails] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
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

  const monthOrder = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const toggleEdit = () => {
    if (!editing) {
      setEditing(true);
    } else {
      setEditing(false);
      saveData();
    }
  };

  const fetchMonthsDataAndAuctionTime = async () => {
    try {
      const monthsDoc = await getDoc(doc(db, "auctions", "auction"));
      const detailsDoc = await getDoc(doc(db, "auctions", "auctionDetails"));

      if (monthsDoc.exists()) {
        const monthsData = monthsDoc.data();
        const sortedMonths = Object.entries(monthsData).sort(
          (a, b) => monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0])
        );
        setMonthsData(sortedMonths);
      }

      if (detailsDoc.exists()) {
        const auctionTime = detailsDoc.data().auctionTime.toDate();
        setAuctionDetails(detailsDoc.data());
        setEstDateTime(auctionTime.toISOString().slice(0, 16)); // Format for datetime-local input
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const logsDoc = await getDoc(doc(db, "auctions", "logs"));
      if (logsDoc.exists()) {
        const logsData = logsDoc.data().logs || [];
        setLogs(logsData);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchMonthsDataAndAuctionTime();
    fetchLogs();
  }, []);

  const handleDateTimeChange = (e) => {
    setEstDateTime(e.target.value);
  };

  const handleQuantityChange = (index, newQuantity) => {
    setMonthsData((prevData) =>
      prevData.map((item, i) => (i === index ? [item[0], newQuantity] : item))
    );
  };

  const handleAddNewMonth = () => {
    setNewMonths((prev) => [...prev, [newMonth, newQuantity]]);
    setNewMonth('January');
    setNewQuantity('');
  };

  const handleDeleteNewMonth = (index) => {
    setNewMonths((prev) => prev.filter((_, i) => i !== index));
  };

  const saveData = async () => {
    setLoading(true);
    try {
      const auctionTime = new Date(estDateTime);
      await updateDoc(doc(db, "auctions", "auctionDetails"), {
        auctionTime: Timestamp.fromDate(auctionTime),
      });

      const updatedMonthsData = Object.fromEntries(monthsData);
      await updateDoc(doc(db, "auctions", "auction"), updatedMonthsData);

      console.log("Data successfully updated in Firestore.");
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuction = async () => {
    try {
      const newAuctionTime = new Date(newAuctionDateTime);

      // Clear the previous auction months data
      const auctionDoc = doc(db, "auctions", "auction");
      const auctionDocSnapshot = await getDoc(auctionDoc);
      if (auctionDocSnapshot.exists()) {
        const monthsToDelete = Object.keys(auctionDocSnapshot.data());
        const deleteFields = {};
        monthsToDelete.forEach((month) => {
          deleteFields[month] = deleteField();
        });
        await updateDoc(auctionDoc, deleteFields);
      }

      // Set the new auction time
      await setDoc(doc(db, "auctions", "auctionDetails"), {
        auctionTime: Timestamp.fromDate(newAuctionTime),
      });

      // Add the new months data
      const newAuctionData = Object.fromEntries(newMonths);
      await setDoc(auctionDoc, newAuctionData);

      // Clear the logs collection
      const logsDoc = doc(db, "auctions", "logs");
      await setDoc(logsDoc, { logs: [] });

      console.log("New auction created, months data updated, and logs cleared.");

      setOpenNewAuction(false);
      setNewMonths([]);
      fetchMonthsDataAndAuctionTime(); // Refresh the months and auction time

    } catch (error) {
      console.error("Error creating new auction and clearing logs:", error);
    }
};


  const handleAuctionStatusChange = async () => {
    try {
      await updateDoc(doc(db, "auctions", "auctionDetails"), {
        auctionRunning: !auctionDetails?.auctionRunning
      });
      setAuctionDetails((prevDetails) => ({
        ...prevDetails,
        auctionRunning: !prevDetails.auctionRunning,
      }));
    } catch (error) {
      console.error("Error updating auction status:", error);
    }
  };

  return (
    <div>
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', left: 0, top: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000, opacity: openNewAuction ? 1 : 0, pointerEvents: openNewAuction ? '' : 'none', transition: 'ease-in-out 0.3s all', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {openNewAuction && (
          <div style={{ maxWidth: '450px', height: '600px', borderRadius: '20px', border: '1px solid var(--border-color)', backgroundColor: 'var(--main-bg-color)', zIndex: '100000000000000' }}>
            <div style={{ padding: '0px 15px 0px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p>New Auction</p>
              <button onClick={() => setOpenNewAuction(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', width: '30px', borderRadius: '10px', backgroundColor: 'var(--btn-bg-color)', color: 'var(--main-color)', border: 'none', outline: 'none', cursor: 'pointer' }}><CgCloseO /></button>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <FaRegCalendar color='var(--sec-color)' size={14} style={{ position: 'absolute', pointerEvents: 'none', left: 179, bottom: 19 }} />
                <input
                  type="datetime-local"
                  value={newAuctionDateTime}
                  onChange={(e) => setNewAuctionDateTime(e.target.value)}
                  style={{ padding: '15px', backgroundColor: 'var(--main-bg-color)', color: 'var(--main-color)', outline: 'none', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', position: 'relative', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <div style={{ width: '100%', position: 'relative' }}>
                  <IoIosArrowDown color='var(--sec-color)' style={{ backgroundColor: 'var(--main-bg-color)', paddingRight: '10px', position: 'absolute', marginTop: '10.5px', pointerEvents: 'none', paddingTop: 5, paddingBottom: 5, zIndex: 100, right: 2 }} />
                  <select value={newMonth} onChange={(e) => setNewMonth(e.target.value)} style={{ padding: '15px', borderRadius: '10px', backgroundColor: 'var(--main-bg-color)', color: 'var(--main-color)', border: '1px solid var(--border-color)', width: '100%' }}>
                    {monthOrder.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="number"
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  placeholder="Quantity"
                  style={{ padding: '10px', borderRadius: '10px', width: '100%', backgroundColor: 'var(--main-bg-color)', color: 'var(--main-color)', outline: 'none', border: '1px solid var(--border-color)' }}
                />
                <button onClick={handleAddNewMonth} style={{ padding: '10px', backgroundColor: 'var(--btn-bg-color)', color: 'var(--main-color)', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>+</button>
              </div>

              <div style={{ marginTop: '20px', overflow: 'scroll', height: '290px' }}>
                {newMonths.map(([month, quantity], index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                    <span>{month}</span>
                    <span>{quantity} trucks</span>
                    <AiOutlineDelete onClick={() => handleDeleteNewMonth(index)} style={{ cursor: 'pointer', color: 'var(--main-color)', padding: '10px', backgroundColor: 'var(--btn-bg-color)', borderRadius: '10px' }} />
                  </div>
                ))}
              </div>

              <button onClick={handleCreateAuction} style={{ marginTop: '20px', padding: '10px', backgroundColor: 'var(--btn-bg-color)', color: 'var(--main-color)', borderRadius: '10px', cursor: 'pointer', width: '100%', outline: 'none', border: 'none' }}>
                Create Auction
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', width: 'calc(100% - 40px)', borderBottom: '1px solid var(--border-color)', padding: isSmallScreen ? '20px' : '0px 20px', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{display: isSmallScreen && 'none'}}>Dashboard</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setOpenNewAuction(true)} style={{ padding: '10px 40px', backgroundColor: 'var(--btn-bg-color)', color: 'var(--main-color)', border: 'none', outline: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>New Auction</button>
          <button onClick={toggleEdit} style={{ padding: '10px 40px', backgroundColor: 'var(--btn-bg-color)', color: 'var(--main-color)', border: 'none', outline: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>{editing ? 'Save' : 'Edit'}</button>
        </div>
      </div>

      <div style={{ width: '100%', display: isSmallScreen ? 'block' : 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: 'calc(100% - 40px)', padding: '10px 20px' }}>
          <div>
            <p style={{ color: 'var(--sec-color)' }}>Auction is {auctionDetails?.auctionRunning ? 'running' : 'not running'} right now</p>
            <button onClick={handleAuctionStatusChange} style={{ padding: '10px 40px', backgroundColor: !auctionDetails?.auctionRunning ? 'rgb(0, 35, 0)' : 'rgb(35, 0, 0)', color: !auctionDetails?.auctionRunning ? 'rgb(50, 255, 50)' : 'rgb(255, 50, 50)', border: 'none', outline: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>{auctionDetails?.auctionRunning ? 'End Auction' : 'Start Auction'}</button>
          </div>
          <div style={{ position: 'relative' }}>
            <p style={{ color: 'var(--sec-color)' }}>Auction Date & Time (EST/EDT)</p>
            {editing ? (
              <>
                <FaRegCalendar color='var(--sec-color)' size={14} style={{ position: 'absolute', pointerEvents: 'none', left: 180, bottom: 19 }} />
                <input
                  type="datetime-local"
                  value={estDateTime}
                  onChange={handleDateTimeChange}
                  style={{ padding: '15px', backgroundColor: 'var(--main-bg-color)', color: 'var(--main-color)', outline: 'none', border: '1px solid var(--border-color)', borderRadius: '10px' }}
                />
              </>
            ) : (
              <p>{new Date(estDateTime).toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
            )}
          </div>

          <div>
            <p style={{ color: 'var(--sec-color)' }}>Months & Quantity</p>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '20px' }}>
              {loading ? (
                <p style={{ marginLeft: '20px' }}>Loading months data...</p>
              ) : !editing ? (
                monthsData.map(([month, quantity], index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: monthsData.length - 1 === index ? 'none' : '1px solid var(--border-color)' }}>
                    <span>{month}</span>
                    <span>{quantity} trucks</span>
                  </div>
                ))
              ) : (
                monthsData.map(([month, quantity], index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: monthsData.length - 1 === index ? 'none' : '1px solid var(--border-color)' }}>
                    <span>{month}</span>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      style={{ padding: '10px', borderRadius: '10px', width: '80px', backgroundColor: 'var(--main-bg-color)', color: 'var(--main-color)', outline: 'none', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ width: isSmallScreen ? '' : '420px', borderLeft: isSmallScreen ? '' : '1px solid var(--border-color)', height: isSmallScreen ? '' : 'calc(100vh - 95px)', padding: '10px 20px', overflowY: 'scroll', display: 'flex', flexDirection: 'column-reverse' }}>
          {loadingLogs ? (
            <p>Loading logs...</p>
          ) : logs.length > 0 ? (
            logs.map((log, idx) => (
              <div key={idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '14px', color: 'var(--sec-color)' }}>
                  [{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}]
                </span>
                <span> {log.channel} bought {log.amount} trucks for {log.month} ({log.type})</span>
              </div>
            ))
          ) : (
            <span style={{textAlign: 'center', color: 'var(--sec-color)'}}>No logs found.</span>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
