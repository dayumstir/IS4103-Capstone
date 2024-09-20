import React, { useEffect, useState }  from "react";
import {
  List,
  Typography,
  Spin,
  Avatar
} from "antd";
import { useNavigate  } from "react-router-dom";
const { Title, Text } = Typography;

interface IMerchant {
    merchant_id: string;
    name: string;
    profile_picture: string;
    email: string;
    password: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    status: string;
}

const AllMerchantsScreen: React.FC = () => {
    const [merchants, setMerchants] = useState<IMerchant[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchAllMetchants = async () => {
        try {
            const jwt_token = localStorage.getItem('token');
            if (!jwt_token) {
              throw new Error('No token found');
            }
    
            const response = await fetch('http://localhost:3000/admin/allMerchants', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt_token}`,
              },
            });
            
          if (!response.ok) {
            throw new Error('Failed to fetch merchants');
          }
  
          const data = await response.json();
          setMerchants(data);
        } catch (error) {
          console.error('Failed to fetch merchants:', error);
        } finally {
          setLoading(false); // Update loading state
        }
      };
  
      fetchAllMerchants();
    }, [navigate]);
  
    if (loading) {
      return <Spin size="large" />; // Display loading spinner while fetching
    }
  
    if (error) {
      return <div>Error: {error}</div>; 
    }
  
    if (!merchants || merchants.length === 0) {
      return <div>No merchant data available</div>; 
    }
  
    return (
      <div style={{ padding: '20px 100px' }}>
        <Title level={2}>All Merchants</Title>
      <List
        itemLayout="horizontal"
        dataSource={merchants}
        renderItem={(merchant) => (
          <List.Item
            actions={[
              <a onClick={() => navigate(`/admin/merchant/${merchant.merchant_id}`)}>View Profile</a>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={merchant.profile_picture} />}
              title={<Text>{merchant.name}</Text>}
              description={
                <div>
                  <Text>Email: {merchant.email}</Text>
                </div>
              }
            />



          </List.Item>
        )} 
      />
      </div>
    );
  };
  
  export default AllMerchantsScreen;