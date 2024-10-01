import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Card,
  message,
  Popconfirm,
  Empty,
  InputNumber,
  DatePicker,
  FormInstance,
  Tag,
} from "antd";
import { PlusOutlined, EyeOutlined, StopOutlined } from "@ant-design/icons";

import { useGetVouchersQuery, useCreateVoucherMutation } from "../redux/services/voucherService";
import { useNavigate } from "react-router-dom";
import { IVoucher } from "../interfaces/voucherInterface";


const { Search } = Input;

export default function VoucherScreen() {
  const [form] = Form.useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: vouchers, isLoading } = useGetVouchersQuery(searchTerm);
  const [createVoucher] = useCreateVoucherMutation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle voucher creation
  const handleCreateVoucher = async (newVoucher: Omit<IVoucher, "voucher_id">) => {
    try {
      const result = await createVoucher(newVoucher).unwrap();
      message.success(`New voucher "${result.title}" has been created.`);
      form.resetFields();
    } catch (error) {
      console.error("Error creating voucher:", error);
      message.error("Failed to create voucher");
    }
  };

  // Handle voucher deactivation
  const handleDeactivateVoucher = (id: string) => {
    message.success("Voucher has been deactivated.");
    // Logic for deactivating the voucher would go here.
  };

  const tableColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a: IVoucher, b: IVoucher) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Percentage Discount",
      dataIndex: "percentage_discount",
      key: "percentage_discount",
      render: (discount: number) => `${discount}%`,
      sorter: (a: IVoucher, b: IVoucher) => a.percentage_discount - b.percentage_discount,
    },
    {
      title: "Amount Discount",
      dataIndex: "amount_discount",
      key: "amount_discount",
      render: (amount: number) => `$${amount}`,
      sorter: (a: IVoucher, b: IVoucher) => a.amount_discount - b.amount_discount,
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Usage Limit",
      dataIndex: "usage_limit",
      key: "usage_limit",
    },

    {
      title: "Actions",
      key: "actions",
      width: 1,
      render: (text: string, record: any) => (
        <div className="flex flex-col gap-2">
          <Button
            icon={<EyeOutlined />}
            onClick={() => navigate(`/voucher/${record.voucher_id}`)}
          >
            View Voucher Details
          </Button>
          <Popconfirm
            title="Are you sure you want to deactivate this voucher?"
            onConfirm={() => handleDeactivateVoucher(record.voucher_id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<StopOutlined />} danger>
              Deactivate
            </Button>
          </Popconfirm>
        </div>
      ),
    },

  ];

  const renderForm = (formInstance: FormInstance) => (
    <Form
      form={formInstance}
      name="voucher"
      onFinish={handleCreateVoucher}
      layout="vertical"
    >
      <div className="grid grid-cols-2 gap-x-8">
        <Form.Item
          name="title"
          label="Voucher Title"
          rules={[{ required: true, message: "Please input the voucher title!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please input the description!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="percentage_discount"
          label="Percentage Discount"
          rules={[{ required: true, message: "Please input the percentage discount!" }]}
        >
          <InputNumber className="w-full" step={1} min={0} max={100} />
        </Form.Item>

        <Form.Item
          name="amount_discount"
          label="Amount Discount"
          rules={[{ required: true, message: "Please input the amount discount!" }]}
        >
          <InputNumber className="w-full" step={1} min={0} />
        </Form.Item>

        <Form.Item
          name="expiry_date"
          label="Expiry Date"
          rules={[{ required: true, message: "Please select the expiry date!" }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item
          name="usage_limit"
          label="Usage Limit"
          rules={[{ required: true, message: "Please input the usage limit!" }]}
        >
          <InputNumber className="w-full" step={1} min={1} />
        </Form.Item>

        <Form.Item
          name="terms"
          label="Terms"
          rules={[{ required: true, message: "Please input the terms!" }]}
        >
          <Input />
        </Form.Item>
      </div>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          icon={<PlusOutlined />}
        >
          Create Voucher
        </Button>
      </Form.Item>

    </Form>
  );

  return (
    <div className="w-full px-8 py-4">
      {/* ===== Create Voucher ===== */}
      <Card className="mb-8 border border-gray-300" title="Create Voucher">
        {renderForm(form)}
      </Card>

      {/* ===== View and Manage Vouchers ===== */}
      <Card className="mb-8 border border-gray-300" title="View and Manage Vouchers">
        <Search
          placeholder="Search by title or description"
          onChange={handleSearchChange}
          value={searchTerm}
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={vouchers}
          columns={tableColumns}
          rowKey="voucher_id"
          pagination={false}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No vouchers found"></Empty>,
          }}
        />
      </Card>
    </div>
  )
}