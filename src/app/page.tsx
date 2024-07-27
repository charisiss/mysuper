import { AppProps } from "next/app";
import Layout from "@/app/layout";
import Home from "@/app/pages/home";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}

export default MyApp;
