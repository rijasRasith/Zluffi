'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

interface ListingCardProps {
  listing: {
    id: number;
    title: string;
    price: number;
    location: string;
    imageUrl: string;
    createdAt: string;
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { id, title, price, location, imageUrl, createdAt } = listing;
  
  return (
    <Link href={`/listings/${id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
        <div className="relative h-48">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{title}</h3>
          <p className="text-blue-600 font-bold mt-1">{formatCurrency(price)}</p>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>{location}</span>
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
