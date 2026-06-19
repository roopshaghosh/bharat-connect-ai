import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 shadow-md bg-white">

      {/* Logo */}

      <h1 className="text-3xl font-bold text-blue-600">
        Bharat Connect AI
      </h1>

      {/* Navigation */}

      <div className="flex gap-8 text-gray-700 font-medium">

        <a href="#features">Features</a>

        <a href="#about">About</a>

        <Link to="/login">Login</Link>

      </div>

      {/* Button */}

      <button className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700">

        Get Started

      </button>

    </nav>
  );
}

export default Navbar;
