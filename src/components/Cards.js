const products = [
    {
        id: 1,
        name: 'Demon Slayer',
        href: '#',
        imageSrc: 'https://m.media-amazon.com/images/M/MV5BNDUyZTJmODQtZmRkMS00YjJiLTgxZmUtMjQ5OGNjNzkyM2Y5XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
        imageAlt: "Demon Slayer",
        category: 'TV',
        season: 'S1',
    },
    {
        id: 2,
        name: 'Fate stay night',
        href: '#',
        imageSrc: 'https://m.media-amazon.com/images/M/MV5BZTNmZWI3ZWYtNjkzYi00ZTFkLWI0MzctMjc2YzlmNGRkNzRiXkEyXkFqcGc@._V1_.jpg',
        imageAlt: "fate stay night",
        category: 'TV',
        season: 'S2',
    },
    {
        id: 3,
        name: 'Attack on titan',
        href: '#',
        imageSrc: 'https://www.wildfaery.com/info/images/Attack_on_Titan/20241105_AOT_WebLFS%20(640%20x%20960)_06.jpg',
        imageAlt: "attack on titan",
        category: 'TV',
        season: 'S1',
    },
    {
        id: 4,
        name: 'Tokyo ghoul',
        href: '#',
        imageSrc: 'https://m.media-amazon.com/images/M/MV5BZWI2NzZhMTItOTM3OS00NjcyLThmN2EtZGZjMjlhYWMwODMzXkEyXkFqcGc@._V1_.jpg',
        imageAlt: "tokyo ghoul",
        category: 'TV',
        season: 'S1',
    },
    
    
    // More pro
    // More products...
]

export default function Cards() {
    return (
        <div>
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
                <h2 className="text-2xl font-bold tracking-tight text-white">latest anime</h2>

                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                    {products.map((product) => (
                        <div key={product.id} className="group relative">
                            <img
                                alt={product.imageAlt}
                                src={product.imageSrc}
                                className="aspect-square w-full rounded-md bg-gray-200 object-cover group-hover:opacity-75 lg:aspect-auto lg:h-80"
                            />
                            <div className="mt-4 flex justify-between">
                                <div>
                                    <h3 className="text-sm text-blue-50">
                                        <a href={product.href}>
                                            <span aria-hidden="true" className="absolute inset-0" />
                                            {product.name}
                                        </a>
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.season}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-100">{product.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
