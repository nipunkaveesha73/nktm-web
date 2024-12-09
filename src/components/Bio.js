import React from "react";

const BioSection = () => {
    return (
        <div className=" text-white w-10/12 h-auto  p-6 rounded-lg shadow-lg flex flex-col justify-between">
            {/* Title */}
            <div>
                <h2 className="text-3xl font-bold mb-4"></h2>

                {/* Bio Content */}
                <p className="text-lg text-gray-300 leading-relaxed">
                    Welcome to my anime sanctuary! I'm a passionate anime enthusiast who loves exploring stories filled with adventure, emotions, and unforgettable characters.
                    Here, you’ll find my curated collection of favorite anime, from timeless classics to the latest hits. Feel free to browse around and share your thoughts!
                </p>
            </div>

            {/* Button */}
            <div className="mt-6">
                <button className="w-full px-4 py-2 bg-white hover:bg-slate-200 text-black text-lg font-semibold rounded">
                    Explore My Favorites
                </button>
            </div>
        </div>
    );
};

export default BioSection;
