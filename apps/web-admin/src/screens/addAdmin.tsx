import { useState, useEffect } from "react";
import {
  Avatar,
  Form,
  Input,
  Button,
  Card,
  message,
  DatePicker,
  Upload,
  UploadProps,
  GetProp,
} from "antd";
import { PlusOutlined, UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { IAdmin } from "../../../backend/src/interfaces/adminInterface";
import { useAddAdminMutation } from "../redux/services/adminService";

export default function AddAdminScreen() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [profilePictureDisplay, setProfilePictureDisplay] = useState("");

  const [addAdmin, { isLoading }] = useAddAdminMutation();

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
        if (data.admin_type !== "SUPER") {
          navigate("/admin/profile");
          console.error("Invalid user");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  const validateContactNumber = (number: string) => {
    const contactNumberRegex = /^[689]\d{7}$/;
    return contactNumberRegex.test(number);
  };

  const validatePassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

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
              return Promise.reject(new Error("Invalid contact number format"));
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
        rules={[
          { required: true, message: "Please select the date of birth!" },
        ]}
      >
        <DatePicker style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="profile_picture" label="Profile Picture">
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

      <Form.Item>
        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
          Create Admin
        </Button>
      </Form.Item>
    </Form>
  );

  const handleCreateAdmin = async (values: IAdmin) => {
    const base64String = profilePictureDisplay.split(",")[1];

    const adminData: IAdmin = {
      ...values,
      profile_picture: base64String,
    };

    try {
      await addAdmin(adminData).unwrap();
      message.success(`New admin has been created.`);
      form.resetFields();
      setProfilePictureDisplay("");
    } catch (error) {
      message.error(`Error: ${error.message || "An unknown error occurred"}`);
    }
  };

  return (
    <div className="px-8 py-4">
      <Card className="mb-8 border border-gray-300" title="Create Admin">
        {renderForm()}
      </Card>
    </div>
  );
}
