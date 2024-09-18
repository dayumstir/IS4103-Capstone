import React, { useEffect, useState }  from "react";
import {
  Card,
  Typography,
  Spin,
  Button 
} from "antd";
import { useNavigate  } from "react-router-dom";
const { Title, Text } = Typography;

interface AdminProfileData {
    username: string;
    email: string;
    name: string;
    contact_number: string;
    address: string;
    date_of_birth: string;
  }

  const ProfileScreen: React.FC = () => {
    const [user, setUser] = useState<AdminProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchUserProfile = async () => {
        try {
          const jwt_token = localStorage.getItem('token');
          if (!jwt_token) {
            throw new Error('No token found');
          }
  
          const response = await fetch('http://localhost:3000/admin/profile', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${jwt_token}`,
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }
  
          const data = await response.json();
          setUser(data);
        } catch (error) {
          console.error('Failed to fetch user information:', error);
          navigate('/login'); // Redirect to login if fetch fails
        } finally {
          setLoading(false); // Update loading state
        }
      };
  
      fetchUserProfile();
    }, [navigate]);
  
    if (loading) {
      return <Spin size="large" />; // Display loading spinner while fetching
    }
  
    if (error) {
      return <div>Error: {error}</div>; 
    }
  
    if (!user) {
      return <div>No user data available</div>; 
    }
  
    return (
      <div style={{ padding: '20px' }}>
        <Card title="Admin Profile" style={{ width: 300 }}>
          <Title level={4}>Username</Title>
          <Text>{user.username}</Text>
          <Title level={4}>Email</Title>
          <Text>{user.email}</Text>
          <Title level={4}>Name</Title>
          <Text>{user.name}</Text>
          <Title level={4}>Contact Number</Title>
          <Text>{user.contact_number}</Text>
          <Title level={4}>Address</Title>
          <Text>{user.address}</Text>
          <Title level={4}>Date of Birth</Title>
          <Text>{user.date_of_birth}</Text>
          {}

        <Button 
          type="primary" 
          style={{ marginTop: 16 }} 
          onClick={() => navigate('/admin/editprofile')}
        >
          Edit Profile
        </Button>
        <Button
          type="default"
          style={{ marginTop: 16, marginLeft: 8 }}
          onClick={() => navigate('/admin/resetpassword')}
        >
          Reset Password
        </Button>
        </Card>
      </div>
    );
  };
  
  export default ProfileScreen;
  