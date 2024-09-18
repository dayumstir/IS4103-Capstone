import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Button } from "antd";
import { IInstalmentPlan } from "../interfaces/instalmentPlanInterface";

export default function InstalmentPlanForm({
  handleSubmit,
  handleCancel,
  editingPlan,
}: {
  handleSubmit: (plan: IInstalmentPlan) => void;
  handleCancel: () => void;
  editingPlan: IInstalmentPlan | null;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingPlan) {
      form.setFieldsValue(editingPlan);
    }
  }, [editingPlan]);

  return (
    <Form
      form={form}
      name="instalmentPlan"
      onFinish={handleSubmit}
      layout="vertical"
    >
      <Form.Item
        name="name"
        label="Name"
        rules={[{ required: true, message: "Please input the plan name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[
          { required: true, message: "Please input the plan description!" },
        ]}
      >
        <Input.TextArea />
      </Form.Item>

      <Form.Item
        name="frequency"
        label="Frequency"
        rules={[{ required: true, message: "Please select the frequency!" }]}
      >
        <Select>
          <Select.Option value="weekly">Weekly</Select.Option>
          <Select.Option value="biweekly">Every 2 weeks</Select.Option>
          <Select.Option value="monthly">Monthly</Select.Option>
          <Select.Option value="quarterly">Quarterly</Select.Option>
          <Select.Option value="yearly">Yearly</Select.Option>
        </Select>
      </Form.Item>
      <div className="flex">
        <Form.Item
          name="interest_rate"
          label="Interest Rate (%)"
          rules={[
            { required: true, message: "Please input the interest rate!" },
          ]}
        >
          <InputNumber
            className="min-w-[100px]"
            min={0}
            max={100}
            step={0.01}
          />
        </Form.Item>

        <Form.Item
          name="minimum_amount"
          label="Minimum Amount ($)"
          rules={[
            { required: true, message: "Please input the minimum amount!" },
          ]}
        >
          <InputNumber className="min-w-[130px]" min={0} step={0.01} />
        </Form.Item>

        <Form.Item
          name="maximum_amount"
          label="Maximum Amount ($)"
          rules={[
            { required: true, message: "Please input the maximum amount!" },
          ]}
        >
          <InputNumber className="min-w-[130px]" min={0} step={0.01} />
        </Form.Item>
      </div>
      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: "Please select the status!" }]}
      >
        <Select>
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="inactive">Inactive</Select.Option>
          <Select.Option value="pending">Pending</Select.Option>
        </Select>
      </Form.Item>

      <div className="flex h-10 justify-between">
        <Form.Item>
          <Button
            className="font-semibold"
            onClick={() => form.resetFields()}
            danger
          >
            Reset
          </Button>
        </Form.Item>

        <div className="flex">
          <Form.Item className="mr-2">
            <Button onClick={handleCancel} className="font-semibold">
              Cancel
            </Button>
          </Form.Item>

          <Form.Item>
            <Button className="font-semibold" type="primary" htmlType="submit">
              {editingPlan ? "Save Changes" : "Create"}
            </Button>
          </Form.Item>
        </div>
      </div>
    </Form>
  );
}
