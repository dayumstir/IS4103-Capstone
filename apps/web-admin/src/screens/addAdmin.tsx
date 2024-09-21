import React, { useEffect }  from "react";
import {
  Form,
  Input,
  Button,
  Card,
  message,
  DatePicker,
  Upload,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IAdmin } from "../../../backend/src/interfaces/adminInterface";

const AdminManagementScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if(data.admin_type !== 'SUPER') {
          navigate("/admin/profile");
          console.error("Invalid user");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const [form] = Form.useForm();

  const createAdminMutation = useMutation({
    mutationFn: async (newAdmin: IAdmin) => {
      const response = await fetch('http://localhost:3000/adminAuth/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin),
      });
  
      if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.error || 'An unknown error occurred'); 
      }
      
      return response.json();
    },
    onSuccess: () => {
      message.success(`New admin has been created.`);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Error: ${error.message}`); 
    },
  });
  const handleCreateAdmin = (values: IAdmin) => {
    createAdminMutation.mutate(values);
  };

  const validateContactNumber = (number: string) => {
    const contactNumberRegex = /^[689]\d{7}$/;
    return contactNumberRegex.test(number);
  };
  
  const renderForm = () => (
    <Form
      form={form}
      name="admin"
      onFinish={handleCreateAdmin}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="Admin Name"
        rules={[{ required: true, message: "Please input the admin name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please input the email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="username"
        label="Username"
        rules={[{ required: true, message: "Please input the username!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: "Please input the password!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="contact_number"
        label="Contact Number"
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
              return Promise.reject(
                new Error("Invalid contact number format"),
              );
            },
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="address"
        label="Address"
        rules={[{ required: true, message: "Please input the address!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="date_of_birth"
        label="Date of Birth"
        rules={[{ required: true, message: "Please select the date of birth!" }]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="profile_picture" label="Profile Picture">
        <Upload beforeUpload={() => false}>
          <Button>Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Create Admin
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div className="px-8 py-4">
      <Card className="mb-8 border border-gray-300" title="Create Admin">
        {renderForm()}
      </Card>
    </div>
  );
};

export default AdminManagementScreen;
