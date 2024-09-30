import { React, useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Loader from '../shared/UI/Loader';

const AdminAuth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const submit = async (e) => {
        setLoading(true)
        e.preventDefault();
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate('/admin');
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '400px', margin: 'auto', height: '100vh', padding: '10px' }}>
            {loading ?
                <div>
                    <Loader/>
                </div>
                :
                <div style={{ backgroundColor: 'var(--main-bg-color)', display: 'flex', flexDirection: 'column', width: '100%', gap: '10px', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                    <div style={{ borderBottom: '1px solid var(--border-color)', padding: '20px' }}>
                        <h3 style={{ margin: 0 }}>Admin authorization</h3>
                        <p style={{ margin: 0, color: 'var(--sec-color)' }}>Log In to your admin account</p>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', width: 'calc(100% - 40px)', gap: '30px' }}>
                        <input style={{padding: '15px', border: '1px solid var(--border-color)', borderRadius :'10px', outline: 'none', backgroundColor: 'var(--main-bg-color)', color: 'var(--main-color)'}} value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Login' />
                        <input style={{padding: '15px', border: '1px solid var(--border-color)', borderRadius :'10px', outline: 'none', backgroundColor: 'var(--main-bg-color)', color: 'var(--main-color)'}} value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' />
                        <button onClick={submit} style={{ width: '100%', padding: '15px 20px', borderRadius: '10px', outline: 'none', border: 'none', backgroundColor: 'var(--btn-bg-color)', color: 'var(--main-color)' }}>Log In</button>
                    </div>
                </div>
            }
        </div>
    )
}

export default AdminAuth