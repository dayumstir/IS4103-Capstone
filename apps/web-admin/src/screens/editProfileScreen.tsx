import React, { useState, useEffect } from "react";
import type { FormProps } from "antd";
import { Avatar, Button, Card, Form, Input, Space, GetProp, Typography, message, Upload, UploadProps} from "antd";
import { useNavigate } from "react-router-dom";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { Buffer } from 'buffer';

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
    email: "",
    contact_number: "",
    address: "",
    profile_picture: "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

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
        const profilePictureBase64 = `data:image/png;base64,${Buffer.from(data.profile_picture).toString("base64")}`;
        setProfilePictureDisplay(profilePictureBase64);

      setInitialValues({
          email: data.email,
          contact_number: data.contact_number,
          address: data.address,
          profile_picture: data.profile_picture,
        }); 

      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Could not fetch profile data. Please try again later.");
      }
    };

    fetchProfileData();
  }, []);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { email, contact_number, address } = values;
    try {
      const response = await fetch("http://localhost:3000/admin/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          contact_number,
          address,
          profile_picture: profilePictureDisplay.split(",")[1],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Show success message
      message.success("Profile updated successfully!");
      navigate("/admin/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Could not update profile. Please try again.");
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  const [profilePictureDisplay, setProfilePictureDisplay] = useState("");
  
  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        // The result is a Base64 string
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      // Read the file as a Data URL (Base64)
      reader.readAsDataURL(file);
      
    });
  };

  const handleChange: UploadProps["onChange"] = async (info) => {
    if (info.file.originFileObj) {
      setProfilePicture(info.file.originFileObj);
      const base64String = await convertImageToBase64(info.file.originFileObj);
      setProfilePictureDisplay(base64String);
      return;
    }
    return;
  };
  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }

    return isJpgOrPng && isLt2M;
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
    <Space
      direction="vertical"
      className="flex h-screen items-start justify-start pl-4 pt-4"
    >
      <Title level={3}>Edit Profile</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
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
            rules={[
              { required: true, message: "Please input your email" },
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
            label="Address"
            name="address"
            rules={[{ required: true, message: "Please input your address" }]}
          >
            <Input />
          </Form.Item>

        <Form.Item
          name="profile_picture"
          label="Profile Picture"
        >
          <div className="flex items-center">
            {profilePictureDisplay ? (
              <img
                src={profilePictureDisplay}
                alt="avatar1"
                className="h-36 w-36 object-cover"
              />
            ) : (
              <Avatar
                className="h-36 w-36 object-cover"
                icon={<UserOutlined />}
              />
            )}
            <Upload
              className="ml-5"
              beforeUpload={beforeUpload}
              onChange={handleChange}
              customRequest={() => {}}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </div>
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
