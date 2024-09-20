import React, { useEffect, useState }  from "react";
import {
  Card,
  Typography,
  Spin,
  Avatar
} from "antd";
import {
  EditOutlined,
  LeftOutlined
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
const { Title, Text } = Typography;

interface IMerchant {
    merchant_id: string;
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

  const MerchantProfileScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [merchant, setMerchant] = useState<IMerchant | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMerchantProfile = async () => {
          try {
            const jwt_token = localStorage.getItem("token");
            if (!jwt_token) {
              throw new Error("No token found");
            }
    
            const response = await fetch(`http://localhost:3000/merchant/${id}`, {
              method: "GET",
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt_token}`,
              },
            });
    
            if (!response.ok) {
              throw new Error("Failed to fetch merchant profile");
            }
    
            const data = await response.json();
            setMerchant(data);
          } catch (error) {
            console.error("Failed to fetch merchant profile:", error);
          } finally {
            setLoading(false);
          }
        };
    
        fetchMerchantProfile();
      }, [id]);
    
      if (loading) {
        return <Spin size="large" />;
      }
    
      if (error) {
        return <div>Error: {error}</div>;
      }
    
      if (!merchant) {
        return <div>No merchant profile available</div>;
      }
    
      return (
        <div style={{ padding: '30px' }}>
          <LeftOutlined style={{ fontSize: '40px' }}
          onClick={() => navigate("/admin/merchants")}/>
          <div style={{ padding: '20px 80px' }}>
            <Title level={2}>Merchant Profile</Title>
            <Card
              cover={<Avatar size={100} src={merchant.profile_picture} />}
              actions={[<EditOutlined key="edit" style={{ fontSize: '30px' }}/>]}
            >
              <Title level={4}>{merchant.name}</Title>
              <Text>Email: {merchant.email}</Text>
              <br />
              <Text>Contact: {merchant.contact_number}</Text>
              <br />
              <Text>Address: {merchant.address}</Text>
              <br />
              <Text>Status: {merchant.status}</Text>
              <br />
            </Card>
            </div>
          
        </div>
      );
    };
    
    export default MerchantProfileScreen;