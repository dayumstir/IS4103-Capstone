import { Avatar, Button, Card } from "antd";
import React, { useEffect, useState } from "react";
import { useGetProfileQuery } from "../redux/services/profile";
import { RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { Buffer } from "buffer";
import { UserOutlined } from "@ant-design/icons";

const ProfileScreen: React.FC = () => {
  const id = useSelector((state: RootState) => state.auth.merchantId);
  const result = useGetProfileQuery(id);

  const [name, setName] = useState("");
  //   const [profilePicture, setProfilePicture] = useState();
  const [profilePictureDisplay, setProfilePictureDisplay] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (result.data) {
      setName(result.data.name);
      console.log(result.data.profile_picture);
      if (result.data.profile_picture) {
        const profilePictureBase64 = `data:image/png;base64,${Buffer.from(result.data.profile_picture).toString("base64")}`;
        setProfilePictureDisplay(profilePictureBase64);
      }
      setEmail(result.data.email);
      setContactNumber(result.data.contact_number);
      setAddress(result.data.address);
    }
  });

  return (
    <div>
      <div className="flex items-center">
        {profilePictureDisplay ? (
          <img
            src={profilePictureDisplay}
            alt="avatar1"
            className="h-36 w-36 object-cover"
          />
        ) : (
          <Avatar className="h-36 w-36 object-cover" icon={<UserOutlined />} />
        )}
        <div className="ml-4">
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm text-gray-600">{email}</p>
        </div>
        <div className="ml-auto flex space-x-2">
          <Button type="primary">Reset Password</Button>
          <Button type="primary">Edit Profile</Button>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex space-x-4">
          <div className="flex-1">
            <p>Name</p>
            <Card>
              <p>{name}</p>
            </Card>
          </div>
          <div className="flex-1">
            <p>Email</p>
            <Card>
              <p>{email}</p>
            </Card>
          </div>
        </div>
        <div className="mt-5 flex space-x-4">
          <div className="flex-1">
            <p>Contact Number</p>
            <Card>
              <p>{contactNumber}</p>
            </Card>
          </div>
          <div className="flex-1">
            <p>Address</p>
            <Card>
              <p>{address}</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
