import React, { useState } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Form, Input, Button, Radio, DatePicker, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import '../scss/_registerpage.scss';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationDescription, setOrganizationDescription] = useState('');
  const [userRole, setUserRole] = useState('buyer');
  const [birthday, setBirthday] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData = {
        email: email,
        role: userRole,
        birthday: birthday ? birthday.format('YYYY-MM-DD') : '',
        ...(userRole === 'seller' && {
          organizationName,
          organizationDescription,
        }),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      message.success('Account created successfully!');
      resetForm();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userData = {
        email: user.email,
        role: 'buyer',
        profilePic: user.photoURL || '',
        birthday: '',
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      message.success('Account created successfully with Google!');
      resetForm();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.code === 'auth/network-request-failed') {
      message.error('Network error. Please check your internet connection and try again.');
    } else {
      message.error(`Error: ${error.message}`);
    }
    console.error('Error details:', error);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setOrganizationName('');
    setOrganizationDescription('');
    setUserRole('buyer');
    setBirthday(null);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-heading">Create EventPass Account</h2>
        <p className="register-subtitle">Join our event management platform</p>
      
        <Form onFinish={handleRegister} layout="vertical" className="register-form">
          <Form.Item label="I want to:" required>
            <Radio.Group
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="role-selector"
            >
              <Radio value="buyer">Attend Events</Radio>
              <Radio value="seller">Organize Events</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field"
            />
          </Form.Item>
          <Form.Item label="Password" required>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="input-field"
            />
          </Form.Item>
          <Form.Item label="Birthday">
            <DatePicker
              value={birthday}
              onChange={(date) => setBirthday(date)}
              className="date-picker"
              placeholder="Select your birthday"
            />
          </Form.Item>
          {userRole === 'seller' && (
            <>
              <Form.Item label="Organization Name" required>
                <Input
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Enter your organization name"
                  className="input-field"
                />
              </Form.Item>
              <Form.Item label="Organization Description">
                <Input.TextArea
                  value={organizationDescription}
                  onChange={(e) => setOrganizationDescription(e.target.value)}
                  placeholder="Tell us about your organization"
                  className="input-field"
                  rows={3}
                />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Button 
              htmlType="submit" 
              loading={loading} 
              className="register-button"
              size="large"
            >
              Create Account
            </Button>
          </Form.Item>
          <div className="divider">
            <span>Or continue with</span>
          </div>
          <Form.Item>
            <Button
              icon={<GoogleOutlined />}
              onClick={handleGoogleLogin}
              loading={loading}
              className="google-button"
              size="large"
            >
              Google
            </Button>
          </Form.Item>
          <Form.Item className="login-redirect">
            <span>Already have an account? </span>
            <a href="/login" className="login-link">Sign in</a>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Register;