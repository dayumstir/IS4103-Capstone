import { Button, Card, Form, FormProps, Input, InputNumber, Modal } from "antd";
import { QRCodeSVG } from "qrcode.react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { ExpandOutlined } from "@ant-design/icons";
import QrCodeModal from "../components/QRCodeModal";

interface GenerateQRCodeProps {
  amount: number;
  referenceNumber: string;
}

const ViewQRCodeScreen: React.FC = () => {
  const merchant = useSelector((state: RootState) => state.profile.merchant);

  const [amount, setAmount] = useState<number>(-1);
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [isDisplayed, setIsDisplayed] = useState(false);

  const [isEnlarged, setIsEnlarged] = useState(false);

  const onFinish: FormProps<GenerateQRCodeProps>["onFinish"] = async (data) => {
    setAmount(data.amount);
    setReferenceNumber(data.referenceNumber);
    setIsDisplayed(true);
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      {isEnlarged && (
        <QrCodeModal
          isModalOpen={isEnlarged}
          setIsModalClose={setIsEnlarged}
          value={`${merchant?.merchant_id}:${amount}:${referenceNumber}`}
        />
      )}
      <Card className="mb-10 flex h-48 w-48 items-center justify-center md:h-72 md:w-72 lg:h-96 lg:w-96">
        {isDisplayed ? (
          <div className="flex flex-col items-center">
            <QRCodeSVG
              value={`${merchant?.merchant_id}:${amount}:${referenceNumber}`}
              className="mb-5 h-32 w-32 md:h-48 md:w-48 lg:h-64 lg:w-64"
            />
            <p>
              <span style={{ color: "#9d9d9d" }}>Amount:</span> SGD {amount}
            </p>
            <p className="line-clamp-1">
              <span style={{ color: "#9d9d9d" }}>Reference Number: </span>
              {referenceNumber == "" ? "-" : referenceNumber}
            </p>
            <Button
              className="absolute bottom-4 right-4"
              onClick={() => setIsEnlarged(true)}
              icon={<ExpandOutlined />}
            />
          </div>
        ) : (
          "Enter an amount to generate a QR code"
        )}
      </Card>

      <Card style={{ backgroundColor: "#F5F5F5" }}>
        <Form
          name="basic"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          style={{ minWidth: 600 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<GenerateQRCodeProps>
            name="amount"
            label="Amount"
            rules={[
              {
                required: true,
                message: "Please input the transaction cost amount!",
              },
            ]}
          >
            <InputNumber min={0} prefix="SGD" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item<GenerateQRCodeProps>
            name="referenceNumber"
            label="Reference Number"
            initialValue={name}
          >
            <Input />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Generate QR Code
            </Button>
            <Button
              type="primary"
              onClick={() => setIsDisplayed(false)}
              className="ml-10"
            >
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ViewQRCodeScreen;
