import React from "react";
import Header from "./Header";
// import Footer from './Footer'; // 필요하다면 Footer 컴포넌트 추가

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen container mx-auto px-4">
      <Header />
      <main className="flex-grow">{children}</main>
      {/* 필요하다면 Footer 추가 */}
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
