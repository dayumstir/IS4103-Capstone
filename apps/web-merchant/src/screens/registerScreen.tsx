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
import {
  useCheckEmailInUseMutation,
  useRegisterMutation,
  useSendPhoneNumberOTPMutation,
  useVerifyPhoneNumberOTPMutation,
} from "../redux/services/auth";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, NavLink } from "react-router-dom";
import { message } from "antd";
import {
  DetailsProps,
  EmailNameProps,
  PasswordProps,
  RegisterFormValues,
} from "../interfaces/registerFormInterface";
import PendingEmailConfirmationModal from "../components/pendingEmailConfirmationModal";

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
  // const [profilePicture, setProfilePicture] = useState();
  // const [profilePictureDisplay, setProfilePictureDisplay] = useState("");
  const [
    pendingEmailConfirmationModalOpen,
    setPendingEmailConfirmationModalOpen,
  ] = useState(false);

  const [otpVerified, setOtpVerified] = useState(false);
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
            pendingEmailConfirmationModalOpen={
              pendingEmailConfirmationModalOpen
            }
            setName={setName}
            setEmail={setEmail}
            setPageIdx={setPageIdx}
            setPendingEmailConfirmationModalOpen={
              setPendingEmailConfirmationModalOpen
            }
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
            otpVerified={otpVerified}
            name={name}
            email={email}
            password={password}
            contactNumber={contactNumber}
            setOtpVerified={setOtpVerified}
            setContactNumber={setContactNumber}
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
  pendingEmailConfirmationModalOpen,
  setName,
  setEmail,
  setPageIdx,
  setPendingEmailConfirmationModalOpen,
}: EmailNameProps) => {
  const { Text } = Typography;

  const [checkEmailInUseMutation] = useCheckEmailInUseMutation();

  const onFinish: FormProps<RegisterFormValues>["onFinish"] = async (data) => {
    if (data.name && data.email) {
      await checkEmailInUseMutation({ email: data.email })
        .unwrap()
        .then(() => {
          setName(data.name);
          setEmail(data.email);
          setPageIdx(pageType.Password);
        })
        .catch((error) => {
          if (error.data.error == "Email pending verification") {
            localStorage.setItem("email", data.email);
            setPendingEmailConfirmationModalOpen(true);
          }
          message.error(error.data.error);
        });
    }
  };

  return (
    <div>
      {pendingEmailConfirmationModalOpen && (
        <PendingEmailConfirmationModal
          isModalOpen={pendingEmailConfirmationModalOpen}
          setModalOpen={setPendingEmailConfirmationModalOpen}
        />
      )}

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
            Have an account already?{" "}
            <NavLink to="/login">Click to Login</NavLink>
          </Text>
        </Form.Item>
      </Form>
    </div>
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
          {
            validator: (_, value) => {
              if (!value) {
                return Promise.reject(new Error("Please input your password!"));
              }
              // Check for at least one capital letter and minimum 8 characters
              const isValid = value.length >= 8 && /[A-Z]/.test(value);
              if (!isValid) {
                return Promise.reject(
                  new Error(
                    "Password must be at least 8 characters long and contain at least one capital letter!",
                  ),
                );
              }
              return Promise.resolve();
            },
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
  password,
  address,
  otpVerified,
  setOtpVerified,
  contactNumber,
  setContactNumber,
  setAddress,
  setPageIdx,
}: DetailsProps) => {
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const [sendPhoneNumberOTPMutation] = useSendPhoneNumberOTPMutation();
  const [VerifyPhoneNumberOTPMutation] = useVerifyPhoneNumberOTPMutation();
  const navigate = useNavigate();
  const formData = new FormData();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  // const [otpVerified, setOtpVerified] = useState(false);

  const onFinish: FormProps<RegisterFormValues>["onFinish"] = async (data) => {
    if (!otpVerified) {
      message.error("Contact Number is not verified yet");
      return;
    }
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("contact_number", data.contact_number);
    formData.append("address", data.address);
    // profilePicture && formData.append("profile_picture", profilePicture);
    await registerMutation(formData)
      .unwrap()
      .then(() => {
        localStorage.setItem("email", email);
        navigate("/register-confirm");
      })
      .catch((error) => message.error(error.data.error));
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
      <Form.Item
        label="Contact Number"
        name="contact_number"
        rules={[{ required: true }]}
      >
        {form.getFieldValue("contact_number") != "" && isOtpSent ? (
          <p>{form.getFieldValue("contact_number")}</p>
        ) : (
          <Input
            onChange={(contactNumber) =>
              contactNumber && setContactNumber(contactNumber.toString())
            }
          />
        )}
      </Form.Item>
      <Form.Item
        rules={[{ required: true }]}
        wrapperCol={{ offset: 6, span: 16 }}
      >
        <div className="flex items-center justify-end">
          {isOtpSent ? (
            <Input
              placeholder="Enter OTP..."
              onChange={(e) => setOtp(e.target.value)}
            />
          ) : undefined}
          {isOtpSent ? (
            <div className="flex items-center">
              <Button
                type="default"
                className="ml-5"
                onClick={() =>
                  sendPhoneNumberOTPMutation({
                    contact_number: form.getFieldValue("contact_number"),
                  })
                    .unwrap()
                    .then(() => {
                      const num = form.getFieldValue("contact_number");
                      message.info("OTP Sent to " + num);
                      setIsOtpSent(true);
                    })
                    .catch((error) => message.error(error.data.error))
                }
              >
                Resend OTP
              </Button>
              <Button
                type="default"
                className="ml-5"
                onClick={() =>
                  VerifyPhoneNumberOTPMutation({
                    contact_number: form.getFieldValue("contact_number"),
                    otp: otp,
                  })
                    .unwrap()
                    .then(() => {
                      message.info("OTP Verified");
                      setOtpVerified(true);
                    })
                    .catch((error) => message.error(error.data.error))
                }
              >
                Verify OTP
              </Button>
            </div>
          ) : otpVerified ? (
            <p>Contact Number Verified</p>
          ) : (
            <Button
              type="default"
              className="ml-5"
              onClick={() =>
                sendPhoneNumberOTPMutation({
                  contact_number: form.getFieldValue("contact_number"),
                })
                  .unwrap()
                  .then(() => {
                    const num = form.getFieldValue("contact_number");
                    message.info("OTP Sent to " + num);
                    setIsOtpSent(true);
                  })
                  .catch((error) => message.error(error.data.error))
              }
            >
              Send OTP
            </Button>
          )}
        </div>
      </Form.Item>
      {/* </Form.Item> */}

      {/* <Form.Item style={{ marginBottom: 0 }}>
        <Form.Item<RegisterFormValues>
          name="contact_number"
          label="Contact Number"
          initialValue={contactNumber}
          rules={[{ required: true }]}
          style={{ display: "inline-block" }}
        >
          <Input
            onChange={(contactNumber) =>
              contactNumber && setContactNumber(contactNumber.toString())
            }
          />
        </Form.Item>
        <Form.Item<RegisterFormValues>
          name="contact_number"
          initialValue={contactNumber}
          rules={[{ required: true }]}
          style={{ display: "inline-block" }}
        >
          <div className="flex items-center">
            {isOtpSent ? (
              <Input
                className="ml-5"
                placeholder="Enter OTP..."
                onChange={(e) => setOtp(e.target.value)}
              />
            ) : undefined}
            {isOtpSent ? (
              <div className="flex items-center">
                <Button type="default" className="ml-5">
                  Resend OTP
                </Button>
                <Button
                  type="default"
                  className="ml-5"
                  onClick={() =>
                    VerifyPhoneNumberOTPMutation({
                      contact_number: form.getFieldValue("contact_number"),
                      otp: otp,
                    })
                      .unwrap()
                      .then(message.info("OTP Verified"))
                      .catch((error) => message.error(error.data.error))
                  }
                >
                  Verify OTP
                </Button>
              </div>
            ) : (
              <Button
                type="default"
                className="ml-5"
                onClick={() =>
                  sendPhoneNumberOTPMutation({
                    contact_number: form.getFieldValue("contact_number"),
                  })
                    .unwrap()
                    .then(() => {
                      const num = form.getFieldValue("contact_number");
                      message.info("OTP Sent to " + { num });
                      setIsOtpSent(true);
                    })
                    .catch((error) => message.error(error.data.error))
                }
              >
                Send OTP
              </Button>
            )}
          </div>
        </Form.Item>
      </Form.Item> */}

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
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};
