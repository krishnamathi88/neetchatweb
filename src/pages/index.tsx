import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast, { Toaster } from 'react-hot-toast';
import NeetChatbot from "@/components/NeetChatbot";
import styles from '@/styles/SignIn.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1: email entry, 2: code verification
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication on initial load
  useEffect(() => {
    const authStatus = localStorage.getItem('authenticated');
    if (authStatus) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSendCode = async () => {
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        toast.success('Verification code sent to your email');
        setStep(2);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to send code');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 4) {
      toast.error('Please enter a valid 4-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (response.ok) {
        toast.success('Verification successful!');
        localStorage.setItem('authenticated', 'true');
        setIsAuthenticated(true);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Invalid verification code');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div>
        <div className={styles.header}>
          <h1>NEET Chatbot</h1>
          <button 
            onClick={() => {
              localStorage.removeItem('authenticated');
              setIsAuthenticated(false);
              setStep(1);
              setEmail('');
            }}
            className={styles.logoutButton}
          >
            Sign Out
          </button>
        </div>
        <NeetChatbot />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Toaster position="top-center" />
      <div className={styles.card}>
        <h1>Welcome to NEET Chatbot</h1>
        
        {step === 1 ? (
          <>
            <p>Enter your email to receive a verification code</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={styles.input}
            />
            <button
              onClick={handleSendCode}
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        ) : (
          <>
            <p>We sent a 4-digit code to {email}</p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="1234"
              maxLength={4}
              className={styles.input}
            />
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className={styles.button}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button
              onClick={() => setStep(1)}
              className={styles.secondaryButton}
            >
              Use different email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
