# MOODFIT 생성 파이프라인 (GENERATION.md 구현)

fal.ai `flux/schnell` 로 무드 사진을 배치 생성 → `../images/{축}-{번호}.png` → TAGGING.md 파이프라인 입력.

## 준비
```bash
cd scripts
npm install
cp .env.example .env   # FAL_KEY 를 fal.ai 대시보드에서 발급해 채운다
```

## 실행
```bash
# 프롬프트/비용 미리보기 (키 불필요)
npx tsx generate.ts test --dry
npx tsx generate.ts batch-all 15 --dry

# 실제 생성 (FAL_KEY 필요)
npx tsx generate.ts test            # §1 감성 테스트 5장 → images/_test/
npx tsx generate.ts batch soft 15   # soft 축 15장 (번호 이어서)
npx tsx generate.ts batch-all 15    # 6축 × 15 = 90장
# --dev : fal-ai/flux/dev 로 품질 재테스트
```

## 워크플로우 (문서 순서)
1. `test --dry` 로 프롬프트 확인 → FAL_KEY 세팅 → `test` 로 5장 생성.
2. **사람 검수**: 기존 튜닝분(soul_2 배치 #1·#2)과 감성/이질감 비교. 불합격 시 스타일 앵커 조정·재시도(최대 3회). **승인 후에만 배치.**
3. 배치 비용 미리보기(`--dry`) → 승인 → `batch-all 15`.
4. 산출물은 TAGGING.md 로 인계(체험 관문·태깅).

## 비율 믹스 (메이슨리 전시 문법)
그리드는 균등 격자(커머스=비교)가 아니라 메이슨리(전시=갤러리/무드보드)다. 세로 리듬을 위해 **생성 단계에서 비율을 섞는다** — 크롭으로 위조하면 스트릿샷 구도(전신~무릎)가 잘리므로 금지(①).
- `SIZES`: `4:5`(896×1120, 기본) · `3:4`(864×1152) · `9:16`(768×1344).
- `pickSize(index)`: 인덱스 기반 결정적 분포 약 **7:2:1** (재현성 — 같은 배치는 같은 비율).
- 각 컷의 `aspect_ratio`(=w/h)를 `gen_log.json`에 기록 → 시드 시 `photos.aspect_ratio` 로 넣으면 그리드가 실비율로 렌더.
- 이미 생성된 컷을 더 세로로 키우려면 **크롭이 아니라 아웃페인트(캔버스 확장)** 로 — 인물·구도 보존.

## 로그
- `../images/gen_log.json`: 파일명·프롬프트 전문·모델·`aspect_ratio`·`size`·변주 메타 (photos.gen_prompt/aspect_ratio 소스).

## 주의 (§5)
- 스타일 앵커/의상 블록 임의 변경 금지 · 실존/연예인 유사 금지 · 여성/미성년 금지 · 몸 과장 금지 · 로고 노출 금지 · 승인 전 배치 금지.
- flux 엔드포인트는 negative_prompt 미지원 → 몸 과장 방지는 positive(BODY_GUARD)로 반영.
