import React, { useState } from "react";
import logo from "../assets/pandapay_logo.png";
import { Button, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useConfirmEmailMutation } from "../redux/services/auth";

const RegisterConfirmScreen: React.FC = () => {
  const [confirmEmailMutation] = useConfirmEmailMutation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [token, setToken] = useState("");
  const email = localStorage.getItem("email");
  if (!email) {
    navigate("/login");
    return null;
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center text-center">
      <img src={logo} style={{ alignSelf: "center" }} className="mb-5" />
      <p className="mb-5">Thank you for registering with PandaPay!</p>
      <p className="mb-5">
        An email confirmation has been sent to <b>{email}</b>
      </p>

      <Form className="mb-5 min-w-[300px]">
        <Form.Item>
          <Input
            placeholder="Enter verification number here..."
            onChange={(e) => setToken(e.target.value)}
          ></Input>
        </Form.Item>
      </Form>
      <Button
        type="primary"
        onClick={() =>
          confirmEmailMutation({ email: email, token: token })
            .unwrap()
            .then(() => {
              message.info("Email verified successfully!");
              navigate("/login");
            })
            .catch((error) => message.error(error.data.error))
        }
      >
        Confirm Email
      </Button>
    </div>
  );
};

export default RegisterConfirmScreen;
