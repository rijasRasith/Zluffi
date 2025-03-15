import Link from 'next/link';
import { Suspense } from 'react';
import { Laptop, Car, Home, Package, ShoppingBag, BookOpen, Wrench, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

// Category component
function CategoryCard({ name, slug, icon }: { name: string; slug: string; icon: string }) {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      laptop: <Laptop className="h-6 w-6" />,
      car: <Car className="h-6 w-6" />,
      home: <Home className="h-6 w-6" />,
      package: <Package className="h-6 w-6" />,
      'shopping-bag': <ShoppingBag className="h-6 w-6" />,
      'book-open': <BookOpen className="h-6 w-6" />,
      wrench: <Wrench className="h-6 w-6" />,
      briefcase: <Briefcase className="h-6 w-6" />,
    };
    
    return iconMap[iconName] || <Package className="h-6 w-6" />;
  };
  
  return (
    <Link 
      href={`/categories/${slug}`}
      className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition text-center"
    >
      <div className="bg-zluffi-clay/20 p-3 rounded-full text-zluffi-medium-brown mb-3">
        {getIcon(icon)}
      </div>
      <span className="font-medium text-zluffi-dark-brown">{name}</span>
    </Link>
  );
}

// Listing card component
function ListingCard({ listing }: { listing: any }) {
  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="relative h-48 bg-zluffi-clay/10">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-zluffi-clay">No image</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate text-zluffi-dark-brown">{listing.title}</h3>
          <p className="text-zluffi-medium-brown font-bold mt-1">{formatCurrency(listing.price)}</p>
          <div className="flex justify-between items-center mt-2 text-sm text-zluffi-slate">
            <span>{listing.location}</span>
            <span>{new Date(listing.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Search form component
function SearchForm() {
  return (
    <form className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="What are you looking for?"
            className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-zluffi-medium-brown"
          />
        </div>
        
        <div className="flex-1">
          <input
            type="text"
            placeholder="Location"
            className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-zluffi-medium-brown"
          />
        </div>
        
        <button
          type="submit"
          className="bg-zluffi-medium-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-zluffi-dark-brown transition"
        >
          Search
        </button>
      </div>
    </form>
  );
}

// Get categories from Supabase
async function getCategories() {
  const { data } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .order('id');
  
  return data || [];
}

// Get recent listings from Supabase
async function getRecentListings() {
  const { data } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price,
      location,
      created_at,
      listing_images!inner(image_url)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(4);
  
  // Format the data to include the first image
  return data?.map(listing => ({
    ...listing,
    image_url: listing.listing_images?.[0]?.image_url
  })) || [];
}

export default async function Home() {
  const categoriesPromise = getCategories();
  const listingsPromise = getRecentListings();
  
  const [categories, listings] = await Promise.all([
    categoriesPromise,
    listingsPromise
  ]);
  
  return (
    <div className="space-y-10">
      <section className="bg-gradient-to-r from-zluffi-medium-brown to-zluffi-dark-brown rounded-xl p-8 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Buy & Sell Anything Locally</h1>
          <p className="text-xl mb-6">Join thousands of people buying and selling items in your area</p>
          <SearchForm />
          <div className="mt-4">
            <Link 
              href="/listings/new" 
              className="inline-block bg-white text-zluffi-medium-brown px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              Sell Something
            </Link>
          </div>
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold mb-6 text-zluffi-dark-brown">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              name={category.name} 
              slug={category.slug} 
              icon={category.icon} 
            />
          ))}
        </div>
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-zluffi-dark-brown">Recent Listings</h2>
          <Link href="/search" className="text-zluffi-medium-brown hover:underline">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Suspense fallback={<p>Loading listings...</p>}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </Suspense>
        </div>
      </section>
      
      <section className="bg-zluffi-clay/10 rounded-xl p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-zluffi-dark-brown">Ready to sell your items?</h2>
          <p className="text-zluffi-slate mb-6">
            It takes less than 2 minutes to create a listing. 
            Reach thousands of buyers in your area.
          </p>
          <Link 
            href="/listings/new" 
            className="inline-block bg-zluffi-medium-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-zluffi-dark-brown transition"
          >
            Create a Listing
          </Link>
        </div>
      </section>
    </div>
  );
}
