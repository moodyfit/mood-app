"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchPhotos,
  fetchPhotoBySlug,
  fetchProductsByPhoto,
  fetchFlagshipLooks,
  fetchPhotoProducts,
  pickFlagshipLook,
  dominantMood,
  filterByGender,
} from "@/lib/photos";
import type { FlagshipLook, Photo } from "@/lib/photos";
import type { MoodKey, Product } from "@/lib/types";
import { rankSimilarPhotos } from "@/lib/similarity";
import { useMoodStore } from "@/lib/store";
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
    // 빈 slug 는 ilike '%/.%' 가 되어 아무 사진이나 잡힌다
    if (!slug) {
      setPhoto(null);
      setLoading(false);
      return;
    }
    fetchPhotoBySlug(slug)
      .then(setPhoto)
      .finally(() => setLoading(false));
  }, [slug]);

  return { photo, loading };
}

export function useProductsForPhoto(imageUrl: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!imageUrl) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProductsByPhoto(imageUrl)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [imageUrl]);

  return { products, loading };
}

/** 무드 대표 코디(대표 사진 + 상품) — 홈 성별 필터를 따른다 */
export function useMoodLooks() {
  const { genderFilter } = useMoodStore();
  const [looks, setLooks] = useState<FlagshipLook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlagshipLooks()
      .then(setLooks)
      .finally(() => setLoading(false));
  }, []);

  const lookFor = useCallback(
    (moodKey: MoodKey) => pickFlagshipLook(looks, moodKey, genderFilter),
    [looks, genderFilter]
  );

  return { lookFor, loading };
}

/** 무드 상세 썸네일 줄 — 그 무드 사진(성별 필터). 대표 사진 첫 칸, 나머지는 대표 사진과 비슷한 순 */
export function useMoodPhotos(moodKey: string, first: Photo | undefined) {
  const { photos, loading } = usePhotos();
  const { genderFilter } = useMoodStore();
  if (!first) return { photos: [], loading };
  const rest = filterByGender(photos, genderFilter).filter(
    (p) => p.id !== first.id && dominantMood(p.mood_vector) === moodKey
  );
  return { photos: [first, ...rankSimilarPhotos(first, rest, rest.length)], loading };
}

/** 사진 경로 → 상품. 한 번 받아 두고 코디를 바꿀 때 바로 꺼내 쓴다 */
export function usePhotoProducts() {
  const [byPhoto, setByPhoto] = useState<Map<string, Product[]>>(new Map());

  useEffect(() => {
    fetchPhotoProducts().then(setByPhoto);
  }, []);

  return byPhoto;
}
