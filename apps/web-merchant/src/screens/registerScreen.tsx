import React, { useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Space,
  Spin,
  Alert,
  InputNumber,
  Upload,
  FormProps,
  GetProp,
  UploadProps,
} from "antd";
import logo from "../assets/pandapay_logo.png";
import { useRegisterMutation } from "../redux/services/auth";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/authSlice";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, NavLink } from "react-router-dom";
import { message } from "antd";
import {
  DetailsProps,
  EmailNameProps,
  PasswordProps,
  RegisterFormValues,
} from "../interfaces/registerFormInterface";

enum pageType {
  EmailUsername = 0,
  Password = 1,
  Details = 2,
  Documents = 3,
}

const RegisterScreen: React.FC = () => {
  const { Title } = Typography;
  const [pageIdx, setPageIdx] = useState(pageType.EmailUsername);
  const [form] = Form.useForm();

  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState();
  const [profilePictureDisplay, setProfilePictureDisplay] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  return (
    <Space
      direction="vertical"
      className="flex h-screen items-center justify-center"
    >
      <img src={logo} width="100%" style={{ alignSelf: "center" }} />
      <Title>PandaPay</Title>
      <Title level={3}>Your ultimate BNPL Provider</Title>
      <Card style={{ backgroundColor: "#F5F5F5" }}>
        {pageIdx == pageType.EmailUsername && (
          <EmailNameForm
            form={form}
            name={name}
            email={email}
            setName={setName}
            setEmail={setEmail}
            setPageIdx={setPageIdx}
          />
        )}
        {pageIdx == pageType.Password && (
          <Password
            form={form}
            password={password}
            setPassword={setPassword}
            setPageIdx={setPageIdx}
          />
        )}
        {pageIdx == pageType.Details && (
          <Details
            form={form}
            name={name}
            email={email}
            profilePicture={profilePicture}
            profilePictureDisplay={profilePictureDisplay}
            password={password}
            contactNumber={contactNumber}
            setContactNumber={setContactNumber}
            setProfilePicture={setProfilePicture}
            setProfilePictureDisplay={setProfilePictureDisplay}
            setAddress={setAddress}
            address={address}
            setPageIdx={setPageIdx}
          />
        )}
      </Card>
    </Space>
  );
};

export default RegisterScreen;

const EmailNameForm = ({
  form,
  email,
  name,
  setName,
  setEmail,
  setPageIdx,
}: EmailNameProps) => {
  const { Text } = Typography;

  const onFinish: FormProps<RegisterFormValues>["onFinish"] = async (data) => {
    if (data.name && data.email) {
      setName(data.name);
      setEmail(data.email);
      setPageIdx(pageType.Password);
    }
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      style={{ minWidth: 600 }}
      onFinish={onFinish}
      autoComplete="off"
      form={form}
    >
      <Form.Item<RegisterFormValues>
        name="email"
        label="E-mail"
        initialValue={email}
        rules={[
          {
            type: "email",
            message: "The input is not valid E-mail!",
          },
          {
            required: true,
            message: "Please input your E-mail!",
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item<RegisterFormValues>
        name="name"
        label="Full Name"
        initialValue={name}
        rules={[
          {
            required: true,
            message: "Please input your username!",
            whitespace: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Continue Register
        </Button>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 30 }}>
        <Text>
          Have an account already? <NavLink to="/login">Click to Login</NavLink>
        </Text>
      </Form.Item>
    </Form>
  );
};

const Password = ({
  form,
  password,
  setPassword,
  setPageIdx,
}: PasswordProps) => {
  const onFinish: FormProps<RegisterFormValues>["onFinish"] = async (data) => {
    if (data.password && data.password) {
      setPassword(data.password);
      setPageIdx(pageType.Details);
    }
  };
  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      style={{ minWidth: 600 }}
      //   initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
      form={form}
    >
      <Form.Item<RegisterFormValues>
        name="password"
        label="Password"
        initialValue={password}
        rules={[
          {
            required: true,
            message: "Please input your password!",
          },
        ]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={["password"]}
        hasFeedback
        rules={[
          {
            required: true,
            message: "Please confirm your password!",
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The new password that you entered do not match!"),
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button
          type="primary"
          onClick={() => setPageIdx(pageType.EmailUsername)}
          style={{ marginRight: 10 }}
        >
          Back
        </Button>

        <Button type="primary" htmlType="submit">
          Next
        </Button>
      </Form.Item>

      <Form.Item></Form.Item>
    </Form>
  );
};

const Details = ({
  form,
  name,
  email,
  profilePicture,
  profilePictureDisplay,
  password,
  address,
  contactNumber,
  setProfilePicture,
  setProfilePictureDisplay,
  setContactNumber,
  setAddress,
  setPageIdx,
}: DetailsProps) => {
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formData = new FormData();

  const onFinish: FormProps<RegisterFormValues>["onFinish"] = async (data) => {
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("contact_number", data.contact_number);
    formData.append("address", data.address);
    profilePicture && formData.append("profile_picture", profilePicture);
    const result = await registerMutation(formData);
    if (result.data) {
      dispatch(login({ merchantId: result.data.merchant_id }));
      navigate("/");
    }
  };

  const [loading, setLoading] = useState(false);

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      info.file.originFileObj &&
        formData.append("profile_picture", info.file.originFileObj);
      setProfilePicture(info.file.originFileObj);
      setLoading(true);
      return;
    }
  };
  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const beforeUpload = (file: FileType) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must smaller than 2MB!");
    }

    return isJpgOrPng && isLt2M;
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      style={{ minWidth: 600 }}
      onFinish={onFinish}
      autoComplete="off"
      form={form}
    >
      <Form.Item<RegisterFormValues>
        name="contact_number"
        label="Contact Number"
        initialValue={contactNumber}
        rules={[{ required: true }]}
      >
        <InputNumber
          onChange={(contactNumber) =>
            contactNumber && setContactNumber(contactNumber.toString())
          }
        />
      </Form.Item>

      <Form.Item<RegisterFormValues>
        name="address"
        label="Address"
        initialValue={address}
        rules={[
          {
            required: true,
            message: "Please input your address!",
            whitespace: true,
          },
        ]}
      >
        <Input onChange={(e) => setAddress(e.target.value)} />
      </Form.Item>

      <Form.Item<RegisterFormValues>
        label="Profile Picture"
        rules={[{ required: false }]}
      >
        <Upload
          name="avatar"
          listType="picture-circle"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onChange={handleChange}
          customRequest={({ file }) => {
            setProfilePictureDisplay(file);
          }}
        >
          {profilePictureDisplay ? (
            <img
              src={URL.createObjectURL(profilePictureDisplay)}
              alt="avatar"
              style={{ width: "100%" }}
            />
          ) : (
            <button style={{ border: 0, background: "none" }} type="button">
              {loading ? <LoadingOutlined /> : <PlusOutlined />}
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          )}
        </Upload>
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
        <Button
          type="primary"
          onClick={() => setPageIdx(pageType.Password)}
          style={{ marginRight: 10 }}
        >
          Back
        </Button>
        {isLoading ? (
          <Spin indicator={<LoadingOutlined spin />} />
        ) : (
          <Space>
            <Button type="primary" htmlType="submit">
              Register
            </Button>
            {error ? (
              <Alert
                message="Registeration Failed. Please try again!"
                type="error"
                style={{ height: 35 }}
              />
            ) : (
              <></>
            )}
          </Space>
        )}
      </Form.Item>
    </Form>
  );
};
