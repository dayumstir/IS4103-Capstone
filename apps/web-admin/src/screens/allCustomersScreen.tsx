import React, { useEffect, useState }  from "react";
import {
  List,
  Typography,
  Spin,
  Avatar
} from "antd";
import { useNavigate  } from "react-router-dom";
const { Title, Text } = Typography;

interface ICustomer {
    customer_id: string;
    name: string;
    profile_picture: string;
    email: string;
    password: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    status: string;   
    credit_score: number;
    credit_tier_id: string;
}

const AllCustomersScreen: React.FC = () => {
    const [customers, setCustomers] = useState<ICustomer[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchAllCustomers = async () => {
        try {
            const jwt_token = localStorage.getItem('token');
            if (!jwt_token) {
              throw new Error('No token found');
            }
    
            const response = await fetch('http://localhost:3000/admin/allCustomers', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt_token}`,
              },
            });
            
          if (!response.ok) {
            throw new Error('Failed to fetch customers');
          }
  
          const data = await response.json();
          setCustomers(data);
        } catch (error) {
          console.error('Failed to fetch customers:', error);
        } finally {
          setLoading(false); // Update loading state
        }
      };
  
      fetchAllCustomers();
    }, [navigate]);
  
    if (loading) {
      return <Spin size="large" />; // Display loading spinner while fetching
    }
  
    if (error) {
      return <div>Error: {error}</div>; 
    }
  
    if (!customers || customers.length === 0) {
      return <div>No customer data available</div>; 
    }
  
    return (
      <div style={{ padding: '20px 100px' }}>
        <Title level={2}>All Customers</Title>
      <List
        itemLayout="horizontal"
        dataSource={customers}
        renderItem={(customer) => (
          <List.Item
            actions={[
              <a onClick={() => navigate(`/admin/customer/${customer.customer_id}`)}>View Profile</a>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={customer.profile_picture} />}
              title={<Text>{customer.name}</Text>}
              description={
                <div>
                  <Text>Email: {customer.email}</Text>
                </div>
              }
            />



          </List.Item>
        )} 
      />
      </div>
    );
  };
  
  export default AllCustomersScreen;