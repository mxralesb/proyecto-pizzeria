import Header from "./Header";
import Footer from "./Footer";
import HeaderBar from "../components/HeaderBar";

export default function Layout({ children }) {
  return (
    <div className="pz-root">
      <Header />
      <main className="pz-main">
        <div className="pz-container">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
