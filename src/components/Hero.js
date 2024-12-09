import React from "react";
import Bio from './Bio'
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

const HeroSection = () => {
    const animeData = [
        {
            title: "Attack on Titan",
            description:
                "In a world where humanity is on the brink of extinction, a group of heroes rises to combat the monstrous Titans.",
            image: "https://cdn.myanimelist.net/images/anime/10/47347.jpg",
        },
        {
            title: "Demon Slayer",
            description:
                "Follow Tanjiro as he embarks on a journey to save his sister and battle powerful demons.",
            image: "https://cdn.myanimelist.net/images/anime/1286/99889.jpg",
        },
        {
            title: "One Piece",
            description:
                "Join Luffy and his crew as they search for the ultimate treasure, the One Piece, in this epic adventure.",
            image: "https://cdn.myanimelist.net/images/anime/6/73245.jpg",
        },
    ];

    return (
        <div>
            <div className="w-full mx-36 h-lvh">
                <div className="w-10/12 h-2/4 absolute top-1/4 flex">
                    <Swiper
                        modules={[EffectFade, Autoplay, Pagination]}
                        effect="fade"
                        autoplay={{ delay: 5000 }}
                        loop={true}
                        pagination={{ clickable: true }}
                        className="h-full rounded-3xl"
                    >
                        {animeData.map((anime, index) => (
                            <SwiperSlide key={index}>
                                <div
                                    className="w-full h-full bg-cover bg-center rounded-3xl "
                                    style={{ backgroundImage: `url(${anime.image})` }}
                                >
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 rounded-3xl  ">
                                        <div className="text-center px-4">
                                            <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                                                {anime.title}
                                            </h2>
                                            <p className="mt-2 text-lg md:text-xl text-gray-300 drop-shadow-md">
                                                {anime.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <Bio/>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
