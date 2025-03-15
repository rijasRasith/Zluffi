'use client';

import Link from 'next/link';
import { 
  Laptop, Car, Home, Package, ShoppingBag, BookOpen, Wrench, Briefcase 
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  // Map icon strings to actual Lucide icon components
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      laptop: <Laptop className="h-6 w-6" />,
      car: <Car className="h-6 w-6" />,
      home: <Home className="h-6 w-6" />,
      chair: <Package className="h-6 w-6" />, // Replaced Chair with Package
      shirt: <ShoppingBag className="h-6 w-6" />, // Replaced Shirt with ShoppingBag
      book: <BookOpen className="h-6 w-6" />, // Replaced Book with BookOpen
      tool: <Wrench className="h-6 w-6" />, // Replaced Tool with Wrench
      briefcase: <Briefcase className="h-6 w-6" />,
    };
    
    return iconMap[iconName] || <Laptop className="h-6 w-6" />;
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link 
          key={category.id}
          href={`/categories/${category.slug}`}
          className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition text-center"
        >
          <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-3">
            {getIcon(category.icon)}
          </div>
          <span className="font-medium">{category.name}</span>
        </Link>
      ))}
    </div>
  );
}
