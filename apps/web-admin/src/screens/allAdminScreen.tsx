import { useState } from "react";
import {
  Avatar,
  Form,
  Button,
  Table,
  Card,
  message,
  Modal,
  Empty,
  Select,
  FormInstance,
  Tag,
  Typography,
} from "antd";
import { EditOutlined } from "@ant-design/icons";
import { UserOutlined } from "@ant-design/icons";
import {
  useViewAllAdminQuery,
  useUpdateStatusMutation,
} from "../redux/services/adminService";
import { IAdmin } from "../interfaces/adminInterface";
import { Buffer } from "buffer";
import { Link } from "react-router-dom";

export default function AllAdminScreen() {
  const { Title, Text } = Typography;
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<IAdmin | null>(null);

  const { data: admins, isLoading } = useViewAllAdminQuery();
  const [updateAdminStatus] = useUpdateStatusMutation();

  const handleEditAdmin = (admin: IAdmin) => {
    setEditingAdmin(admin);
    // Data from db is string, need to convert them back to number
    editForm.setFieldsValue({
      ...admin,
      admin: admin.name,
      email: admin.email,
      contact_number: admin.contact_number,
    });
    setIsModalOpen(true);
  };

  const handleUpdateAdmin = async (values: Omit<IAdmin, "admin_id">) => {
    if (!editingAdmin) {
      message.error("No admin selected for editing");
      return;
    }
    const { admin_type1 } = values;
    console.log("Selected Admin Type:", admin_type1);

    try {
      await updateAdminStatus({
        updatedAdminId: editingAdmin.admin_id,
        admin_type: admin_type1.toString(),
      }).unwrap();

      setIsModalOpen(false);
      setEditingAdmin(null);
      message.success(`Admin "${editingAdmin.name}" has been updated.`);
    } catch (error) {
      console.error("Error updating admin:", error);
      message.error("Failed to update admin");
    }
  };

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },

    {
      title: "Admin Status",
      dataIndex: "admin_type",
      key: "admin_type",
      width: 1,
      render: (text: string) => (
        <Tag color={text === "NORMAL" ? "green" : "volcano"}>
          {text === "NORMAL" ? "ACTIVE" : text}
        </Tag>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 1,
      render: (text: string, admin: IAdmin) => (
        <div className="whitespace-nowrap">
          <Button
            className="mr-2"
            icon={<EditOutlined />}
            onClick={() => handleEditAdmin(admin)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

  const renderForm = (formInstance: FormInstance) => (
    <div className="rounded-lg bg-white p-4 shadow">
      {/* Display Admin's Name and Email */}
      {editingAdmin && (
        <div className="mb-6">
          <Title level={4}>Profile Picture</Title>
          {editingAdmin.profile_picture ? (
            <img
              src={`data:image/png;base64,${Buffer.from(editingAdmin.profile_picture).toString("base64")}`}
              alt="avatar1"
              className="h-36 w-36 object-cover"
            />
          ) : (
            <Avatar
              className="h-36 w-36 object-cover"
              icon={<UserOutlined />}
            />
          )}
          <h3>{`Admin Name: ${editingAdmin.name}`}</h3>
          <p>{`Email: ${editingAdmin.email}`}</p>
          <h3>{`Username : ${editingAdmin.username}`}</h3>
          <p>{`Contact Number: ${editingAdmin.contact_number}`}</p>
          <h3>{`Address: ${editingAdmin.address}`}</h3>
          <p>{`Date of Birth: ${editingAdmin.date_of_birth}`}</p>
        </div>
      )}
      <Form
        form={formInstance}
        name="admin"
        onFinish={handleUpdateAdmin}
        layout="vertical"
      >
        <div className="grid grid-cols-2 gap-x-8">
          <Form.Item
            name="admin_type1"
            label="Status"
            rules={[{ required: true, message: "Please select the status!" }]}
          >
            <Select>
              <Select.Option value="DEACTIVATE">DEACTIVATE</Select.Option>
              <Select.Option value="ACTIVATE">ACTIVATE</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Update Status
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div className="w-full px-8 py-4">
      {/* ===== View and Manage Instalment Plans ===== */}
      <Card
        className="mb-8 border border-gray-300"
        title="View and Manage Admins"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="ml-auto">
            <Link to="/admin/add">
              <button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                Add Admin
              </button>
            </Link>
          </div>
        </div>
        <Table
          dataSource={admins}
          columns={tableColumns}
          rowKey="admin_id"
          pagination={false}
          loading={isLoading}
          locale={{
            emptyText: <Empty description="No admin found"></Empty>,
          }}
        />
      </Card>

      {/* ===== Edit Instalment Plan Modal ===== */}
      <Modal
        title="Admin Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        centered
      >
        {renderForm(editForm)}
      </Modal>
    </div>
  );
}
