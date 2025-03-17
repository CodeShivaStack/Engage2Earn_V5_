import React from "react";
import { Link } from "react-router-dom";
import { WalletButton } from "./WalletButton";
import { Home, Compass, PlusSquare, User, Zap } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-blue-600" />

              <span className="font-bold text-xl">Engage2Earn</span>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-1 text-gray-700 hover:text-purple-600"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link
              to="/explore"
              className="flex items-center space-x-1 text-gray-700 hover:text-purple-600"
            >
              <Compass className="w-5 h-5" />
              <span>Explore</span>
            </Link>
            <Link
              to="/assign"
              className="flex items-center space-x-1 text-gray-700 hover:text-purple-600"
            >
              <PlusSquare className="w-5 h-5" />
              <span>Assign</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-1 text-gray-700 hover:text-purple-600"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            <WalletButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
