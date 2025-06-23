import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white text-black text-center py-4 text-sm font-medium">
      © {new Date().getFullYear()} StayFinder · Made with ❤️ in India · support@stayfinder.com
    </footer>
  );
};

export default Footer;
