import React, { useState, useEffect } from "react";
import type { FormProps } from "antd";
import { Button, Card, Form, Input, Space, Typography, message } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

type FieldType = {
  email?: string;
  contact_number?: string;
  address?: string;
  profile_picture?: string;
};

const EditProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [, setError] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState({

    email: '',
    contact_number: '',
    address: '',
    profile_picture: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('http://localhost:3000/admin/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setInitialValues({
          email: data.email,
          contact_number: data.contact_number,
          address: data.address,
          profile_picture: data.profile_picture,
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Could not fetch profile data. Please try again later.');
      }
    };

    fetchProfileData();
  }, []);

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const { email, contact_number, address, profile_picture } = values;

    try {
      const response = await fetch('http://localhost:3000/admin/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, contact_number, address, profile_picture }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    // Show success message
    message.success('Profile updated successfully!');
    navigate('/admin/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Could not update profile. Please try again.');
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateContactNumber = (number: string) => {
    const contactNumberRegex = /^[689]\d{7}$/;
    return contactNumberRegex.test(number);
  };

  return (
    <Space direction="vertical" className="flex h-screen items-start justify-start pl-4 pt-4">
      <Title level={3}>Edit Profile</Title>
      <Card style={{ backgroundColor: '#F5F5F5' }}>
        <Form
          key={JSON.stringify(initialValues)} 
          name="editProfile"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          initialValues={initialValues}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input your email' },
                {
                  validator: (_, value) => {
                    if (validateEmail(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Invalid email format"));
                  },
                },
              ]}
            >
            <Input />
          </Form.Item>

          <Form.Item
            label="Contact Number"
            name="contact_number"
            rules={[
                {
                  required: true,
                  message: "Please input your contact number",
                },
                {
                  validator: (_, value) => {
                    if (validateContactNumber(value)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Invalid contact number format"));
                  },
                },
              ]}
            >
            <Input />
          </Form.Item>

          <Form.Item
            label="Address"
            name="address"
            rules={[{ required: true, message: 'Please input your address' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Profile Picture"
            name="profile_picture"
            rules={[{ required: true, message: 'Please input your profile picture' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  );
};

export default EditProfileScreen;
