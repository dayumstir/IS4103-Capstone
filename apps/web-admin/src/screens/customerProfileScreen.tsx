import React, { useEffect, useState }  from "react";
import {
  Card,
  Typography,
  Spin,
  Avatar,
  Button
} from "antd";
import {
  EditOutlined,
  LeftOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

interface ICustomer {
    customer_id: string;
    name: string;
    profile_picture: string;
    email: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    status: string;
    credit_score: number;
    credit_tier_id: string;
  }

  const CustomerProfileScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Get customer_id from URL
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCustomerProfile = async () => {
          try {
            const jwt_token = localStorage.getItem("token");
            if (!jwt_token) {
              throw new Error("No token found");
            }
    
            const response = await fetch(`http://localhost:3000/customer/${id}`, {
              method: "GET",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt_token}`,
              },
            });
    
            if (!response.ok) {
              throw new Error("Failed to fetch customer profile");
            }
    
            const data = await response.json();
            setCustomer(data);
          } catch (error) {
            console.error("Failed to fetch customer profile:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchCustomerProfile();
      }, [id]);
    
      if (loading) {
        return <Spin size="large" />;
      }
    
      if (error) {
        return <div>Error: {error}</div>;
      }
    
      if (!customer) {
        return <div>No customer profile available</div>;
      }
    
      return (
        <div style={{ padding: '30px' }}>
          <LeftOutlined style={{ fontSize: '40px' }}
          onClick={() => navigate("/admin/customers")}/>
          <div style={{ padding: '20px 80px' }}>
            <Title level={2}>Customer Profile</Title>
            <Card
              style={{ width: 400 }}
              cover={<Avatar size={100} src={customer.profile_picture} />}
              actions={[<EditOutlined key="edit" />]}
            >
              <Title level={4}>{customer.name}</Title>
              <Text>Email: {customer.email}</Text>
              <br />
              <Text>Contact: {customer.contact_number}</Text>
              <br />
              <Text>Address: {customer.address}</Text>
              <br />
              <Text>Status: {customer.status}</Text>
              <br />
              <Text>Credit Score: {customer.credit_score}</Text>
              <br />
            </Card>
            {/* <Button onClick={() => navigate("/admin/customers")} type="primary">
                Back to Customers
              </Button> */}
            </div>
          
        </div>
      );
    };
    
    export default CustomerProfileScreen;