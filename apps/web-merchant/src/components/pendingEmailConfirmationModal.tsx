import React, { useState } from "react";
import logo from "../assets/pandapay_logo.png";
import { Button, Form, Input, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useConfirmEmailMutation,
  useResendEmailConfirmationMutation,
} from "../redux/services/auth";

interface PendingEmailConfirmationModal {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}
const PendingEmailConfirmationModal = ({
  isModalOpen,
  setModalOpen,
}: PendingEmailConfirmationModal) => {
  const [confirmEmailMutation] = useConfirmEmailMutation();
  const [resendEmailConfirmationMutation] =
    useResendEmailConfirmationMutation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [token, setToken] = useState("");
  const email = localStorage.getItem("email");
  if (!email) {
    navigate("/login");
    return null;
  }

  return (
    <Modal
      title="Confirm Email"
      open={isModalOpen}
      onOk={() => {
        confirmEmailMutation({ email: email, token: token })
          .unwrap()
          .then(() => {
            message.info("Email verified successfully!");
            setModalOpen(false);
            navigate("/login");
          })
          .catch((error) => message.error(error.data.error));
      }}
      //   okButtonProps={{ style: { display: "none" } }}
      cancelText="Cancel"
      okText="Confirm Email"
      onCancel={() => setModalOpen(false)}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <p className="mb-5">Your email has not been verified</p>
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
            resendEmailConfirmationMutation({ email: email })
              .unwrap()
              .then(() => {
                message.info(
                  "Email confirmation code has been sent to " + email,
                );
              })
              .catch((error) => message.error(error.data.error))
          }
        >
          Resend Email Confirmation
        </Button>
      </div>
    </Modal>
  );
};

export default PendingEmailConfirmationModal;
