// FEAT-002 — GET /api/similar?photoId=xxx&limit=10
// 좋아요 누른 사진의 mood_vector 기준 코사인 유사도로 비슷한 사진 추천.
// 프론트(웹/향후 RN)와 분리된 서버 API — 로직이 어느 클라이언트에서든 재사용됨.
import { fetchPhotos } from "@/lib/photos";
import { rankSimilarPhotos } from "@/lib/similarity";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const photoId = url.searchParams.get("photoId");
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit")) || 10));

  if (!photoId) return Response.json({ error: "photoId 필요" }, { status: 400 });

  const photos = await fetchPhotos();
  if (photos.length === 0) return Response.json({ error: "사진 데이터 없음" }, { status: 500 });

  const target = photos.find((p) => p.id === photoId);
  if (!target) return Response.json({ error: "사진을 찾을 수 없음" }, { status: 404 });

  const similar = rankSimilarPhotos(target, photos, limit);
  return Response.json({ photos: similar });
}
