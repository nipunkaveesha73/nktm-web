import React, { useState } from 'react';

const menuitems = [
    { title: "Home", id: 1 },
    { title: "Anime", id: 2 },
    { title: "Request", id: 3 },
    { title: "About", id: 4 },
];

const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const listitem = menuitems.map((item) => (
        <li
            key={item.id}
            className="mx-4 my-2 cursor-pointer hover:text-gray-400 transition duration-300"
        >
            {item.title}
        </li>
    ));

    return (
        <div className="h-16 w-full px-6 bg-black bg-opacity-50 text-white backdrop-blur-md font-semibold shadow-md fixed z-50">
            {/* Logo */}
            <div className="flex items-center h-full">
                <div className="text-2xl font-bold">
                    NKTM <span className="font-light">Anime Collection</span>
                </div>

                {/* Desktop Menu */}
                <ul className="hidden md:flex ml-auto items-center">
                    {listitem}
                    <li className="mx-4 my-2">
                        <img
                            className="h-6 w-6 cursor-pointer hover:scale-110 transition-transform"
                            src="https://icons.veryicon.com/png/o/education-technology/education-app/search-137.png"
                            alt="Search"
                        />
                    </li>
                </ul>

                {/* Mobile Menu Button */}
                <div
                    className="ml-auto md:hidden cursor-pointer"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="w-6 h-1 bg-white mb-1"></div>
                    <div className="w-6 h-1 bg-white mb-1"></div>
                    <div className="w-6 h-1 bg-white"></div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <ul className="absolute top-16 left-0 w-full bg-black bg-opacity-90 text-center text-white md:hidden z-40 py-4">
                    {menuitems.map((item) => (
                        <li
                            key={item.id}
                            className="py-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800"
                        >
                            {item.title}
                        </li>
                    ))}
                    <li className="py-2">
                        <img
                            className="h-6 mx-auto cursor-pointer hover:scale-110 transition-transform"
                            src="https://icons.veryicon.com/png/o/education-technology/education-app/search-137.png"
                            alt="Search"
                        />
                    </li>
                </ul>
            )}
        </div>
    );
};

export default Menu;
