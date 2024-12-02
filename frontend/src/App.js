import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SearchProducts from "./components/SearchProducts";
import AddProduct from "./components/AddProduct";
import UpdateProduct from "./components/UpdateProduct";
import DisableProduct from "./components/DisableProduct";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchProducts />} />
        <Route path="/add" element={<AddProduct />} />
        <Route path="/update" element={<UpdateProduct />} />
        <Route path="/disable" element={<DisableProduct />} />
      </Routes>
    </Router>
  );
}

/*function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}*/

export default App;
