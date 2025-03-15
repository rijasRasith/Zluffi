import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zluffi-dark-brown text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Zluffi</h3>
            <p className="text-zluffi-clay">
              Buy and sell locally. Find great deals or make some extra cash.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/categories/electronics" className="text-zluffi-clay hover:text-white">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/categories/vehicles" className="text-zluffi-clay hover:text-white">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link href="/categories/property" className="text-zluffi-clay hover:text-white">
                  Property
                </Link>
              </li>
              <li>
                <Link href="/categories/furniture" className="text-zluffi-clay hover:text-white">
                  Furniture
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-zluffi-clay hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zluffi-clay hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-zluffi-clay hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-zluffi-clay hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-zluffi-clay hover:text-white">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-zluffi-clay hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-zluffi-clay hover:text-white">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zluffi-medium-brown mt-8 pt-6 text-center text-zluffi-clay">
          <p>&copy; {new Date().getFullYear()} Zluffi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
