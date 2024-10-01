import { DeleteFilled, InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Form,
  FormProps,
  GetProp,
  Image,
  Input,
  message,
  Modal,
  UploadFile,
  UploadProps,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import { useState } from "react";
import { IIssue } from "../interfaces/models/issueInterface";
import { useCreateIssueMutation } from "../redux/services/issue";

interface CreateIssueModalProps {
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}
const CreateIssueModal = ({
  isModalOpen,
  setModalOpen,
}: CreateIssueModalProps) => {
  const [form] = Form.useForm();
  const [createIssueMutation, { isLoading }] = useCreateIssueMutation();

  const [imagesDisplays, setImagesDisplay] = useState<string[]>(
    Array(4).fill(""),
  );
  const [images, setImages] = useState<(File | undefined)[]>(
    new Array(4).fill(undefined),
  ); // Initialize with 6 undefined values
  const [fileList, setFileList] = useState<UploadFile[]>([]);

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

  type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

  const beforeUpload = (file: FileType) => {
    if (!images.includes(undefined)) {
      message.error("Maximum of 4 photos is allowed");
      return;
    }

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

  const handleChange: UploadProps["onChange"] = async ({ file: newFile }) => {
    if (newFile && newFile.originFileObj) {
      const file = newFile.originFileObj as File;

      setImages((prevImages) => {
        const updatedImages = [...prevImages]; // Create a copy of the current images
        const emptyIndex = updatedImages.findIndex((img) => img === undefined); // Find the first empty index

        if (emptyIndex !== -1) {
          updatedImages[emptyIndex] = file; // Replace the first empty spot with the new base64 string
        }

        return updatedImages;
      });

      const base64String = await convertImageToBase64(newFile.originFileObj);
      setImagesDisplay((prevImages) => {
        const updatedImages = [...prevImages]; // Create a copy of the current images
        const emptyIndex = updatedImages.findIndex((img) => img === ""); // Find the first empty index

        if (emptyIndex !== -1) {
          updatedImages[emptyIndex] = base64String; // Replace the first empty spot with the new base64 string
        }

        return updatedImages;
      });
    }
  };

  const props: UploadProps = {
    name: "file",
    multiple: true,
    fileList: fileList,
    beforeUpload(file, fileList) {
      if (fileList.length > 0) {
        fileList.forEach((file) => beforeUpload(file));
      } else if (file) {
        beforeUpload(file);
      }
    },
    onChange(info) {
      handleChange(info);
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const onFinish: FormProps<IIssue>["onFinish"] = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    images.forEach((image) => {
      if (image) {
        formData.append("images", image); // Append each image without an index
      }
    });
    const merchantId = localStorage.getItem("merchantId");
    merchantId
      ? formData.append("merchant_id", merchantId)
      : message.error("Merchant ID not found");
    data.customer_id && formData.append("customer_id", data.customer_id);
    data.admin_id && formData.append("admin_id", data.admin_id);

    await createIssueMutation(formData)
      .unwrap()
      .then(() => {
        setModalOpen(false);
        message.success(
          "Your issue has been created. Please expect at least 3 working days for us to get back. Thank you!",
        );
      })
      .catch((error) => message.error(error.data.error));
  };

  return (
    <Modal
      title="Create Issue"
      open={isModalOpen}
      onOk={() => form.submit()}
      // okButtonProps={{ style: { display: "none" } }}
      cancelText="Cancel"
      okText="Create"
      onCancel={() => setModalOpen(false)}
    >
      <Form
        name="basic"
        labelCol={{ span: 6 }}
        onFinish={onFinish}
        autoComplete="off"
        form={form}
      >
        <Form.Item<IIssue>
          label="Title"
          name="title"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<IIssue>
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Images">
          <Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Maximum of 4 photos is
              allowed.
            </p>
          </Dragger>
          <div className="flex flex-wrap justify-between">
            {imagesDisplays &&
              imagesDisplays.map((imageDisplay, index) => {
                return (
                  <Card
                    key={index}
                    className="my-5"
                    style={{ width: 100, height: 150 }}
                    cover={
                      imageDisplay != "" && (
                        <Image
                          alt=""
                          src={imageDisplay}
                          height={70}
                          className="object-cover"
                        />
                      )
                    }
                  >
                    {imageDisplay && (
                      <Button
                        onClick={() => {
                          setImages((prevImages) => {
                            const newImages = [...prevImages];
                            newImages[index] = undefined;
                            return newImages;
                          });
                          setImagesDisplay((prevDisplays) => {
                            const newDisplays = [...prevDisplays];
                            newDisplays[index] = "";
                            return newDisplays;
                          });
                          console.log(images);
                        }}
                      >
                        <DeleteFilled />
                      </Button>
                    )}
                  </Card>
                );
              })}
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateIssueModal;
