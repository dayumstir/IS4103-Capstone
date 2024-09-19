import { Layout } from "antd";
import React from "react";

const Footer: React.FC = () => {
  const { Footer } = Layout;

  return (
    <Footer
      style={{
        textAlign: "center",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      PandaPay ©{new Date().getFullYear()}
    </Footer>
  );
};

export default Footer;
