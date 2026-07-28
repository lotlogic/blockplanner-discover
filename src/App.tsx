import { APIProvider } from "@vis.gl/react-google-maps";
import { BrowserRouter as Router } from "react-router-dom";
import AnimatedRoutes from "./AnimatedRoutes";
import Header from "./components/layouts/Header";
import { getRouterBasename } from "./utils/publicPath";

function App() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <Router basename={getRouterBasename()}>
        <Header />
        <AnimatedRoutes />
      </Router>
    </APIProvider>
  );
}

export default App;
