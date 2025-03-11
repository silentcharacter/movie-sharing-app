"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import Link from "next/link";

export default function UserMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex gap-4 items-center absolute top-4 right-4">
      <Link 
        href={`/?${createQueryString("filter", "myLikes")}`}
        className="text-blue-600 hover:text-blue-800"
      >
        My Likes
      </Link>
      <Link 
        href={`/?${createQueryString("filter", "myMovies")}`} 
        className="text-blue-600 hover:text-blue-800"
      >
        My Movies
      </Link>
      <Link 
        href="/" 
        className="text-blue-600 hover:text-blue-800"
      >
        All Movies
      </Link>
    </div>
  );
} 