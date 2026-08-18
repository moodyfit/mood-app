"use client";

import { useState, useEffect } from "react";
import {
  fetchPhotos,
  fetchPhotoBySlug,
  getProductsForMood,
  getProductsForPhoto,
} from "@/lib/photos";
import type { Photo } from "@/lib/photos";
import type { MoodKey, Product } from "@/lib/types";
import { isSupabaseEnabled } from "@/lib/supabase";

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      setLoading(false);
      return;
    }
    fetchPhotos()
      .then(setPhotos)
      .finally(() => setLoading(false));
  }, []);

  return { photos, loading };
}

export function usePhotoBySlug(slug: string) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotoBySlug(slug)
      .then(setPhoto)
      .finally(() => setLoading(false));
  }, [slug]);

  return { photo, loading };
}

export function useProductsForMood(moodKey: MoodKey) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductsForMood(moodKey)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [moodKey]);

  return { products, loading };
}

export function useProductsForPhoto(imageUrl: string, moodKey: MoodKey) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getProductsForPhoto(imageUrl, moodKey)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [imageUrl, moodKey]);

  return { products, loading };
}
